import { useCallback } from 'react';
import { useSuiClient, useSignAndExecuteTransaction, useCurrentAccount, useSignTransaction } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import {store} from '@/store';
import { ZkloginClient } from '@/txsdk/zklogin';
import currentNetwork from '@/assets/config';
export function useExecuteTransaction() {
  const suiClient = useSuiClient();
  const signAndExecuteTransactionMutation = useSignAndExecuteTransaction();
  const { mutate: signTransaction } = useSignTransaction()
  const currentAccount = useCurrentAccount();
  const executeTransaction = useCallback(async (tx: Transaction, donotuseGasPool: boolean = false) => {
    const zkLoginData = store.getState().zkLoginData;
    if (zkLoginData) {
      const zkloginClient = new ZkloginClient(suiClient as any);
      return await zkloginClient.sendTransaction(tx, donotuseGasPool);
    } else {
      if (currentNetwork.useGasPool === 1 && !donotuseGasPool) {
        const zkloginClient = new ZkloginClient(suiClient as any);
        const budgetResult = await zkloginClient.reserveGas(currentNetwork.gasBudget, currentNetwork.reserveDurationSecs);
        tx.setSender(currentAccount?.address || '0x0')
        tx.setGasPayment(budgetResult.gas_coins)
        tx.setGasOwner(budgetResult.sponsor_address)
        tx.setGasBudget(currentNetwork.gasBudget)
        console.log(tx)
        return await new Promise((resolve, reject) => {
          signTransaction(
            { transaction: tx as any },
            {
              onSuccess: async ({ bytes, signature }: any) => {
                try {
                  const executeTxRes = await zkloginClient.executeTransaction(budgetResult.reservation_id, bytes, signature)
                  if (executeTxRes?.error) {
                    reject(new Error(executeTxRes.error))
                    return
                  }
                  if(executeTxRes?.data?.effects){
                    resolve(executeTxRes.data)
                    return
                  }
                  reject(new Error('execute transaction failed'))
                } catch (err) {
                  reject(err)
                }
              },
              onError: (error: any) => {
                reject(error)
              }
            }
          )
        })
      } else {
        return await signAndExecuteTransactionMutation.mutateAsync({
          transaction: tx as any,
        });
      }
    }
  }, [suiClient, signTransaction, currentAccount, signAndExecuteTransactionMutation]);

  return executeTransaction;
}


