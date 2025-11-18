import { SuiClient, SuiHTTPTransport } from "@onelabs/sui/client";
import { Transaction } from "@onelabs/sui/transactions";
import { Ed25519Keypair } from "@onelabs/sui/keypairs/ed25519";
import { getZkLoginSignature, genAddressSeed } from "@onelabs/sui/zklogin";
import { apiClient } from "@/lib/api/client";
import { jwtDecode } from "jwt-decode";
import { store } from "@/store";
import currentNetwork from "@/assets/config";
import { TxError, TxErrorCode } from "@/errors/TxError";

interface BudgetResult {
  gas_coins: { objectId: string; version: string | number; digest: string }[];
  reservation_id: string;
  sponsor_address: string;
}

export class ZkloginClient {
  private useSuiPool = currentNetwork.useGasPool;
  private budgetGas = currentNetwork.gasBudget;
  private reserveDurationSecs = currentNetwork.reserveDurationSecs;
  private transport: SuiHTTPTransport;

  constructor(private readonly suiClient: SuiClient) {
    this.suiClient = suiClient;
    this.transport = new SuiHTTPTransport({
      url: process.env.NEXT_PUBLIC_OCT_RPC_URL || "",
    });
  }

  /**
   * 统一把任意 error 转成 TxError
   */
  private toTxError(
    err: unknown,
    fallbackMessage: string,
    code: TxErrorCode,
    raw?: any
  ): TxError {
    if (err instanceof TxError) return err;

    if (err instanceof Error) {
      return new TxError(err.message || fallbackMessage, code, raw ?? err);
    }

    if (typeof err === "string") {
      return new TxError(err || fallbackMessage, code, raw ?? err);
    }

    try {
      const msg = JSON.stringify(err);
      return new TxError(msg || fallbackMessage, code, raw ?? err);
    } catch {
      return new TxError(fallbackMessage, code, raw ?? err);
    }
  }

  /**
   * 对外暴露的发送交易方法
   * - 内部会调用 zkLogin 相关逻辑
   * - 保证只抛 TxError
   */
  async sendTransaction(
    tx: Transaction,
    donotuseGasPool: boolean = false
  ): Promise<any> {
    try {
      // 初始化 zkLogin 所需数据
      const {
        zkProof,
        zkloginUserAddress,
        userSalt,
        decodedJwt,
        ephemeralKeyPairSecret,
        maxEpoch,
      } = await this.initZkliginData();

      const ephemeralKeyPair =
        Ed25519Keypair.fromSecretKey(ephemeralKeyPairSecret);

      if (this.useSuiPool && !donotuseGasPool) {
        // 走 sponsor gas 流程
        const budgetResult = await this.reserveGas(
          this.budgetGas,
          this.reserveDurationSecs
        );

        const reservationId = budgetResult.reservation_id;
        if (!reservationId) {
          throw new TxError(
            "reserve gas failed: reservation_id not found",
            "RESERVE_GAS_ERROR",
            budgetResult
          );
        }

        tx.setGasOwner(budgetResult?.sponsor_address || "");
        tx.setGasPayment(budgetResult?.gas_coins || []);
        tx.setSender(zkloginUserAddress || "");

        const { bytes, signature: userSignature } = await this.signTransaction(
          tx,
          ephemeralKeyPair
        );

        const addressSeed: string = genAddressSeed(
          BigInt(userSalt),
          "sub",
          decodedJwt.sub,
          decodedJwt.aud as string
        ).toString();

        const zkLoginSignature = getZkLoginSignature({
          inputs: {
            ...zkProof,
            addressSeed,
          },
          maxEpoch,
          userSignature,
        });

        const txBytesBase64 =
          typeof bytes === "string"
            ? bytes
            : btoa(
              String.fromCharCode(...Array.from(bytes as Uint8Array))
            );

        const executeRes = await this.executeTransaction(
          reservationId,
          txBytesBase64,
          zkLoginSignature
        );

        return executeRes;
      } else {
        // 不走 gas pool，直接链上执行
        tx.setSender(zkloginUserAddress || "");

        const { bytes, signature: userSignature } = await this.signTransaction(
          tx,
          ephemeralKeyPair
        );

        const addressSeed: string = genAddressSeed(
          BigInt(userSalt),
          "sub",
          decodedJwt.sub,
          decodedJwt.aud as string
        ).toString();

        const zkLoginSignature = getZkLoginSignature({
          inputs: {
            ...zkProof,
            addressSeed,
          },
          maxEpoch,
          userSignature,
        });

        const result = await this.signAndExecuteTransaction(
          bytes,
          zkLoginSignature
        );

        return result;
      }
    } catch (err) {
      // sendTransaction 外层统一成 SEND_TX_ERROR
      throw this.toTxError(
        err,
        "Send transaction failed",
        "SEND_TX_ERROR"
      );
    }
  }

  /**
   * 初始化 zkLogin 所需数据
   */
  async initZkliginData() {
    const zkLoginData = store.getState().zkLoginData;
    if (!zkLoginData) {
      throw new TxError("zkLogin data not found", "INIT_ZKLOGIN_ERROR");
    }

    try {
      // @ts-expect-error -- zkLoginData类型报错
      const {zkproof: zkProof, zkloginUserAddress, salt: userSalt, jwt, ephemeralKeyPairSecret, maxEpoch} = zkLoginData;

      if (!zkProof || !zkloginUserAddress || !userSalt || !jwt || !maxEpoch) {
        throw new TxError(
          "Incomplete zkLogin data",
          "INIT_ZKLOGIN_ERROR",
          zkLoginData
        );
      }

      const decodedJwt = jwtDecode(jwt) as any;
      if (!decodedJwt?.sub || !decodedJwt?.aud) {
        throw new TxError(
          "Invalid JWT data",
          "INIT_ZKLOGIN_ERROR",
          decodedJwt
        );
      }

      if (!ephemeralKeyPairSecret) {
        throw new TxError(
          "Ephemeral key pair not found",
          "INIT_ZKLOGIN_ERROR",
          zkLoginData
        );
      }

      return {
        zkProof,
        zkloginUserAddress,
        userSalt,
        decodedJwt,
        ephemeralKeyPairSecret,
        maxEpoch,
      };
    } catch (error) {
      // 无论前面是哪一步挂了，都统一成 INIT_ZKLOGIN_ERROR
      throw this.toTxError(
        error,
        "Init zkLogin data failed",
        "INIT_ZKLOGIN_ERROR"
      );
    }
  }

  /**
   * 预定 gas（走 sponsor 流程）
   */
  async reserveGas(
    gasBudget: number,
    reserveDurationSecs: number
  ): Promise<BudgetResult> {
    try {
      const { data } = await apiClient.post<{result: any}>("/api/ext/gas/reserve", {
        gas_budget: gasBudget,
        reserve_duration_secs: reserveDurationSecs,
      });

      const result = (data?.result ?? data) as BudgetResult | undefined;

      if (
        !result ||
        !Array.isArray(result.gas_coins) ||
        !result.reservation_id
      ) {
        throw new TxError(
          "Invalid reserve gas response",
          "RESERVE_GAS_ERROR",
          data
        );
      }

      return result;
    } catch (err) {
      throw this.toTxError(
        err,
        "Reserve gas failed",
        "RESERVE_GAS_ERROR"
      );
    }
  }

  /**
   * 调用 gas 池服务执行交易
   */
  async executeTransaction(
    reservationId: string,
    txBytes: string,
    zkLoginSignature: string
  ) {
    try {
      const executeRes: any = await apiClient.post(
        "/api/ext/gas/executeTx",
        {
          reservation_id: reservationId,
          tx_bytes: txBytes,
          user_sig: zkLoginSignature,
        }
      );

      const errMsg = executeRes?.data?.error;
      if (errMsg) {
        throw new TxError(
          errMsg,
          "EXECUTE_TX_ERROR",
          executeRes
        );
      }

      // 如果返回里有 effects.status，可以在这里继续做链上失败判断（可选）
      const effects = executeRes?.data?.data?.effects;
      const status = effects?.status;
      if (status?.status === "failure") {
        const msg = status.error ?? "Transaction failed";
        throw new TxError(
          msg,
          "ONCHAIN_FAILURE",
          executeRes
        );
      }

      return executeRes;
    } catch (err) {
      // 网络/服务错误统一成 NETWORK_OR_RPC_ERROR
      throw this.toTxError(
        err,
        "Network / RPC error",
        "NETWORK_OR_RPC_ERROR"
      );
    }
  }

  /**
   * 直接在链上签名并执行（不走 gas pool）
   */
  async signAndExecuteTransaction(
    txBytes: string,
    zkLoginSignature: string
  ) {
    try {
      const result = await this.suiClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: zkLoginSignature,
      });

      const effects = (result as any)?.effects;
      const status = effects?.status;
      if (status?.status === "failure") {
        const msg = status.error ?? "Transaction failed";
        throw new TxError(
          msg,
          "ONCHAIN_FAILURE",
          result
        );
      }

      return result;
    } catch (err) {
      throw this.toTxError(
        err,
        "Sign & execute failed",
        "SIGN_AND_EXECUTE_ERROR"
      );
    }
  }

  /**
   * 用临时 keypair 给 tx 签名
   */
  async signTransaction(
    tx: Transaction,
    ephemeralKeyPair: Ed25519Keypair
  ) {
    try {
      const { bytes, signature: userSignature } = await tx.sign({
        client: this.suiClient as any,
        signer: ephemeralKeyPair,
      });
      return { bytes, signature: userSignature };
    } catch (err) {
      throw this.toTxError(
        err,
        "User rejected signing",
        "SIGN_TX_ERROR"
      );
    }
  }
}
