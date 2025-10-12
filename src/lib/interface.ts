export interface ZkLoginData {
  email: string;
  ephemeralKeyPairSecret: string;
  aud: string | string[];
  salt: string;
  sub: string;
  zkproof: Record<string, unknown>;
  maxEpoch: number;
  zkloginUserAddress: string;
}

export interface CurrentAccount {
  chains: readonly string[];
  address?: string;
}

export interface RootState {
  zkLoginData: ZkLoginData | null;
  signinModal: {
    open: boolean
    openLoading: boolean
  }
}

export interface ApiResult {
  data: unknown;
}

export interface LoginResponse {
  data: unknown;
}