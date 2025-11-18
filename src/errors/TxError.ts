// src/errors/TxError.ts
export type TxErrorCode =
  | 'SIGN_TX_ERROR'
  | 'NETWORK_OR_RPC_ERROR'
  | 'ONCHAIN_FAILURE'
  | 'EXECUTE_TX_ERROR'
  | 'UNKNOWN_EXECUTE_ERROR'
  | 'SIGN_AND_EXECUTE_ERROR'
  | 'RESERVE_GAS_ERROR'
  | 'SEND_TX_ERROR'
  | 'INIT_ZKLOGIN_ERROR';

export class TxError extends Error {
  code: TxErrorCode;
  raw?: any;

  constructor(message: string, code: TxErrorCode, raw?: any) {
    super(message);
    this.code = code;
    this.raw = raw;
  }
}
