import { DM_Sans, Noto_Sans_SC, Noto_Sans_TC } from 'next/font/google';

// DM Sans
export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

// Noto Sans Simplified Chinese
export const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

// Noto Sans Traditional Chinese
export const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'], // 同上
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});
