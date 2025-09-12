"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-[#04122B] border-t border-white/10 mt-[70px]">
      <div className="max-w-[1728px] mx-auto px-[40px] py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image src="/images/logo.png" alt="OnePredict" width={195} height={64} />
            </div>
          </div>

          <div className="lg:col-span-1 flex justify-center gap-[56px]">
            {/* Marketplace */}
            <div>
              <h3 className="h-[21px] text-[16px] text-white font-bold mb-[34px]">{t('footer.marketplace')}</h3>
              <div className="space-y-3">
                <Link href="/" className="block text-white/70 hover:text-white text-sm transition-colors">
                  {t('footer.market')}
                </Link>
              </div>
            </div>

            {/* Help & Support */}
            <div>
              <h3 className="h-[21px] text-[16px] text-white font-bold mb-[34px]">{t('footer.faq')}</h3>
              <div className="space-y-[14px]">
                <Link href="/" className="block text-white/60 hover:text-white text-[14px] transition-colors">
                  {t('footer.faq')}
                </Link>
                <Link href="/" className="block text-white/60 hover:text-white text-[14px] transition-colors">
                  {t('footer.documentation')}
                </Link>
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="h-[21px] text-[16px] text-white font-bold mb-[34px]">{t('footer.about')}</h3>
              <div className="space-y-3">
                <Link href="/" className="block text-white/70 hover:text-white text-sm transition-colors">
                  {t('footer.exploreProjects')}
                </Link>
                <Link href="/" className="block text-white/70 hover:text-white text-sm transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center lg:items-end">
            {/* Social Media */}
            <div className="flex items-center space-x-[8px]">
              <a
                href="https://twitter.com/onepredict"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center transition-colors"
              >
                <Image src="/images/icon/icon-1.png" alt="OnePredict" width={15} height={14} />
              </a>
              <a
                href="https://github.com/onepredict"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center transition-colors"
              >
                <Image src="/images/icon/icon-2.png" alt="OnePredict" width={14} height={9} />
              </a>
              <a
                href="https://linkedin.com/company/onepredict"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center transition-colors"
              >
                <Image src="/images/icon/icon-3.png" alt="OnePredict" width={14} height={11} />
              </a>
              <a
                href="mailto:support@onepredict.com"
                className="w-[36px] h-[36px] border border-white/10 rounded-full flex items-center justify-center transition-colors"
              >
                <Image src="/images/icon/icon-4.png" alt="OnePredict" width={14} height={13} />
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
