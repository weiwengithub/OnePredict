"use client";

import React, {useState, useEffect, useCallback, useMemo} from "react";
import apiService from "@/lib/api/services";
import {useRouter} from "next/navigation";
import {useLanguage} from "@/contexts/LanguageContext";
import {useIsMobile} from "@/contexts/viewport";
import CloseIcon from "@/assets/icons/close.svg";
import LikeIcon from "@/assets/icons/like.svg";
import ReplyIcon from "@/assets/icons/reply.svg";
import Avatar from "boring-avatars";
import Link from "next/link";
import {ProjectCommentListItem, ReplyCommentItem} from "@/lib/api/interface";
import {timeAgoEn} from "@/lib/utils";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/lib/interface";
import {setSigninOpen} from "@/store";
import {toast} from "sonner";

interface ReplyCommentModalProps {
  isOpen: boolean;
  comment: ProjectCommentListItem;
  onOpenChange: (open: boolean) => void;
  onRefreshComment: () => void;
}

export default function ReplyCommentModal({
  isOpen,
  comment,
  onOpenChange,
  onRefreshComment,
}: ReplyCommentModalProps) {
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const { language, t } = useLanguage();
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // 动画控制和禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // 保存当前的overflow值
      const originalOverflow = document.body.style.overflow;
      // 禁止滚动
      document.body.style.overflow = 'hidden';

      // 延迟一帧，确保DOM已渲染再添加动画类
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // 清理函数：恢复滚动
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      setIsVisible(false);
      // 等待动画结束后再卸载组件
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // 与动画时长一致
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const currentAccount = useCurrentAccount();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const userAddress = useMemo(() => {
    return currentAccount?.address || zkLoginData?.zkloginUserAddress;
  }, [currentAccount, zkLoginData]);

  const [commentMessages, setCommentMessages] = useState('');
  const [textareaFocus, setTextareaFocus] = useState(false);
  const [replyCommentList, setReplyCommentList] = useState<ReplyCommentItem[]>([]);
  const getReplyComment = useCallback(async () => {
    if (!comment?.id) return;
    try {
      const res = await apiService.getProjectCommentReplyList({
        pageNum: 1,
        pageSize: 10,
        commentId: comment.id,
      });

      if (res && res.data) {
        console.log(res.data);
        setReplyCommentList(res.data.rows);
      } else {
        setReplyCommentList([]);
      }
    } catch (err) {
      console.error('Error fetching market position:', err);
      setReplyCommentList([]);
    }
  }, [comment?.id])

  // 留言点赞/取消
  const handlePraiseProjectComment = async (commentId: number) => {
    if (zkLoginData || currentAccount) {
      const {data} = await apiService.praiseProjectComment({projectId: comment.projectId, commentId, address: userAddress || ''});
      console.log(data);
      onRefreshComment()
    } else {
      dispatch(setSigninOpen(true))
    }
  }

  // 留言回复
  const handleSave = async (commentId: number) => {
    if (zkLoginData || currentAccount) {
      try {
        const {data} = await apiService.replyProjectComment({projectId: comment.projectId, commentId, content: commentMessages, address: userAddress || ''});
        toast.success(t('detail.replySuccess'));
        setCommentMessages('');
        setTextareaFocus(false);
        getReplyComment();
        onRefreshComment()
      } catch (err) {
        console.error('Error saving comment', err);
        toast.error(t('detail.replyError'));
      }
    } else {
      dispatch(setSigninOpen(true))
    }
  }

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getReplyComment();
    }
  }, [isOpen, getReplyComment]);

  if (!shouldRender) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* 右侧滑出弹窗 - PC端从右侧滑入，移动端从底部滑入 */}
      <div className={`fixed flex flex-col bg-[#051A3D] p-[24px] z-[110] space-y-[24px] transition-all duration-300 ease-out
        ${isMobile
        ? `left-0 top-[90px] bottom-0 w-full pb-[30px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`
        : `right-0 top-0 h-full w-full max-w-[432px] ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`
      }`
      }>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px] h-[24px] leading-[24px] text-[18px] text-white font-bold">
            <ReplyIcon className="text-[14px] text-white cursor-pointer" />
            <span>{t('detail.replies')} ({comment.replyCount})</span>
          </div>
          <CloseIcon
            className="text-[20px] text-[#999999] hover:text-white cursor-pointer"
            onClick={() => onOpenChange(false)}
          />
        </div>

        <div className="flex items-center gap-[12px]">
          {comment.avatar ? <img src={comment.avatar} alt="" className="size-[32px] rounded-full" /> : <Avatar size={32} name={comment.nickName} variant={'marble'} />}
          <Link href={`/profile?memberId=${comment.memberId}`}>
            <div className="h-[24px] leading-[24px] text-[16px] text-white font-bold cursor-pointer">{comment.nickName}</div>
          </Link>
        </div>

        <div className={`bg-white/10 rounded-[12px] p-[16px] ${textareaFocus ? '' : 'h-[50px] overflow-hidden'}`}>
          <textarea
            name=""
            id=""
            placeholder={t('detail.saySomething')}
            className="w-full h-[50px] leading-[20px] text-[16px] text-white bg-transparent border-none outline-none focus:outline-none focus:ring-0 resize-none placeholder:text-white/60"
            maxLength={300}
            value={commentMessages}
            onChange={(e) => setCommentMessages(e.target.value)}
            onFocus={() => setTextareaFocus(true)}
          />
          <div className="flex items-center justify-between">
            <div className="flex">
              <span className="inline-block h-[32px] leading-[32px] text-[12px] text-white/60 hover:text-white px-[12px] rounded-[32px] hover:bg-[#04122B] cursor-pointer" onClick={() => setTextareaFocus(false)}>{t('detail.cancel')}</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[12px] text-white/60">{commentMessages.length} / 300</span>
              <span
                className="inline-block h-[32px] leading-[32px] text-[12px] text-white/60 hover:text-white px-[12px] rounded-[32px] hover:bg-[#04122B] cursor-pointer"
                onClick={() => handleSave(comment.id)}
              >{t('detail.reply')}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-none">
          {replyCommentList.map((replyComment, index) => (
            <div key={replyComment.id} className="p-[12px] border-b border-white/10">
              <div className="flex items-center">
                {replyComment.avatar ? <img src={replyComment.avatar} alt="" className="size-[32px] rounded-full" /> : <Avatar size={32} name={replyComment.nickName} variant={'marble'} />}
                <div className="flex-1 ml-[8px] overflow-hidden">
                  <Link href={`/profile?memberId=${replyComment.memberId}`}>
                    <div className="h-[20px] leading-[20px] text-[14px] text-white font-bold cursor-pointer">{replyComment.nickName}</div>
                  </Link>
                  <div className="mt-[4px] h-[12px] leading-[12px] text-[12px] text-white/60">{timeAgoEn(replyComment.replyTime)}</div>
                </div>
                <LikeIcon
                  className="ml-[12px] text-[14px]  hover:text-white cursor-pointer text-white/40"
                  onClick={() => handlePraiseProjectComment(replyComment.id)}
                />
                <div className="ml-[8px] inline-block text-[16px] text-white">0</div>
                {/*<div className="ml-[12px] text-[14px] text-white/60 hover:text-white cursor-pointer">{t('detail.reply')}</div>*/}
              </div>
              <div className="mt-[8px] leading-[24px] text-[16px] text-white font-bold">{replyComment.content}</div>

              {/*<div className="pl-[36px]">*/}
              {/*  <div className="py-[12px]">*/}
              {/*    <div className="flex items-center">*/}
              {/*      {comment.avatar ? <img src={comment.avatar} alt="" className="size-[32px] rounded-full" /> : <Avatar size={32} name={comment.nickName} variant={'marble'} />}*/}
              {/*      <div className="flex-1 ml-[8px] overflow-hidden">*/}
              {/*        <Link href={`/profile?memberId=${comment.memberId}`}>*/}
              {/*          <div className="h-[20px] leading-[20px] text-[14px] text-white font-bold cursor-pointer">{comment.nickName}</div>*/}
              {/*        </Link>*/}
              {/*        <div className="mt-[4px] h-[12px] leading-[12px] text-[12px] text-white/60">1 hour ago</div>*/}
              {/*      </div>*/}
              {/*      <LikeIcon className={"ml-[12px] text-[14px]  hover:text-white cursor-pointer "+(comment.isMyPraise ? ' text-white' : 'text-white/40')} />*/}
              {/*      <div className="ml-[8px] inline-block text-[16px] text-white">{comment.praiseCount}</div>*/}
              {/*      <div className="ml-[12px] text-[14px] text-white/60 hover:text-white cursor-pointer">{t('detail.reply')}</div>*/}
              {/*    </div>*/}
              {/*    <div className="mt-[8px] leading-[16px] text-[12px] text-white/40">{t('detail.reply')} @Bayes_5000</div>*/}
              {/*    <div className="leading-[24px] text-[16px] text-white font-bold">333</div>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>
          ))}
          <div className="py-[16px] text-[14px] text-white/60 text-center">{t('detail.allItemsLoaded')}</div>
        </div>
      </div>
    </>
  );
}
