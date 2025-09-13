import { useCallback, useEffect, useState } from 'react'
import googleIcon from '@/assets/icons/google.svg'
import { Ed25519Keypair } from "@onelabs/sui/keypairs/ed25519";
import { CLIENT_ID, KEY_PAIR_SESSION_STORAGE_KEY, MAX_EPOCH_LOCAL_STORAGE_KEY, OCT_PROVER_ENDPOINT, RANDOMNESS_SESSION_STORAGE_KEY, REDIRECT_URI, USER_SALT_LOCAL_STORAGE_KEY } from '@/assets/config/constant';
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
import { addPoint } from '@/assets/util';
import axios from 'axios';
import './index.scss'
import {useLanguage} from "@/contexts/LanguageContext";
export default ({onJump}: {onJump: () => void}) => {
  const { t } = useLanguage();
    const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair | null>(null);
    const [currentEpoch, setCurrentEpoch] = useState<number>(0);
    const [maxEpoch, setMaxEpoch] = useState<number>(0);
    const [randomness, setRandomness] = useState<string>('');
    const suiClient = new SuiClient({ url: process.env.UMI_APP_OCT_RPC_URL || '' });
    const [nonce, setNonce] = useState<string>('');
    const [decodedJwt, setDecodedJwt] = useState<JwtPayload>();
    const [oauthParams, setOauthParams] = useState<any>();
    const [jwtString, setJwtString] = useState<string>('');
    const [userSalt, setUserSalt] = useState<string>('');
    const [zkLoginUserAddress, setZkLoginUserAddress] = useState<string>('');
    const [zkLoginData, setZkLoginData] = useState<any>();
    useEffect(() => {
        const init = async () => {
            //保存app_lang
            let app_lang = localStorage.getItem('app_lang') || 'en-US'
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
    }, [])
    const handleGoogleLogin = useCallback(() => {
        //插件钱包断开链接
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: window.location.origin + "/waiting",
            response_type: "id_token",
            scope: "openid email",
            nonce: nonce,
        });
        const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
        // onJump()
        //小窗口打开
        // window.open(loginURL, '_blank', 'width=500,height=600');
        window.location.href = loginURL
    }, [nonce])
    return (
        <div className={'flex flex-center gap-4 google-login-btn w100 '+(nonce ? 'pointer' : 'disabled')} onClick={handleGoogleLogin} style={{ cursor: 'pointer' }}>
            <img src={googleIcon} alt="google" style={{ cursor: 'pointer' }} />
            <span className='fz-14 cf'>{t('common.connectWithGoogle')}</span>
            {
                nonce ? '':<div>loading...</div>
            }
        </div>
    )
}