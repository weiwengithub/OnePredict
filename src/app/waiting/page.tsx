"use client";

import './index.scss'
import { useEffect, useState } from 'react'
import { Ed25519Keypair } from "@onelabs/sui/keypairs/ed25519";
import { CLIENT_ID, GET_SALT_URL, KEY_PAIR_SESSION_STORAGE_KEY, MAX_EPOCH_LOCAL_STORAGE_KEY, OCT_PROVER_ENDPOINT, RANDOMNESS_SESSION_STORAGE_KEY, REDIRECT_URI, USER_SALT_LOCAL_STORAGE_KEY } from '@/assets/config/constant';
import { SuiClient } from '@onelabs/sui/client';
import {
    genAddressSeed,
    generateNonce,
    generateRandomness,
    getExtendedEphemeralPublicKey,
    getZkLoginSignature,
    jwtToAddress,
} from "@onelabs/sui/zklogin";
import { PublicKey } from '@onelabs/sui/cryptography';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';

interface CustomJwtPayload {
  email?: string;
  sub?: string;
  [key: string]: unknown;
}
import queryString from 'query-string';
import { addPoint } from '@/lib/utils';
import axios from 'axios';
import { setZkLoginData, setIsZkLogin } from '@/store';
import Loading from '@/components/Loading';
import {useLanguage} from "@/contexts/LanguageContext";
import { useConnectWallet } from '@onelabs/dapp-kit';
import GoogleIcon from '@/assets/icons/google.svg';
import AppleIcon from '@/assets/icons/apple.svg';

interface OauthParams {
  id_token?: string;
  state?: string;
  [key: string]: unknown;
}

interface ZkLoginData {
  [key: string]: unknown;
}

const WaitingPage = () => {
  const { t } = useLanguage();
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair | null>(null);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [maxEpoch, setMaxEpoch] = useState<number>(0);
  const [randomness, setRandomness] = useState<string>('');
  const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_OCT_RPC_URL || '' });
  const [nonce, setNonce] = useState<string>('');
  const [decodedJwt, setDecodedJwt] = useState<CustomJwtPayload>();
  const [oauthParams, setOauthParams] = useState<OauthParams>();
  const [jwtString, setJwtString] = useState<string>('');
  const [zkLoginUserAddress, setZkLoginUserAddress] = useState<string>('');
  const [localZkLoginData, setLocalZkLoginData] = useState<ZkLoginData>();

  const { mutate: connect } = useConnectWallet();
  const dispatch = useDispatch();
  useEffect(() => {
    // 解析回调参数（Apple 使用 fragment/hash，Google 可能使用 query/hash 取决于设置）
    const hashParams = queryString.parse(window.location.hash);
    const queryParams = queryString.parse(window.location.search);
    // 优先使用包含 id_token 的集合
    const combined: OauthParams = { ...queryParams, ...hashParams };
    setOauthParams(combined);
  }, []);
  useEffect(() => {
    const getZkProof = async () => {
      if (oauthParams && oauthParams.id_token) {

        try {
          const decodedJwt = jwtDecode(oauthParams.id_token as string) as CustomJwtPayload;
          setJwtString(oauthParams.id_token as string);
          setDecodedJwt(decodedJwt);
          console.log('decodedJwt', JSON.stringify(decodedJwt, null, 2))
          const {data:{data:{salt}}}= await axios.post(GET_SALT_URL+(oauthParams?.state === 'google' ? 'Google' : 'Apple'), {
            jwt: oauthParams?.id_token as string,
          });
          // const salt = '235526931573292926781184150281803245819';
          console.log('salt', salt);
          const zkLoginUserAddress = jwtToAddress(oauthParams.id_token, salt);
          setZkLoginUserAddress(zkLoginUserAddress);
          console.log('zkLoginUserAddress', zkLoginUserAddress)
          const extendedEphemeralPublicKey =
            getExtendedEphemeralPublicKey(
              (Ed25519Keypair.fromSecretKey(
                window.sessionStorage.getItem(
                  KEY_PAIR_SESSION_STORAGE_KEY
                ) as string
              ))?.getPublicKey() as PublicKey
            );

          console.log('extendedEphemeralPublicKey', extendedEphemeralPublicKey)
          console.log('maxEpoch', Number(window.localStorage.getItem(
            MAX_EPOCH_LOCAL_STORAGE_KEY
          )))
          console.log('randomness', window.sessionStorage.getItem(
            RANDOMNESS_SESSION_STORAGE_KEY
          ))
          const nonce = generateNonce(
            (Ed25519Keypair.fromSecretKey(
              window.sessionStorage.getItem(
                KEY_PAIR_SESSION_STORAGE_KEY
              ) as string
            ))?.getPublicKey() as PublicKey,
            Number(window.localStorage.getItem(
              MAX_EPOCH_LOCAL_STORAGE_KEY
            )),
            window.sessionStorage.getItem(
              RANDOMNESS_SESSION_STORAGE_KEY
            ) as string
          );
          console.log('nonce', nonce)
          const zkProofResult = await axios.post(
            OCT_PROVER_ENDPOINT,
            {
              jwt: oauthParams?.id_token as string,
              extendedEphemeralPublicKey: extendedEphemeralPublicKey,
              maxEpoch: window.localStorage.getItem(
                MAX_EPOCH_LOCAL_STORAGE_KEY
              ) as string,
              jwtRandomness: window.sessionStorage.getItem(
                RANDOMNESS_SESSION_STORAGE_KEY
              ) as string,
              salt: salt,
              keyClaimName: "sub",
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const zkloginData = {
            zkproof: zkProofResult.data,
            zkloginUserAddress: zkLoginUserAddress,
            email: decodedJwt?.email,
            sub: decodedJwt?.sub,
            aud: decodedJwt?.aud,
            salt: salt,
            jwt: oauthParams?.id_token as string,
            extendedEphemeralPublicKey: extendedEphemeralPublicKey,
            ephemeralKeyPairSecret: window.sessionStorage.getItem(
              KEY_PAIR_SESSION_STORAGE_KEY
            ) as string,
            maxEpoch: window.localStorage.getItem(
              MAX_EPOCH_LOCAL_STORAGE_KEY
            ) as string,
            jwtRandomness: window.sessionStorage.getItem(
              RANDOMNESS_SESSION_STORAGE_KEY
            ) as string,
            nonce: nonce,
            provider: (oauthParams?.state as string) || 'google'
          }
          dispatch(setZkLoginData(zkloginData));
          dispatch(setIsZkLogin(true));
          debugger;
          window.location.href = '/'
        } catch (error) {
          debugger;
          window.location.href = '/'
        } finally {
        }
      }
    }
    getZkProof()
  }, [oauthParams, dispatch, nonce])
  useEffect(() => {
    const zkloginDataRaw = window.localStorage.getItem('zkloginData');
    if (zkloginDataRaw) {
      const zkloginData = JSON.parse(zkloginDataRaw);
      console.log('zkloginData', zkloginData)
      setLocalZkLoginData(zkloginData)
    }
  }, [])

  return (
    <div className='waiting-page'>
      <div className='waiting-page-content'>
        <div className='waiting-page-content-title  flex flex-center flex-middle w100'>
          <span className='fz-18 fwb cf ta w100 flex flex-col items-center gap-[10px] flex-column'>
            <Loading type='spinner'/>
            <div className="text-white text-[24px]">
              {oauthParams?.state === 'google' ? <GoogleIcon /> : <AppleIcon />}
            </div>
            <div className="text-white text-[18px] font-bold">
              {t('waiting.title', {name: oauthParams?.state === 'google' ? 'Google' : 'Apple'})}
            </div>
          </span>
        </div>
        <div className='waiting-page-content-title ta'>
        <span className='text-[14px] text-white/60'>{t('waiting.subtitle', {name: oauthParams?.state === 'google' ? 'Google' : 'Apple'})}
        </span>
        </div>
      </div>
    </div>
  );
};

WaitingPage.displayName = 'WaitingPage';

export default WaitingPage;
