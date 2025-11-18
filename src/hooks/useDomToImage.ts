'use client';

import * as htmlToImage from 'html-to-image';

type Options = {
  backgroundColor?: string;  // 默认透明；需要白底可传 '#fff'
  scale?: number;            // 清晰度倍数（默认按设备像素比）
  type?: 'png' | 'jpeg' | 'svg';
  quality?: number;          // jpeg 质量 0~1
};

export function useDomToImage() {
  async function toDataUrl(node: HTMLElement, opts: Options = {}) {
    // 等待字体加载，避免文字丢失
    if ((document as any).fonts?.ready) {
      await (document as any).fonts.ready;
    }

    const pixelRatio = opts.scale ?? (window.devicePixelRatio || 2);
    const width = node.clientWidth;
    const height = node.clientHeight;

    const common = {
      cacheBust: true,
      backgroundColor: opts.backgroundColor ?? 'transparent',
      pixelRatio,
      width: Math.max(1, Math.floor(width * pixelRatio)),
      height: Math.max(1, Math.floor(height * pixelRatio)),
      style: { transform: 'scale(1)', transformOrigin: 'top left' as const },
    };

    if (opts.type === 'jpeg') {
      return htmlToImage.toJpeg(node, { ...common, quality: opts.quality ?? 0.95 });
    }
    if (opts.type === 'svg') {
      return htmlToImage.toSvg(node, common as any);
    }
    // 默认 png
    return htmlToImage.toPng(node, common as any);
  }

  function download(dataUrl: string, filename = 'image.png') {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  return { toDataUrl, download };
}
