"use client";
import { useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function useDayLabel() {
  const { t } = useLanguage();

  const dayLabel = useCallback((now: Date, target: Date) => {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000);

    if (diffDays <= 0) return "";
    if (diffDays === 1) return t("common.tomorrow");
    if (diffDays === 2) return t("common.afterTomorrow");
    return t("common.in_days", { count: diffDays });
  }, [t]);

  return dayLabel;
}
