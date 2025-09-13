"use client";

import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const { t } = useLanguage();

  // 禁止背景滚动
  useEffect(() => {
    if (open) {
      // 保存当前的overflow值
      const originalOverflow = document.body.style.overflow;
      // 禁止滚动
      document.body.style.overflow = 'hidden';

      // 清理函数：恢复滚动
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px] p-0 border-gray-200">
        <div className="flex justify-center items-stretch md:overflow-hidden h-full">
          {/* Left side - Image */}
          <div className="flex-1 hidden md:p-8 md:flex items-center rounded-l-lg bg-gradient-to-b from-green-50 to-green-50">
            <img
              src="https://ext.same-assets.com/1155254500/3012658386.png"
              alt="onboard-bg"
              className="object-cover align-middle w-full h-auto"
              width={387}
              height={312}
            />
          </div>

          {/* Right side - Content */}
          <div className="flex-1 md:p-8 rounded-r-lg space-y-8 flex flex-col justify-center">
            <div className="space-y-2">
              <div className="bg-yellow-100 w-12 h-12 text-2xl leading-6 flex items-center justify-center rounded-xl">
                👋
              </div>
              <div className="space-y-1 font-semibold">
                <h2 className="text-lg font-semibold tracking-tight text-gray-900 leading-9">
                  {t('welcome.title')}
                </h2>
                <p className="text-sm leading-normal text-gray-600">
                  {t('welcome.subtitle')}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex space-x-2">
                <img
                  src="https://ext.same-assets.com/1155254500/579929038.svg"
                  alt="explore"
                  width={14}
                  height={14}
                />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold leading-normal">{t('welcome.features.explore.title')}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {t('welcome.features.explore.description')}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <img
                  src="https://ext.same-assets.com/1155254500/4038899619.svg"
                  alt="deposit"
                  width={14}
                  height={14}
                />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold leading-normal">{t('welcome.features.deposit.title')}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {t('welcome.features.deposit.description')}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <img
                  src="https://ext.same-assets.com/1155254500/1281020362.svg"
                  alt="trade"
                  width={14}
                  height={14}
                />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold leading-normal">{t('welcome.features.trade.title')}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {t('welcome.features.trade.description')}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <img
                  src="https://ext.same-assets.com/1155254500/216681069.svg"
                  alt="earn"
                  width={14}
                  height={14}
                />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold leading-normal">{t('welcome.features.earn.title')}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {t('welcome.features.earn.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium text-xl p-4 h-auto rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                {t('welcome.cta')}
              </Button>
              <p className="text-center text-xs leading-normal text-gray-400 max-w-[290px] mx-auto">
                {t('welcome.terms')}{" "}
                <a href="/pdf?file=terms-of-use" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline text-gray-300">
                  accept our terms
                </a>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
