"use client";

import React from "react";
import Link from "next/link";

interface TermsAgreementProps {
  className?: string;
}

export default function TermsAgreement({ className = "" }: TermsAgreementProps) {
  return (
    <div className={`mt-[12px] text-center ${className}`}>
      <p className="h-[24px] leading-[24px] text-[16px] text-white/60 font-bold">
        By trading, you agree to the
        <Link
          href="/terms"
          className="ml-1 hover:text-white underline"
        >
          Terms of Use
        </Link>
      </p>
    </div>
  );
}
