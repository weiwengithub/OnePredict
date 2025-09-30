

export const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || ""

export const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || "";

export const GET_SALT_URL = process.env.NEXT_PUBLIC_GET_SALT_URL || ""


export const KEY_PAIR_SESSION_STORAGE_KEY = "rwa_ephemeral_key_pair";

export const USER_SALT_LOCAL_STORAGE_KEY = "rwa_user_salt_key_pair";

export const RANDOMNESS_SESSION_STORAGE_KEY = "rwa_randomness_key_pair";

export const MAX_EPOCH_LOCAL_STORAGE_KEY = "rwa_max_epoch_key_pair";

export const ZKLOGIN_EXPIRE_END = 'rwa_zklogin_expire_end';

export const ZKLOGIN_EXPIRE_DAY = 10;


//OCT
export const OCT_RPC_URL = process.env.NEXT_PUBLIC_OCT_RPC_URL || "";


export const OCT_PROVER_ENDPOINT = process.env.NEXT_PUBLIC_OCT_PROVER_ENDPOINT || "";

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000'
