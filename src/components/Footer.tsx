"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import FooterIcon1 from "@/assets/icons/footer-1.svg";
import FooterIcon2 from "@/assets/icons/footer-2.svg";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image src="/images/logo.png" alt="OnePredict" width={195} height={64} />
            </div>
          </div>

          <div className="lg:col-span-1 flex justify-center gap-[56px] pt-[18px]">
            {/* Privacy */}
            <Link href="/" className="block h-[18px] leading-[18px] text-[14px] text-white font-bold transition-colors">
              {t('footer.privacy')}
            </Link>

            {/* Terms of use */}
            <Link href="/" className="block h-[18px] leading-[18px] text-[14px] text-white font-bold transition-colors">
              {t('footer.termsOfUse')}
            </Link>

            {/* Learn */}
            <Link href="/" className="block h-[18px] leading-[18px] text-[14px] text-white font-bold transition-colors">
              {t('footer.learn')}
            </Link>

            {/* FAQ */}
            <Link href="/" className="block h-[18px] leading-[18px] text-[14px] text-white font-bold transition-colors">
              {t('footer.FAQ')}
            </Link>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center lg:items-end pt-[18px]">
            {/* Social Media */}
            <div className="flex items-center space-x-[8px]">
              <a
                href="https://twitter.com/onepredict"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center text-[14px] text-white transition-colors"
              >
                <FooterIcon1 />
              </a>
              <a
                href="https://github.com/onepredict"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center text-[14px] text-white transition-colors"
              >
                <FooterIcon2 />
              </a>
              <a
                href="https://linkedin.com/company/onepredict"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center text-[14px] text-white transition-colors"
              >
                <FooterIcon3 />
              </a>
              <a
                href="mailto:support@onepredict.com"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center text-[14px] text-white transition-colors"
              >
                <FooterIcon4 />
              </a>
              <a
                href="mailto:support@onepredict.com"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center text-[14px] text-white transition-colors"
              >
                <FooterIcon5 />
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
