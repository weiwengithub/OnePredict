"use client";

import React, {useCallback, useMemo, useState} from "react";
import apiService from "@/lib/api/services";
import ConcernIcon from '@/assets/icons/concern.svg';
import FollowedIcon from '@/assets/icons/followed.svg';
import Image from "next/image";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/interface";
import { setSigninOpen } from "@/store";

type CollectingProps = {
  /** 是否已关注 */
  collecting?: boolean;
  /** 关注类型 */
  followType: 'People' | 'Project';
  /** 项目或用户ID */
  followId: number;
};

export default function Collecting({collecting, followType, followId}: CollectingProps) {
  const [isCollecting, setIsCollecting] = useState(collecting)
  const dispatch = useDispatch();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const currentAccount = useCurrentAccount();
  const userAddress = useMemo(() => {
    return currentAccount?.address || zkLoginData?.zkloginUserAddress;
  }, [currentAccount, zkLoginData]);
  const addCollect = useCallback(
    async () => {
      if (!userAddress) {
        dispatch(setSigninOpen(true));
        return
      };
      const res = await apiService.addMemberFollow({
        followType,
        followId,
        address: userAddress
      });
      setIsCollecting(true)
    },
    [userAddress, followType, followId, dispatch]
  );

  const delCollect = useCallback(
    async () => {
      if (!userAddress) {
        dispatch(setSigninOpen(true));
        return
      };
      const res = await apiService.delMemberFollow({
        followType,
        followId,
        address: userAddress
      });
      setIsCollecting(false)
    },
    [userAddress, followType, followId, dispatch]
  );

  return (
    <>
      {isCollecting ? (
        <FollowedIcon className="text-[12px] text-white/60 hover:text-white cursor-pointer" onClick={delCollect} />
      ) : (
        <ConcernIcon className="text-[12px] text-white/60 hover:text-white cursor-pointer" onClick={addCollect} />
      )}
    </>
  );
}
