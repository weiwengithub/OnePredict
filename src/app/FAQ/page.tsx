"use client";

import React, {useState, useEffect, useRef, useCallback, useMemo} from "react";
import Avatar from 'boring-avatars';
import MobileNavigation from "@/components/MobileNavigation";
import Link from 'next/link';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {useLanguage} from "@/contexts/LanguageContext";
import {useIsMobile} from "@/contexts/viewport";
import apiService from "@/lib/api/services";
import {toast} from "sonner";
import {string} from "valibot";
import {QuestionSection} from "@/lib/api/interface";
import {getLanguageLabel} from "@/lib/utils";
import EllipsisWithTooltip from "@/components/EllipsisWithTooltip";

export default function FAQ() {
  const { language, t } = useLanguage();
  const isMobile = useIsMobile();

  const calledOnceRef = useRef(false);
  const [questions, setQuestions] = useState<Record<string, QuestionSection> | null>(null);
  const getData = useCallback(async () => {
    const controller = new AbortController();

    try {
      const {data} = await apiService.getQuestionAllTitle({lang: language});
      setQuestions(data)
    } catch (e: any) {
      if (e.name !== 'CanceledError') {
        console.log(e);
      }
    }

    // 卸载时取消请求并阻止 setState
    return () => {
      controller.abort();
    };
  }, [language]);
  useEffect(() => {
    calledOnceRef.current = true;

    getData()
  }, [getData, language]);

  const getCategory = (category: string) => {
    let result = "";
    switch (category) {
      case "快速入门":
        result = t("doc.quickStart");
        break;
      case "账户与安全":
        result = t("doc.accountSecurity");
        break;
      case "功能与教程":
        result = t("doc.featuresTutorials");
        break;
      case "常见问题":
        result = t("doc.frequentlyAskedQuestions");
        break;
      default:
        result = category;
    }
    return result;
  }

  return (
    <div className={`min-h-screen bg-[#051A3D] ${isMobile ? 'pb-20' : ''}`}>
      {/* Header */}
      {isMobile ? (
        <MobileNavigation
          activeCategory=""
          onCategoryChange={() => {}}
        />
      ) : (
        <Header currentPage="details" />
      )}

      {/* Main Content */}
      <main className={isMobile ? 'w-full p-[24px]' : 'max-w-[860px] min-h-[calc(100vh-332px)] mx-auto px-4 py-8'}>
        <h1 className="text-white text-2xl font-bold mb-4 break-words">
          {t('footer.FAQ')}
        </h1>
        <div className="mt-[36px] grid grid-cols-1 sm:grid-cols-2 gap-x-[80px] gap-y-[48px]">
          {questions && Object.entries(questions).map(([category, info]) => (
            <section key={category} className="rounded-[16px]">
              <h2 className="text-lg font-bold text-white mb-2">
                {getCategory(category)}
              </h2>

              <div className="space-y-1">
                {info.titles.map((title, index) => (
                  <Link key={index} href={`/faqDetails?category=${category}&index=${index}`} className="block h-[48px] leading-[48px] text-white/60 hover:text-white border-b border-white/20 px-[12px] cursor-pointer">
                    <EllipsisWithTooltip
                      text={title}
                      className=""
                    />
                  </Link>
                ))}
              </div>
              {info.total > 6 && (
                <Link href={`/faqDetails?category=${category}`} className="block h-[48px] leading-[48px] text-[#477CFC] cursor-pointer">
                  {t('doc.viewAll', { total: info.total })}
                </Link>
              )}
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      {!isMobile && <Footer />}
    </div>
  );
}
