'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as htmlToImage from 'html-to-image';
import QRCode from 'qrcode';

type Props = {
  labels: {
    title: string;
    type: string;
    all: string;
    join: string;
    code: string;
  };
  value: number;
  rank: number;
  inviteCode: string;
  avatar: string;
  qrcodeText?: string;
  onReady?: (dataUrl: string) => void;
};

export default function RankCardImageOnly({ labels, value, rank, inviteCode, avatar, qrcodeText, onReady }: Props) {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [renderHidden, setRenderHidden] = useState(true); // 生成完就卸载隐藏 DOM

  function corsProxy(url: string) {
    try {
      const u = new URL(url);
      // wsrv.nl 规则：?url=ssl:host/path?query   （ssl: 表示 https）
      return `https://images.weserv.nl/?url=ssl:${u.host}${u.pathname}${u.search}`;
    } catch {
      return url;
    }
  }

  const avatarSrc = useMemo(() => corsProxy(avatar), [avatar]);

  // 等待隐藏容器里的 <img> 都加载完成，避免生成空白
  const waitImages = async (node: HTMLElement) => {
    const imgs = Array.from(node.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve(true);
        return new Promise((resolve) => {
          const onLoad = () => {
            cleanup();
            resolve(true);
          };
          const onError = () => {
            cleanup();
            resolve(true);
          };
          const cleanup = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
          };
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onError);
        });
      })
    );
  };

  // 先生成二维码 dataURL
  useEffect(() => {
    let isMounted = true;
    const genQR = async () => {
      try {
        const text =
          qrcodeText ||
          (() => {
            // 默认二维码内容：当前域名 + ?code=xxx
            if (typeof window === 'undefined') return `invite:${inviteCode}`;
            const origin = window.location.origin;
            return `${origin}/?code=${encodeURIComponent(inviteCode)}`;
          })();

        // 生成高清二维码：width 越大越清晰（组件里我们显示在 ~145px 左右，这里生成 512 够用）
        const dataUrl = await QRCode.toDataURL(text, {
          errorCorrectionLevel: 'M',
          width: 512,
          margin: 1, // 留少量边距
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        if (isMounted) setQrSrc(dataUrl);
      } catch (e) {
        console.error('二维码生成失败：', e);
        if (isMounted) setQrSrc(null);
      }
    };
    genQR();
    return () => {
      isMounted = false;
    };
  }, [inviteCode, qrcodeText]);

  // 再把整个卡片转成图片
  useEffect(() => {
    const gen = async () => {
      if (!hiddenRef.current) return;
      // 必须等二维码也准备好
      if (!qrSrc) return;

      // 1) 等字体
      if ((document as any).fonts?.ready) {
        try {
          await (document as any).fonts.ready;
        } catch {}
      }
      // 2) 等图片（包含二维码 dataURL）
      await waitImages(hiddenRef.current);

      // 3) 生成
      const node = hiddenRef.current;
      const png = await htmlToImage.toPng(node, {
        cacheBust: true,
        backgroundColor: '#F0F5F9',
        pixelRatio: 1,
        width: node.clientWidth,
        height: node.clientHeight,
        style: { transform: 'scale(1)', transformOrigin: 'top left' as const },
      });

      setSrc(png);
      onReady?.(png);
      // 4) 清理：卸载隐藏 DOM，只保留 <img>
      setRenderHidden(false);
    };

    gen().catch((err) => {
      console.error('生成失败：', err);
      setRenderHidden(false);
    });
  }, [qrSrc, onReady]);

  return (
    <>
      {renderHidden && (
        // 隐藏容器：不可见但会参与布局（display:none 会导致测量为 0）
        <div
          style={{
            position: 'fixed',
            left: -10000, // 放到视窗外
            top: 0,
            pointerEvents: 'none',
            opacity: 0,
          }}
        >
          <div ref={hiddenRef} className="w-[1280px] h-[1280px] pt-[83px] bg-[#F0F5F9] relative">
            <div className="pl-[83px] h-[84px] leading-[84px] text-[96px] text-[#DDE2E6] font-bold">{labels.title}</div>
            <div className="mt-[40px] ml-[92px] w-[1096px] relative">
              <img src={value < 0 ? '/images/ranking/loss.png?v=1' : '/images/ranking/profit.png?v=1'} alt="" className="w-full" />
              <div className="absolute top-0 left-0 w-full h-full pt-[32px]">
                <div className="h-[84px] pl-[30px] flex items-center gap-[14px]">
                  <img src="/images/ranking/logo.png?v=1" alt="" />
                  <span className="h-[84px] leading-[84px] text-[55px] text-white">OnePredict</span>
                </div>
                <div className="mt-[29px] pl-[42px] h-[84px] leading-[84px] text-[55px] text-white">{labels.type}</div>
                <div className="-mt-[4px] pl-[38px] h-[84px] leading-[84px] text-[55px] text-white font-bold">{value}</div>
                <div className="mt-[28px] mx-auto w-[1013px] h-[616px] bg-white rounded-[42px] px-[83px]">
                  <div className="pt-[72px] mx-auto w-[483px] relative">
                    <img src="/images/ranking/ranking.png?v=1" alt="" className="w-full" />
                    <div className="absolute top-[76px] left-0 w-full h-full">
                      <div className="h-[166px] leading-[166px] text-[166px] text-black font-bold text-center">{rank}</div>
                      <div className="mt-[8px] h-[55px] leading-[55px] text-[34px] text-black/30 font-bold text-center">{labels.all}</div>
                    </div>
                  </div>
                  <div className="mt-[74px] border-t border-black/10"></div>
                  <div className="mt-[38px] flex gap-[42px]">
                    {/* 用生成的二维码 dataURL */}
                    {qrSrc && <img src={qrSrc} alt="qrcode" className="w-[145px] h-[145px] object-contain" />}
                    <div className="space-y-[14px]">
                      <div className="h-[28px] leading-[28px] text-[28px] text-black font-bold">{labels.join}</div>
                      <div className="h-[28px] leading-[28px] text-[28px] text-black/60 font-bold">{labels.code}</div>
                      <div className="h-[69px] leading-[69px] text-[62px] text-[#FF9500] font-bold">{inviteCode}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 用户头像 */}
            <div className="absolute top-[83px] right-[83px] w-[145px] h-[145px] rounded-full overflow-hidden">
              {avatar ? (
                <img src={avatarSrc} alt="" className="w-full h-full" crossOrigin="anonymous" />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-[#D9E5FA] to-[#F3E1F5]"></div>
              )}
            </div>
          </div>
        </div>
      )}

      {src ? (
        <img src={src} alt="rank-card" className="block w-full" />
      ) : (
        <div
          className="w-full h-full rounded-lg bg-white/10 z-20 inset-0 animate-shimmer"
          style={{
            backgroundImage: `linear-gradient(100deg,transparent 0%,rgba(255,255,255,0.15) 40%,rgba(255,255,255,0.3) 50%,transparent 60%)`,
            backgroundSize: "220% 100%",
            animationDuration: "1800ms"
          }}
        />
      )}
    </>
  );
}
