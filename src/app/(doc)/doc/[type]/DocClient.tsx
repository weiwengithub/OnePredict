"use client";

import React, { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/contexts/viewport";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import apiService from "@/lib/api/services";

export default function DocClient({ type }: { type: string }) {
  const isMobile = useIsMobile();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!type) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    (async () => {
      try {
        const { data } = await apiService.getArticleDetail({ type });
        setTitle((data as any)?.title || "");
        setContent((data as any)?.content || "");
      } catch (e: any) {
        if (e?.name === 'AbortError' || e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
    return () => controller.abort();
  }, [type]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051A3D] via-[#0D2347] to-[#051A3D] pb-20 md:pb-0">
      {isMobile ? (
        <MobileNavigation activeCategory="" onCategoryChange={() => {}} />
      ) : (
        <Header currentPage="details" />
      )}

      <main className="max-w-[860px] mx-auto px-4 py-8">
        {title && (
          <h1 className="text-white text-2xl font-bold mb-4 break-words">{title}</h1>
        )}
        <article
          className="prose prose-invert max-w-none text-white"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>

      {!isMobile && <Footer />}
    </div>
  );
}


