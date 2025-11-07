"use client";

import React, {useState, useEffect, useRef, useCallback, useMemo} from "react";
import Avatar from 'boring-avatars';
import MobileNavigation from "@/components/MobileNavigation";
import Link from 'next/link';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TradingForm from "@/components/predictionTrading/TradingForm";
import TermsAgreement from "@/components/predictionTrading/TermsAgreement";
import { Pagination } from "@/components/Pagination";
import { useSearchParams } from "next/navigation";
import apiService from "@/lib/api/services";
import HomeIcon from "@/assets/icons/home.svg";
import EditIcon from "@/assets/icons/edit.svg";
import Edit1Icon from "@/assets/icons/edit_1.svg";
import NoteIcon from "@/assets/icons/note.svg";
import ExportIcon from "@/assets/icons/export.svg";
import ExchangeIcon from "@/assets/icons/exchange.svg";
import SettingIcon from "@/assets/icons/setting.svg";
import RefreshIcon from "@/assets/icons/refresh.svg";

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import OutcomeProposed from "@/assets/icons/outcomeProposed.svg";
import DisputeWindow from "@/assets/icons/disputeWindow.svg";
import FinalOutcome from "@/assets/icons/finalOutcome.svg";
import WechatIcon from "@/assets/icons/wechat.svg";
import Image from "next/image";
import {
  PredictionDetailInfo,
  MarketDetailTradesOption,
  MarketOption,
  ProjectCommentListItem,
  KlineInfo
} from "@/lib/api/interface";
import {capitalizeFirst, formatShortDate, onCopyToText, timeAgoEn, formatTimeStr} from "@/lib/utils";
import {useLanguage} from "@/contexts/LanguageContext";
import BigNumber from "bignumber.js";
import { HoverTooltipButton } from "@/components/HoverTooltipButton";
import { ClampableText } from "@/components/ClampableText";
import {TooltipAmount} from "@/components/TooltipAmount";
import CopyIcon from "@/assets/icons/copy_1.svg";
import SharePopover from "@/components/SharePopover";
import {toDisplayDenomAmount} from "@/lib/numbers";
import {useIsMobile} from "@/contexts/viewport";
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import { useInterval } from "@/hooks/useInterval";
import {colors, tokenIcon} from "@/assets/config";
import Collecting from "@/components/Collecting";
import SaySomethingModal from "@/components/SaySomethingModal";
import ReplyCommentModal from "@/components/ReplyCommentModal";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/lib/interface";
import LikedIcon from "@/assets/icons/liked.svg";
import LikeIcon from "@/assets/icons/like.svg";
import ReplyIcon from "@/assets/icons/reply.svg";
import SucceedIcon from "@/assets/icons/succeedResult.svg";
import FailIcon from "@/assets/icons/close.svg";
import {setSigninOpen} from "@/store";

export default function PredictionDetailsClient() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const marketId = searchParams.get("marketId") as string;

  const currentAccount = useCurrentAccount();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const userAddress = useMemo(() => {
    return currentAccount?.address || zkLoginData?.zkloginUserAddress;
  }, [currentAccount, zkLoginData]);

  const [currentOutcome, setCurrentOutcome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [predictionDetail, setPredictionDetail] = useState<MarketOption | null>(null);

  useEffect(() => {
    if (!marketId) return;
    let cancelled = false;

    (async () => {
      try {
        const {data} = await apiService.getMarketDetail(marketId);
        if (cancelled) return;
        setPredictionDetail(data)
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [marketId]);

  const handleOutcomeChange = useCallback(
    (next: number | ((prev: number) => number)) => {
      setCurrentOutcome((prev) => (typeof next === "function" ? (next as any)(prev) : next));
    },
    []
  );


  const timeframes = ['1H', '1D', '1W', '1M', '3M', '1Y'];
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [klineData, setKlineData] = useState<Array<{ time: number; outcomes: Array<{ outcome: number; name: string; percent: number }> }>>([]);
  const [hoverInfo, setHoverInfo] = useState<{ time: number; lines: { name: string; value: number }[] } | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  // ---- Chart refs ----
  const chartRef = useRef<any>(null);
  const seriesMapRef = useRef<Map<number, any>>(new Map());
  const outcomeNamesRef = useRef<Map<number, string>>(new Map());

  useInterval(() => {
    getKlineData();
  }, 1000*10, false);

  useEffect(() => {
    if (!marketId) return;
    // 加上防抖，防止频繁请求
    const timer = setTimeout(() => {
      getKlineData();
    }, 200);
    return () => clearTimeout(timer);
  }, [marketId, selectedTimeframe]);

  const getKlineData = useCallback(async () => {
    if (!marketId || !selectedTimeframe || loading) return;

    setLoading(true);
    try {
      const res = await apiService.getMarketKline({ marketId, level: selectedTimeframe });
      const payload = (res as { data?: KlineInfo }).data ?? (res as unknown as KlineInfo | undefined);
      const normalized = (payload?.klines ?? []).map((kline) => {
        const outcomes = kline.outcomes ?? [];
        const total = outcomes.reduce((acc: bigint, outcome) => {
          try {
            return acc + BigInt(outcome.prob ?? '0');
          } catch {
            return acc;
          }
        }, 0n) || 1n;

        const mappedOutcomes = outcomes.map((outcome) => {
          let percent = 0;
          try {
            const value = BigInt(outcome.prob ?? '0');
            const percentBase = Number((value * 10000n) / total) / 100;
            percent = Number(percentBase.toFixed(4));
          } catch {
            percent = 0;
          }

          return {
            outcome: Number(outcome.outcomeId),
            name: String(outcome.outcomeName ?? ''),
            percent,
          };
        });

        return { time: Number(kline.timestamp), outcomes: mappedOutcomes };
      });
      setKlineData(normalized);
    } catch (e: any) {
      if (e?.name === 'AbortError' || e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;
      console.error('kline error:', e);
      setKlineData([]);
    } finally {
      setLoading(false);
    }
  }, [marketId, selectedTimeframe, loading]);
  // 渲染曲线（每个 outcome 一条线），无灰度/无 tooltip
  useEffect(() => {
    const container = document.getElementById('container') as HTMLDivElement | null;
    if (!container) return;
    // 重建图表，简单可靠
    if (chartRef.current) {
      try { chartRef.current.remove(); } catch {}
      seriesMapRef.current.clear();
      chartRef.current = null;
    }
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: { textColor: 'white', background: { type: ColorType.Solid, color: 'transparent' } },
      rightPriceScale: { visible: true },
      timeScale: { borderVisible: false },
      grid: { horzLines: { color: 'rgba(255,255,255,0.12)' }, vertLines: { visible: false, color: 'transparent' } },
    });
    chartRef.current = chart;
    // 尝试隐藏 TV logo（水印）
    try { (chart as any).applyOptions({ watermark: { visible: false } }); } catch {}

    // 颜色
    const palette = colors; //给8个颜色;
    // 统计 outcome 列表
    const outcomeSet = new Set<number>();
    klineData.forEach((pt) => pt.outcomes.forEach((o) => outcomeSet.add(o.outcome)));
    const outcomes = Array.from(outcomeSet.values()).sort((a, b) => a - b);
    // 组装每条线的数据
    const seriesData = new Map<number, Array<{ time: any; value: number }>>();
    outcomes.forEach((o) => seriesData.set(o, []));
    klineData.forEach((pt) => {
      const t = (pt.time as number) as any; // 秒级时间戳
      pt.outcomes.forEach((o) => {
        const arr = seriesData.get(o.outcome)!;
        // 使用 0~1 的值并设置百分比格式
        arr.push({ time: t, value: o.percent });
        if (!outcomeNamesRef.current.has(o.outcome)) {
          outcomeNamesRef.current.set(o.outcome, o.name);
        }
      });
    });
    // 创建并渲染（固定纵轴 0~1）
    outcomes.forEach((o, idx) => {
      const series = chart.addSeries(LineSeries, {
        color: palette[idx % palette.length],
        lineWidth: 2,
        priceFormat: { type: 'percent', precision: 2 },
        autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 } }),
      });
      series.setData(seriesData.get(o) ?? []);
      seriesMapRef.current.set(o, series);
    });
    chart.timeScale().fitContent();

    // 自适应
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth; const h = container.clientHeight;
      if (w && h) chart.applyOptions({ width: w, height: h });
    });
    ro.observe(container);

    // 悬停信息（时间 + outcome 百分比）
    const onMove = (param: any) => {
      if (!param?.time) { setHoverInfo(null); return; }
      const lines: { name: string; value: number }[] = [];
      seriesMapRef.current.forEach((series, outcomeIdx) => {
        const sd = (param.seriesData as any)?.get(series);
        const v = sd?.value ?? sd?.close;
        if (v != null) {
          lines.push({ name: outcomeNamesRef.current.get(outcomeIdx) || String(outcomeIdx), value: Number(v) * 100 });
        }
      });
      setHoverInfo({ time: Number(param.time), lines });
      // 同步记录像素位置用于浮层跟随鼠标
      try {
        const point = param.point as { x: number; y: number } | undefined;
        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
          setHoverPos({ x: point.x, y: point.y });
        }
      } catch {}
    };
    chart.subscribeCrosshairMove(onMove);

    return () => {
      try { ro.disconnect(); } catch {}
      try { chart.unsubscribeCrosshairMove(onMove); } catch {}
      try { chart.remove(); } catch {}
      seriesMapRef.current.clear();
      chartRef.current = null;

    };
  }, [klineData , selectedTimeframe]);


  const [tradesList, setTradesList] = useState<MarketDetailTradesOption[]>([]);
  const [tradesPageNumber, setTradesPageNumber] = useState(1);
  const [tradesPageSize, setTradesPageSize] = useState(10);
  const [tradesTotalPages, setTradesTotalPages] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    (async () => {
      try {
        const {data} = await apiService.getMarketDetailTrades({
          marketId,
          pageSize: tradesPageSize,
          pageNum: tradesPageNumber
        }, { signal: controller.signal });
        setTradesList(data.rows ?? []);
        setTradesTotalPages(Math.ceil(data.count / tradesPageSize));
      } catch (e) {
        console.log(e)
      }
    })().catch((e) => {
      if (e?.name !== "AbortError") console.error(e);
    });
    return () => controller.abort();
  }, [marketId, tradesPageNumber, tradesPageSize]);

  const handlePageChange = (page: number) => {
    setTradesPageNumber(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setTradesPageSize(newItemsPerPage);
    setTradesPageNumber(1);
  };


  const [projectCommentList, setProjectCommentList] = useState<ProjectCommentListItem[]>([]);
  const [commentPageNum, setCommentPageNum] = useState(1);
  const [commentPageSize, setCommentPageSize] = useState(10);
  const [commentTotal, setCommentTotal] = useState(0);
  const [showSaySomething, setShowSaySomething] = useState(false);
  const [showReplyMessageModal, setShowReplyMessageModal] = useState(false);
  const [currentComment, setCurrentComment] = useState<ProjectCommentListItem | null>(null);

  const commentRef = useRef<AbortController | null>(null);

  const getProjectCommentList = async () => {
    const {data} = await apiService.getProjectCommentList({
      pageNum: commentPageNum,
      pageSize: commentPageSize,
      address: userAddress || '',
      marketId
    })
    setProjectCommentList(data.rows);
    setCommentTotal(Math.ceil(data.count / commentPageSize));
  }

  useEffect(() => {
    if (commentRef.current) commentRef.current.abort();
    const controller = new AbortController();
    commentRef.current = controller;

    getProjectCommentList()

    return () => controller.abort();
  }, [marketId, commentPageNum, commentPageSize, userAddress]);

  const commentPageChange = (page: number) => {
    setCommentPageNum(page);
  };

  const commentPerPageChange = (newItemsPerPage: number) => {
    setCommentPageSize(newItemsPerPage);
    setCommentPageNum(1);
  };

  const handlePraiseProjectComment = async (projectId: number, commentId: number, user:string) => {
    if (zkLoginData || currentAccount) {
      const {data} = await apiService.praiseProjectComment({projectId, commentId, address: user || ''});
      console.log(data);
      getProjectCommentList();
    } else {
      dispatch(setSigninOpen(true))
    }
  }

  if(!predictionDetail) {
    return ''
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#051A3D] via-[#0D2347] to-[#051A3D] pb-20 md:pb-0">
        {/* Header */}
        {isMobile ? (
          <MobileNavigation
            activeCategory=""
            onCategoryChange={() => {}}
          />
        ) : (
          <Header currentPage="details" />
        )}

        {/* Main Content */}
        <main className={isMobile ? 'px-[16px] py-[24px]' : 'max-w-[1312px] mx-auto pt-[50px] flex gap-[64px]'}>
          <div className="flex-1 relative">
            {/* Back Button */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center text-white/40 hover:text-white">
                  <HomeIcon /><span className="ml-[8px] h-[18px] leading-[18px] text-[14px]">{t('nav.home')}</span>
                </div>
              </Link>
              <ArrowRightIcon className="mx-[16px] text-white/40" />
              <div className="h-[18px] leading-[18px] text-[14px] text-white">{t('detail.trade')}</div>
            </div>

            {/* Header */}
            <div className="mt-[24px]">
              <div className="flex">
                <img src={predictionDetail.imageUrl} alt="" className="w-[100px] h-[100px] rounded-[12px]" />
                <div className={`${isMobile ? 'ml-[16px]' : 'ml-[24px]'} flex flex-col gap-[12px]`}>
                  <div className={`text-white font-bold line-clamp-3 ${isMobile ? 'leading-[24px] text-[16px]' : 'leading-[28px] text-[24px]'}`}>{predictionDetail.marketName}</div>
                  {!isMobile && (
                    <div className="flex items-center gap-2 h-[24px] text-white/60 text-[16px]">
                      <span>{t('detail.volume')}:</span>
                      <Image src={tokenIcon} alt="" width={16} height={16} />
                      <span>{Number(predictionDetail.tradeVolume).toFixed(2)}</span>
                      <span>{t('detail.traders')}:</span>
                      <span>{predictionDetail?.traderCount}</span>
                      <Image src="/images/icon/icon-calendar.png?v=1" alt="" width={12} height={12} />
                      <span>{formatShortDate(new Date(predictionDetail.endTime))}</span>
                    </div>
                  )}
                  <div className="flex gap-[12px]">
                    {!isMobile && userAddress && (
                      <div
                        className="h-[36px] flex items-center gap-[8px] rounded-[32px] border border-white/20 text-[16px] font-bold px-[12px] text-white cursor-pointer"
                        onClick={() => {
                          setShowSaySomething(true);
                        }}
                      >
                        <EditIcon className="text-[12px]" />{t('detail.saySomething')}
                      </div>
                    )}
                    <div className={`h-[36px] flex items-center gap-[8px] text-[12px] font-bold px-[12px] text-white ${isMobile ? 'absolute -top-[9px] right-[36px]' : 'rounded-[32px] border border-white/20'}`}>
                      <Collecting collecting={predictionDetail.isFollow} followType="Project" followId={predictionDetail.id} />
                    </div>
                    <SharePopover
                      className={isMobile ? 'absolute -top-[9px] right-0' : ''}
                      trigger={<div className={`h-[36px] flex items-center gap-[8px] text-[12px] font-bold px-[12px] text-white ${isMobile ? '' : 'rounded-[32px] border border-white/20'}`}><ExportIcon /></div>}
                      content={
                        <div className="max-w-[260px] text-sm leading-5">
                          <div
                            className="flex items-center gap-2 text-white/60 hover:text-white text-[12px] whitespace-nowrap cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCopyToText(`${window.location.origin}/details?marketId=${predictionDetail.marketId}`)
                            }}
                          >
                            <CopyIcon />
                            {t('predictions.copyLink')}
                          </div>
                        </div>
                      }
                      offset={10}
                      lockScroll
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="mt-[40px]">
              {/* Chart Controls */}
              <div className="flex items-center justify-between mb-[40px] overflow-x-auto overflow-y-hidden">
                <div className="flex gap-[8px]">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`h-[36px] px-[24px] text-[16px] rounded-[40px] transition-colors ${
                        selectedTimeframe === tf
                          ? 'bg-black/20 text-white'
                          : 'text-white/60 hover:text-white hover:bg-black/20'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
                {/* <div className="flex gap-[8px]">
                <div className="p-[12px] text-white text-[12px] cursor-pointer"><ExchangeIcon /></div>
                <div className="p-[12px] text-white text-[12px] cursor-pointer"><SettingIcon /></div>
              </div> */}
              </div>

              {/* Chart */}
              <div className="relative h-[300px] rounded-lg p-4 mb-6">
                <div id="container" className="absolute inset-0 flex items-center gap-[12px] flex-col justify-center">
                  {!klineData.length && <span className="text-[14px] text-white opacity-60">Loading...</span>}
                </div>
                {hoverInfo && (
                  <div
                    className="absolute bg-black/60 text-white text-xs rounded p-2 space-y-1 pointer-events-none"
                    style={{
                      left: typeof window !== 'undefined' && hoverPos ? Math.min(hoverPos.x + 12, (document.getElementById('container')?.clientWidth || 0) - 160) : 8,
                      top: typeof window !== 'undefined' && hoverPos ? Math.max(hoverPos.y - 40, 8) : 8,
                    }}
                  >
                    <div>{new Date(hoverInfo.time * 1000).toLocaleString()}</div>
                    {hoverInfo.lines.map((ln, i) => (
                      <div key={i} className="flex justify-between gap-4">
                        <span>{ln.name}</span>
                        <span>{(ln.value/100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-[48px] border border-white/40 rounded-[24px] overflow-hidden">
              {!isMobile && (
                <div className="h-[60px] bg-white/40 flex text-[16px] text-white">
                  <div className="flex-1 flex items-center px-[24px]">
                    <span>{t('detail.options')}</span>
                  </div>
                  {predictionDetail.status !== 'Resolved' && predictionDetail.status !== 'Completed' && (
                    <div className="flex-1 flex items-center justify-center px-[24px]">
                      <span>{t('detail.chance')}</span>
                      <RefreshIcon className="ml-[4px]" />
                    </div>
                  )}
                  <div className="flex-1 flex items-center justify-end px-[24px]">
                    <span>{predictionDetail.status !== 'Resolved' && predictionDetail.status !== 'Completed' ? t('detail.currentPrice') : t('detail.result')}</span>
                  </div>
                </div>
              )}
              {predictionDetail.outcome.map((outcome, index) => (
                <div key={index} className="h-[96px] flex text-[18px] text-white font-bold">
                  <div className="flex-1 flex items-center px-[24px]">
                    <div className="w-[36px] h-[36px] rounded-full" style={{backgroundColor: colors[index]}}></div>
                    <span className="ml-[12px]">{outcome.name}</span>
                  </div>
                  {predictionDetail.status !== 'Resolved' && predictionDetail.status !== 'Completed' && !isMobile && (
                    <div className="flex-1 flex items-center justify-center px-[24px]">
                      <span>{`${Number((100 * Number(outcome.prob)).toFixed(2))}%`}</span>
                    </div>
                  )}
                  <div className="flex-1 flex items-center justify-end px-[24px]">
                    {predictionDetail.status !== 'Resolved' && predictionDetail.status !== 'Completed' ? (
                      <HoverTooltipButton
                        label={`${t('predictions.buy')} ${Number((100 * Number(outcome.prob)).toFixed(2))}`}
                        hoverLabel={`${outcome.prob}%`}
                        tooltip={
                          <>
                            To win: {outcome.roi} x
                          </>
                        }
                        onClick={() => setCurrentOutcome(index)}
                        color={colors[index]}
                        isCurrent={currentOutcome === index}
                        className={`group h-[48px] w-[162px] font-bold text-[16px] rounded-[8px]`}
                        buttonProps={{ variant: "outline" }}
                      />
                    ) : (
                      <div className="flex items-center">
                        <span className="mr-[12px]">{outcome.name}</span>
                        {outcome.outcomeId === Number(predictionDetail.winnerId) ? <SucceedIcon className="text-[#29C04E]" /> : <FailIcon />}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Rules */}
            <div className="mt-[48px]">
              <h3 className="h-[24px] leading-[24px] text-[18px] font-bold text-white mb-[12px]">{t('detail.rules')}</h3>
              <div className="border border-white/40 rounded-[24px] overflow-hidden p-[24px]">
                <ClampableText
                  text={predictionDetail.marketDesc}
                  maxLines={5}
                  className="leading-[24px] text-[16px] text-white whitespace-pre-line"
                  onToggle={(expanded) => console.log("expanded:", expanded)}
                />
              </div>
            </div>

            <div className="mt-[24px] flex items-center justify-between border border-white/40 rounded-[24px] overflow-hidden px-[28px] py-[24px]">
              <div>
                <div className="flex items-center h-[24px] leading-[24px] text-white/60 text-[16px]">
                  <OutcomeProposed className={`text-[14px] ${predictionDetail.status === 'Resolved' || predictionDetail.status === 'Completed' ? 'text-[#29C041]' : 'text-white/60'}`} />
                  <span className="inline-block ml-[8px]">{t('detail.outcomeProposed')}</span>
                </div>
                <div className={`my-[-3px] ml-[7px] h-[30px] border-l ${predictionDetail.status === 'Resolved' || predictionDetail.status === 'Completed' ? 'border-[#29C041]' : 'border-white/60'}`}>
                  {(predictionDetail.status === 'Resolved' || predictionDetail.status === 'Completed') && (
                    <span className="ml-[14px] leading-[16px] text-[16px] text-[#29C041]">{predictionDetail.outcome[Number(predictionDetail.winnerId)].name}</span>
                  )}
                </div>
                <div className="flex items-center h-[24px] leading-[24px] text-white/60 text-[16px]">
                  <DisputeWindow className={`text-[14px] ${predictionDetail.status === 'Completed' ? 'text-[#29C041]' : 'text-white/60'}`} />
                  <span className="inline-block ml-[8px]">{t('detail.disputeWindow')}</span>
                </div>
                <div className={`my-[-3px] ml-[7px] h-[30px] border-l ${predictionDetail.status === 'Completed' ? 'border-[#29C041]' : 'border-white/60'}`}></div>
                <div className="flex items-center h-[24px] leading-[24px] text-white/60 text-[16px]">
                  <FinalOutcome className={`text-[14px] ${predictionDetail.status === 'Completed' ? 'text-[#29C041]' : 'text-white/60'}`} />
                  <span className="inline-block ml-[8px]">{t('detail.finalOutcome')}</span>
                </div>
                {predictionDetail.status === 'Completed' && (
                  <div className="ml-[22px] leading-[16px] text-[16px] text-[#29C041]">{predictionDetail.outcome[Number(predictionDetail.winnerId)].name}</div>
                )}
              </div>
              {predictionDetail.status === 'Resolved' && (
                <Image src="/images/released.png?v=1" alt="" width={120} height={120} />
              )}
              {predictionDetail.status === 'Completed' && (
                <Image src="/images/ended.png?v=1" alt="" width={120} height={120} />
              )}
            </div>

            {/* Trades */}
            <div className="mt-[48px]">
              <h3 className="h-[24px] leading-[24px] text-[18px] font-bold text-white mb-[12px]">{t('detail.trade')}</h3>
              <div className="border border-white/40 rounded-[24px]  px-[28px] py-[37px] space-y-[16px] overflow-x-auto overflow-y-hidden">
                {tradesList.length > 0 ? (
                  <>
                    {tradesList.map((trades, index) => (
                      <div key={`${trades.marketId}_${index}`} className="min-w-[536px] flex items-center justify-between">
                        <div className="flex items-center gap-[12px] text-[16px] text-white">
                          {trades.avatar ? (
                            <Image src={trades.avatar} alt="" width={32} height={32} />
                          ) : (
                            <Avatar
                              size={32}
                              name={trades.userAddress}
                              variant={'marble'}
                            />
                          )}
                          <div>{trades.nickName || trades.userAddress.slice(-6)}</div>
                          <div className="opacity-60">{capitalizeFirst(trades.side)}</div>
                          <div className={`h-[20px] leading-[20px] px-[4px] rounded-[4px] ${trades.side === 'buy' ? 'bg-[rgba(40,192,78,0.5)] text-[#28C04E]' : 'bg-[rgba(249,93,93,0.5)] text-[#F95D5D]'}`}><TooltipAmount shares={trades.deltaShares} decimals={0} precision={2}/> {trades.outcome.name}</div>
                          <div className="opacity-60">at</div>
                          <div><TooltipAmount shares={trades.entryPrice} decimals={0} precision={2}/></div>
                          <div className="opacity-60">cost</div>
                          <Image src={tokenIcon} alt="" width={12} height={12} />
                          <div><TooltipAmount shares={trades.amount} decimals={0} precision={2}/></div>
                        </div>
                        <div className="text-white/60 text-[16px]">{timeAgoEn(trades.eventMs)}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="mt-[37px]">
                    <div className="size-[64px] mx-auto text-[64px] text-white/60"><WechatIcon /></div>
                    <div className="mt-[12px] h-[24px] leading-[24px] text-white/80 text-[16px] text-center">{t('common.nothing')}</div>
                  </div>
                )}
                {/*分页组件*/}
                <Pagination
                  className="min-w-[536px]"
                  currentPage={tradesPageNumber}
                  totalPages={tradesTotalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={tradesPageSize}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[10, 20, 50, 100]}
                />
              </div>
            </div>

            <div className="mt-[36px] h-[24px] leading-[24px] text-white text-[18px] font-bold">{t('detail.opinions')} ({commentTotal})</div>

            <div className="mt-[45px] bg-white/40 rounded-[12px] px-[24px] py-[14px]">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => {setShowSaySomething(true)}}
              >
                <div className="size-[32px] bg-[#D9D9D9] rounded-full"></div>
                <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white/60 px-[12px]">{t('detail.saySomething')}</div>
                <Edit1Icon className="text-white/60 text-[24px] hover:text-white" />
              </div>
            </div>
            
            {projectCommentList.length > 0 ? (
              <>
                <div className="my-[24px] px-[24px] space-y-[24px]">
                  {projectCommentList.map((comment) => (
                    <div key={comment.id}>
                      <div className="flex items-center gap-[12px]">
                        {comment.avatar ? <img src={comment.avatar} alt="" className="size-[24px] rounded-full" /> : <Avatar size={24} name={comment.nickName} variant={'marble'} />}
                        <Link href={`/profile?memberId=${comment.memberId}`}>
                          <div className="h-[24px] leading-[24px] text-[16px] text-white/60 hover:text-white font-bold cursor-pointer">{comment.nickName}</div>
                        </Link>
                      </div>
                      <div className="mt-[12px] leading-[24px] text-[16px] text-white/60">{comment.content}</div>
                      <div className="mt-[7px] flex items-center gap-[40px]">
                        <div className="flex items-center gap-[12px]">
                          {comment.isMyPraise ? (
                            <LikedIcon className="text-[12px] text-white cursor-pointer" onClick={() => {handlePraiseProjectComment(predictionDetail.id, comment.id, userAddress || '')}} />
                          ) : (
                            <LikeIcon className="text-[12px] text-white/60 hover:text-white cursor-pointer" onClick={() => {handlePraiseProjectComment(predictionDetail.id, comment.id, userAddress || '')}} />
                          )}
                          <span className="inline-block h-[24px] leading-[24px] text-[16px] text-white/60">{comment.praiseCount}</span>
                        </div>
                        <div className="flex items-center gap-[12px]">
                          <ReplyIcon
                            className="text-[12px] text-white/40 hover:text-white cursor-pointer"
                            onClick={() => {
                              if (zkLoginData || currentAccount) {
                                setCurrentComment(comment);
                                setShowReplyMessageModal(true)
                              } else {
                                dispatch(setSigninOpen(true))
                              }
                            }}
                          />
                          <span className="inline-block h-[24px] leading-[24px] text-[16px] text-white/60 cursor-pointer">{comment.replyCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/*分页组件*/}
                <Pagination
                  className="min-w-[536px] mx-[24px]"
                  currentPage={commentPageNum}
                  totalPages={commentTotal}
                  onPageChange={commentPageChange}
                  itemsPerPage={commentPageSize}
                  onItemsPerPageChange={commentPerPageChange}
                  itemsPerPageOptions={[10, 20, 50, 100]}
                />
              </>
            ) : (
              <div className="mt-[48px]">
                <div className="size-[64px] mx-auto text-[64px] text-white/60"><WechatIcon /></div>
                <div className="mt-[12px] h-[24px] leading-[24px] text-white/80 text-[16px] text-center">{t('common.nothing')}</div>
              </div>
            )}
          </div>
          {!isMobile && predictionDetail && (
            <div className="w-[368px] sticky top-[80px]" style={{ height: '100%' }}>
              <TradingForm
                prediction={predictionDetail}
                initialOutcome={currentOutcome}
                outcomeChange={handleOutcomeChange}
              />
              <TermsAgreement />
            </div>
          )}
        </main>

        {/* Footer */}
        {!isMobile && <Footer />}
      </div>

      {/* Sale Modal */}
      <SaySomethingModal open={showSaySomething} prediction={predictionDetail} onOpenChange={setShowSaySomething} onSuccess={getProjectCommentList} />

      {/* Reply Message Modal */}
      {currentComment && (
        <ReplyCommentModal
          isOpen={showReplyMessageModal}
          comment={currentComment}
          onOpenChange={setShowReplyMessageModal}
          onRefreshComment={getProjectCommentList}
        />
      )}
    </>
  );
}
