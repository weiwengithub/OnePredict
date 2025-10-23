"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import apiService from "@/lib/api/services";
import { toast } from "sonner";

interface ImageUploaderProps {
  uploadUrl?: string; // 可选：后端上传接口地址
  maxSizeMB?: number; // 文件大小限制
  onUploadSuccess?: (url: string) => void; // 上传成功回调
}

export default function ImageUploader({
                                        uploadUrl = "/ext/common/upload",
                                        maxSizeMB = 5,
                                        onUploadSuccess,
                                      }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // 上传到后端
    if (uploadUrl) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        // const res = await fetch(uploadUrl, {
        //   method: "POST",
        //   body: formData,
        // });
        const res = await apiService.upload(formData, {});
        console.log(res)
        // const data = await res.json();
        //
        // if (res.ok && data.url) {
        //   toast.success("Upload successful!");
        //   onUploadSuccess?.(data.url);
        //   setPreview(data.url); // 替换为后端返回的最终URL
        // } else {
        //   throw new Error(data.message || "Upload failed");
        // }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    fileInputRef.current!.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="relative w-40 h-40 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition"
        onClick={handleSelect}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            sizes="160px"
          />
        ) : (
          <span className="text-gray-400 text-sm text-center px-3">
            Click to upload image
          </span>
        )}
      </div>

      {preview && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRemove}>
            Remove
          </Button>
          <Button disabled>{uploading ? "Uploading..." : "Uploaded"}</Button>
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
