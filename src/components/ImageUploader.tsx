"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import apiService from "@/lib/api/services";
import axios from "axios";
import { toast } from "sonner";
import {useLanguage} from "@/contexts/LanguageContext";

interface ImageUploaderProps {
  uploadUrl?: string; // 可选：后端上传接口地址
  maxSizeMB?: number; // 文件大小限制
  showPreview?: boolean; // 是否显示本地预览
  onUploadSuccess?: (url: string) => void; // 上传成功回调
}

export default function ImageUploader({
  maxSizeMB = 5,
  showPreview = true,
  onUploadSuccess,
}: ImageUploaderProps) {
  const { t } = useLanguage();

  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB`);
      return;
    }

    // 生成本地预览
    if(showPreview) {
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploading(true);
        setProgress(0);

        abortRef.current = new AbortController();

        const res = await apiService.upload(formData, {
          signal: abortRef.current.signal,
          onUploadProgress: (evt) => {
            if (!evt.total) return;
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setProgress(percent);
          },
        });
        console.log("上传成功：", res.data);
        if (onUploadSuccess) onUploadSuccess(res.data.url)
      } catch (err: any) {
        if (axios.isCancel(err) || err?.code === "ERR_CANCELED") {
          console.log("上传已取消");
        } else {
          console.error("上传失败：", err?.message || err);
        }
      } finally {
        setUploading(false);
        setProgress(0);
        // 清空 input，便于再次选择同一个文件还能触发 onChange
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    fileInputRef.current!.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {preview ? (
        <>
          <div
            className="relative w-40 h-40 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition"
            onClick={handleSelect}
          >
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRemove}>
              Remove
            </Button>
            <Button disabled>{uploading ? "Uploading..." : "Uploaded"}</Button>
          </div>
        </>
      ) : (
        <div
          className="h-[36px] leading-[36px] border border-white/40 rounded-[24px] px-[12px] text-white text-[16px] cursor-pointer"
          onClick={handleSelect}
        >
          {t('settings.upload')} ({t('settings.max', {count: `${maxSizeMB}MB`})})
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
    </div>
  );
}
