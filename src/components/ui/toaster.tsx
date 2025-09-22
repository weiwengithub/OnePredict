"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      duration={2400}
      richColors
      expand
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-xl bg-[#0B1220]/90 backdrop-blur border border-white/10 text-white",
          title: "text-[14px] font-medium",
          description: "text-white/70",
          actionButton: "bg-white text-black rounded-md px-2 py-1",
          cancelButton: "bg-transparent border border-white/20 text-white rounded-md px-2 py-1",
        },
      }}
      offset="16px"
      // 跟随系统或你自己的主题：'light' | 'dark' | 'system'
      theme="system"
    />
  );
}
