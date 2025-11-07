"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import FooterIconT from "@/assets/icons/footer-6.svg";
import FooterIconX from "@/assets/icons/footer-2.svg";
import FooterIcon3 from "@/assets/icons/footer-3.svg";
import FooterIcon4 from "@/assets/icons/footer-4.svg";
import FooterIcon5 from "@/assets/icons/footer-5.svg";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-[#04122B] border-t border-white/10 mt-[70px]">
      <div className="max-w-[1728px] mx-auto px-[40px] py-[37px]">
        {/* Main Footer Content */}
        <div className="grid grid-cols-[auto_1fr] md:grid-cols-[1fr_auto_1fr] gap-8 mb-8">
          {/* Company Info */}
          <div className="hidden md:block">
            <div className="mb-6">
              <Image src="/images/logo.png?v=1" alt="OnePredict" width={195} height={64} />
            </div>
          </div>

          <div className="flex justify-center gap-[56px] pt-[18px]">
            {/* Privacy */}
            <Link href="/doc/privacy" className="block h-[18px] leading-[18px] text-[14px] text-white font-bold transition-colors">
              {t('footer.privacy')}
            </Link>

            {/* Terms of use */}
            <Link href="/doc/items" className="block h-[18px] leading-[18px] text-[14px] text-white font-bold transition-colors">
              {t('footer.termsOfUse')}
            </Link>

            {/* Learn */}
            <Link href="/doc/about" className="block h-[18px] leading-[18px] text-[14px] text-white font-bold transition-colors">
              {t('footer.learn')}
            </Link>

            {/* FAQ */}
            <Link href="/doc/faq" className="block h-[18px] leading-[18px] text-[14px] text-white font-bold transition-colors">
              {t('footer.FAQ')}
            </Link>
          </div>

          <div className="flex flex-col items-end pt-[18px]">
            {/* Social Media */}
            <div className="flex items-center space-x-[8px]">
              <a
                href="https://t.me/onePredict"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center text-[14px] text-white transition-colors"
              >
                <FooterIconT />
              </a>
              <a
                href="https://x.com/OPredict54879"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center text-[14px] text-white transition-colors"
              >
                <FooterIconX />
              </a>
            </div>
            {/* Copyright */}
            <div className="mt-[16px] text-white text-[14px]">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
