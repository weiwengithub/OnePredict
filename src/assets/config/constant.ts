

export const CLIENT_ID = process.env.UMI_APP_CLIENT_ID || "109304040919-r9dpaeg4036p4cb4s045ofjv71m833p0.apps.googleusercontent.com"

export const REDIRECT_URI = process.env.NODE_ENV === 'development' ? "http://localhost:8082/waiting" : "https://poly.deltax.online/waiting";

export const GET_SALT_URL = process.env.UMI_APP_GET_SALT_URL || 'https://salt.deltax.online/api/userSalt/'


export const KEY_PAIR_SESSION_STORAGE_KEY = "rwa_ephemeral_key_pair";

export const USER_SALT_LOCAL_STORAGE_KEY = "rwa_user_salt_key_pair";

export const RANDOMNESS_SESSION_STORAGE_KEY = "rwa_randomness_key_pair";

export const MAX_EPOCH_LOCAL_STORAGE_KEY = "rwa_max_epoch_key_pair";

export const ZKLOGIN_EXPIRE_END = 'rwa_zklogin_expire_end';

export const ZKLOGIN_EXPIRE_DAY = 10;


//OCT
export const OCT_RPC_URL = process.env.UMI_APP_OCT_RPC_URL || 'https://rpc-mainnet.onelabs.cc:443';


export const OCT_PROVER_ENDPOINT = process.env.UMI_APP_OCT_PROVER_ENDPOINT || 'https://zkprover.deltax.online/v1';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000'
