"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Confirm(message: string, options?: { title?: string }) {
  return new Promise<boolean>((resolve) => {
    toast.custom(
      (t) => (
        <ConfirmToastContent
          id={t}
          message={message}
          title={options?.title}
          onResult={(result) => {
            resolve(result);
            toast.dismiss(t); // 关闭当前 toast
          }}
        />
      ),
      {
        duration: Infinity,
      },
    );
  });
}

type ConfirmToastContentProps = {
  id: string | number;
  title?: string;
  message: string;
  onResult: (result: boolean) => void;
};

function ConfirmToastContent({ title, message, onResult }: ConfirmToastContentProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      onResult(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onResult(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-[16px] bg-[#051A3D] p-[24px] shadow-lg">
      {title && <div className="text-[24px] text-white font-bold">{title}</div>}
      <div className="leading-[24px] text-[16px] text-white/80">{message}</div>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCancel}
          className="rounded-md border border-[#E0E2E4] px-3 py-1 text-xs text-[#E0E2E4] hover:bg-[#E0E2E4] hover:text-[#010101]"
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="rounded-md bg-[#467DFF] px-3 py-1 text-xs text-[#E0E2E4] hover:opacity-80 disabled:opacity-60"
        >
          {loading ? t("common.processing") : t("common.confirm")}
        </button>
      </div>
    </div>
  );
}
