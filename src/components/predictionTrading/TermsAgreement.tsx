"use client";

import React from "react";
import Link from "next/link";
import {useLanguage} from "@/contexts/LanguageContext";

interface TermsAgreementProps {
  className?: string;
}

export default function TermsAgreement({ className = "" }: TermsAgreementProps) {
  const { t } = useLanguage();

  return (
    <div className={`mt-[12px] text-center ${className}`}>
      <p className="h-[24px] leading-[24px] text-[16px] text-white/60 font-bold">
        {t('predictions.trading')}
        <Link
          href="/terms"
          className="ml-1 hover:text-white underline"
        >
          {t('predictions.terms')}
        </Link>
      </p>
    </div>
  );
}
