import { useCallback, useEffect, useState, useMemo } from 'react'
import { Ed25519Keypair } from "@onelabs/sui/keypairs/ed25519";
import { CLIENT_ID, KEY_PAIR_SESSION_STORAGE_KEY, MAX_EPOCH_LOCAL_STORAGE_KEY, RANDOMNESS_SESSION_STORAGE_KEY } from '@/assets/config/constant';
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
import { JwtPayload, jwtDecode } from 'jwt-decode';
import queryString from 'query-string';
import { addPoint } from '@/lib/utils';
import axios from 'axios';
import './index.scss'
import {useLanguage} from "@/contexts/LanguageContext";
import GoogleIcon from '@/assets/icons/google.svg';
import AppleIcon from '@/assets/icons/apple.svg';

interface OauthParams {
  [key: string]: string;
}

interface ZkLoginData {
  [key: string]: unknown;
}

const Zklogin = ({onJump}: {onJump: () => void}) => {
  const { t } = useLanguage();
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair | null>(null);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [maxEpoch, setMaxEpoch] = useState<number>(0);
  const [randomness, setRandomness] = useState<string>('');
  const suiClient = useMemo(() => new SuiClient({ url: process.env.NEXT_PUBLIC_OCT_RPC_URL || '' }), []);
  const [nonce, setNonce] = useState<string>('');
  const [decodedJwt, setDecodedJwt] = useState<JwtPayload>();
  const [oauthParams, setOauthParams] = useState<OauthParams>();
  const [jwtString, setJwtString] = useState<string>('');
  const [userSalt, setUserSalt] = useState<string>('');
  const [zkLoginUserAddress, setZkLoginUserAddress] = useState<string>('');
  const [zkLoginData, setZkLoginData] = useState<ZkLoginData>();
  useEffect(() => {
    const init = async () => {
      //保存app_lang
      const app_lang = localStorage.getItem('app_lang') || 'en-US'
      localStorage.clear()
      sessionStorage.clear()
      localStorage.setItem('app_lang', app_lang)
      const ephemeralKeyPair = Ed25519Keypair.generate();
      window.sessionStorage.setItem(
        KEY_PAIR_SESSION_STORAGE_KEY,
        ephemeralKeyPair.getSecretKey()
      );
      setEphemeralKeyPair(ephemeralKeyPair);
      const { epoch } = await suiClient.getLatestSuiSystemState();
      setCurrentEpoch(Number(epoch));
      window.localStorage.setItem(
        MAX_EPOCH_LOCAL_STORAGE_KEY,
        String(Number(epoch) + 10)
      );
      setMaxEpoch(Number(epoch) + 10);
      const randomness = generateRandomness();
      window.sessionStorage.setItem(
        RANDOMNESS_SESSION_STORAGE_KEY,
        randomness
      );
      if (!ephemeralKeyPair) {
        return;
      }
      const nonce = generateNonce(
        ephemeralKeyPair.getPublicKey() as PublicKey,
        Number(epoch) + 10,
        randomness
      );
      setNonce(nonce)
    }
    init()
  }, [suiClient])
  const handleGoogleLogin = useCallback(() => {
    //插件钱包断开链接
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: `${window.location.origin}/waiting`,
      response_type: "id_token",
      scope: "openid email",
      nonce: nonce,
      state: 'google',
    });
    const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    // onJump()
    //小窗口打开
    // window.open(loginURL, '_blank', 'width=500,height=600');
    window.location.href = loginURL
  }, [nonce])
  const handleAppleLogin = useCallback(() => {
    //插件钱包断开链接
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/waiting`,
      response_type: "code id_token",
      response_mode: "fragment",
      // scope: "email",
      nonce: nonce,
      state: 'apple',
    });
    const loginURL = `https://appleid.apple.com/auth/authorize?${params}`;
    window.location.href = loginURL
  }, [nonce])
  return (
    <div className="flex gap-[16px] w100">
      <div
        className={`flex-1 h-[46px] flex items-center justify-center bg-[#04122B] border border-white/20 rounded-[16px] text-white/60 hover:text-white ${nonce ? 'cursor-pointer' : 'disabled'}`}
        onClick={handleGoogleLogin}
      >
        <GoogleIcon />
        <span className='ml-[8px] leading-[16px] text-[12px]'>{t('common.connectWithGoogle')}</span>
      </div>
      <div
        className={`flex-1 h-[46px] flex items-center justify-center bg-[#04122B] border border-white/20 rounded-[16px] text-white/60 hover:text-white ${nonce ? 'cursor-pointer' : 'disabled'}`}
        onClick={handleAppleLogin}
      >
        <AppleIcon />
        <span className='ml-[8px] leading-[16px] text-[12px]'>{t('common.connectWithApple')}</span>
      </div>
    </div>
  )
};

Zklogin.displayName = 'Zklogin';

export default Zklogin;
