"use client";

import React, {useCallback, useState} from "react";
import apiService from "@/lib/api/services";
import Image from "next/image";

type CollectingProps = {
  /** 是否已收藏 */
  collecting?: boolean;
  /** 关注类型 */
  followType: 'People' | 'Project';
  /** 项目或用户ID */
  followId: number;
};

export default function Collecting({collecting, followType, followId}: CollectingProps) {
  const [isCollecting, setIsCollecting] = useState(collecting)

  const addCollect = useCallback(
    async () => {
      const res = await apiService.addMemberFollow(followType, followId);
      console.log(res)
      setIsCollecting(true)
    },
    [followType, followId]
  );

  const delCollect = useCallback(
    async () => {
      const res = await apiService.delMemberFollow(followType, followId);
      console.log(res)
      setIsCollecting(false)
    },
    [followType, followId]
  );

  return (
    <>
      {isCollecting ? (
        <Image src="/images/icon/icon-tag.png" alt="" width={12} height={12} onClick={delCollect} />
      ) : (
        <Image src="/images/icon/icon-tag.png" alt="" width={12} height={12} onClick={addCollect} />
      )}
    </>
  );
}
