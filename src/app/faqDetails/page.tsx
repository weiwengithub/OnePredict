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
import {useSearchParams} from "next/navigation";
import EllipsisWithTooltip from "@/components/EllipsisWithTooltip";

export default function FaqDetails() {
  const { language, t } = useLanguage();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") as string;
  const index = searchParams.get("index") as string;

  const calledOnceRef = useRef(false);
  const [menus, setMenus] = useState<string[]>([]);
  const [content, setContent] = useState<string>("");
  const [currentMenu, setCurrentMenu] = useState(index ? Number(index) : 0);

  const getContent = useCallback(async (title: string) => {
    const controller = new AbortController();

    try {
      const {data} = await apiService.getQuestionContent({category, title, lang: language});
      setContent(data.content || "");
    } catch (e: any) {
      if (e.name !== 'CanceledError') {
        console.log(e);
      }
    }

    // 卸载时取消请求并阻止 setState
    return () => {
      controller.abort();
    };
  }, [category, language]);

  const getMenus = useCallback(async () => {
    const controller = new AbortController();

    try {
      const {data} = await apiService.getQuestionTitleByParams({category, lang: language});
      console.log(data)
      setMenus(data)
      if(data.length > 0) getContent(data[currentMenu])
    } catch (e: any) {
      if (e.name !== 'CanceledError') {
        console.log(e);
      }
    }

    // 卸载时取消请求并阻止 setState
    return () => {
      controller.abort();
    };
  }, [category, getContent, language]);

  useEffect(() => {
    calledOnceRef.current = true;

    getMenus()
  }, [getMenus, language]);

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
      <main className={isMobile ? 'w-full p-[24px]' : 'max-w-[1020px] min-h-[calc(100vh-332px)] mx-auto py-8'}>
        <h1 className="text-white text-2xl font-bold mb-4 break-words">
          <Link href="/FAQ">{t('footer.FAQ')}</Link> / {getCategory(category)}
        </h1>
        <div className="mt-[36px] flex gap-x-[60px]">
          <div className="w-[240px]">
            <h2 className="text-lg font-bold text-white mb-2">
              {getCategory(category)}
            </h2>
            {menus.map((menu, index) => (
              <div
                key={index}
                onClick={() => {
                  setCurrentMenu(index);
                  getContent(menu)
                }}
                className={`leading-[24px] text-[16px] ${index === currentMenu ? 'text-white' : 'text-white/60 hover:text-white'} py-[12px] cursor-pointer`}
              >
                {menu}
              </div>
            ))}
          </div>
          <article
            className="flex-1 overflow-x-hidden overflow-y-auto prose prose-invert max-w-none text-white"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </main>

      {/* Footer */}
      {!isMobile && <Footer />}
    </div>
  );
}
