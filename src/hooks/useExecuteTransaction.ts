import { useCallback } from 'react';
import { useSuiClient, useSignAndExecuteTransaction, useCurrentAccount, useSignTransaction } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import {store} from '@/store';
import { ZkloginClient } from '@/txsdk/zklogin';
import currentNetwork from '@/assets/config';
import i18n from '@/lib/i18n'
import { TxError } from "@/errors/TxError";

export function useExecuteTransaction() {
  const suiClient = useSuiClient();
  const signAndExecuteTransactionMutation = useSignAndExecuteTransaction();
  const { mutate: signTransaction } = useSignTransaction()
  const currentAccount = useCurrentAccount();
  const executeTransaction = useCallback(
    async (tx: Transaction, donotuseGasPool: boolean = false) => {
      const zkLoginData = store.getState().zkLoginData;
      if (zkLoginData) {
        const zkloginClient = new ZkloginClient(suiClient as any);
        return await zkloginClient.sendTransaction(tx, donotuseGasPool);
      } else {
        if (currentNetwork.useGasPool === 1 && !donotuseGasPool) {
          const zkloginClient = new ZkloginClient(suiClient as any);
          const budgetResult = await zkloginClient.reserveGas(
            currentNetwork.gasBudget,
            currentNetwork.reserveDurationSecs
          );

          tx.setSender(currentAccount?.address || '0x0');
          tx.setGasPayment(budgetResult.gas_coins);
          tx.setGasOwner(budgetResult.sponsor_address);
          tx.setGasBudget(currentNetwork.gasBudget);

          return await new Promise((resolve, reject) => {
            signTransaction(
              { transaction: tx as any },
              {
                onSuccess: async ({ bytes, signature }: any) => {
                  try {
                    const executeTxRes = await zkloginClient.executeTransaction(
                      budgetResult.reservation_id,
                      bytes,
                      signature
                    );

                    if (executeTxRes?.error) {
                      return reject(
                        new TxError(
                          executeTxRes.error,
                          'EXECUTE_TX_ERROR',
                          executeTxRes
                        )
                      );
                    }

                    const effects = executeTxRes?.data?.effects;
                    const status = effects?.status;

                    if (status?.status === 'failure') {
                      const errMsg = status.error ?? 'Transaction failed';
                      return reject(
                        new TxError(
                          errMsg,
                          'ONCHAIN_FAILURE',
                          executeTxRes
                        )
                      );
                    }

                    if (effects) {
                      return resolve(executeTxRes);
                    }

                    return reject(
                      new TxError('execute transaction failed', 'UNKNOWN_EXECUTE_ERROR', executeTxRes)
                    );
                  } catch (err: any) {
                    return reject(
                      new TxError(
                        err?.message || 'Network / RPC error',
                        'NETWORK_OR_RPC_ERROR',
                        err
                      )
                    );
                  }
                },
                onError: (error: any) => {
                  return reject(
                    new TxError(
                      error?.message || 'User rejected signing',
                      'SIGN_TX_ERROR',
                      error
                    )
                  );
                },
              }
            );
          });
        } else {
          try {
            return await signAndExecuteTransactionMutation.mutateAsync({
              transaction: tx as any,
            });
          } catch (err: any) {
            throw new TxError(
              err?.message || 'Sign & execute failed',
              'SIGN_AND_EXECUTE_ERROR',
              err
            );
          }
        }
      }
    },
    [suiClient, signTransaction, currentAccount, signAndExecuteTransactionMutation]
  );

  return executeTransaction;
}

export function getReadableTxError(err: any): string {
  if (err instanceof TxError) {
    const e = err as TxError;

    switch (e.code) {
      case 'SIGN_TX_ERROR':
        // 钱包拒绝签名、钱包内部错误
        if (e.raw?.code === 4001 || /User rejected/i.test(e.message)) {
          return i18n.t('errorMessage.youHaveCancelled');
        }
        return i18n.t('errorMessage.walletSignatureFailed');

      case 'NETWORK_OR_RPC_ERROR':
        return i18n.t('errorMessage.networkError');

      case 'ONCHAIN_FAILURE': {
        const msg = e.message || '';
        // 根据常见的 Sui / Move 报错关键字做精准提示
        if (/MoveAbort/i.test(msg) && /insufficient.*balance/i.test(msg)) {
          return i18n.t('errorMessage.insufficientBalance');
        }
        if (/MoveAbort/i.test(msg) && /EAlreadyVoted/i.test(msg)) {
          return i18n.t('errorMessage.youHaveAlready');
        }
        if (/Execution reverted/i.test(msg)) {
          return i18n.t('errorMessage.contractExecution');
        }
        // 没识别出来就直接透出原始信息
        return `${i18n.t('errorMessage.transactionExecution')}${msg}`;
      }

      case 'EXECUTE_TX_ERROR':
        return `${i18n.t('errorMessage.transactionExecution')}${e.message}`;

      case 'SIGN_AND_EXECUTE_ERROR':
        return `${i18n.t('errorMessage.transactionSubmission')}${e.message}`;

      default:
        return e.message || i18n.t('errorMessage.unknownError');
    }
  }

  // 兜底：不是 TxError 的情况
  if (typeof err === 'string') return err;

  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as any).message === "string"
  ) {
    return (err as any).message;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return i18n.t('errorMessage.unknownError');
  }
}
