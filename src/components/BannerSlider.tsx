'use client';

import { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import Image from 'next/image';

// 左右箭头图标
function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type Banner = {
  title: string;
  button: string;
  image: string;
  gradient: [string, string];
};

const BANNERS: Banner[] = [
  {
    title: 'Submit Questions. Earn 1,000 Points!',
    button: 'Submit a Question',
    image: '/banners/robot-arm.png',
    gradient: ['#0047C4', '#03FE94'], // OneWallet 品牌色渐变
  },
  {
    title: 'Stake & Earn Rewards',
    button: 'Start Earning',
    image: '/banners/stake.png',
    gradient: ['#FFA200', '#FF7B00'],
  },
  {
    title: 'NFT Marketplace Live',
    button: 'Explore Now',
    image: '/banners/nft.png',
    gradient: ['#03FE94', '#00C2A8'],
  },
];

export default function BannerSlider() {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType>();

  // 挂载后绑定导航按钮
  useEffect(() => {
    const swiper = swiperRef.current;
    if (swiper && prevRef.current && nextRef.current) {
      if (typeof swiper.params.navigation !== 'boolean' && swiper.params.navigation) {
        swiper.params.navigation.prevEl = prevRef.current;
        swiper.params.navigation.nextEl = nextRef.current;
      }
      swiper.navigation.destroy();
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, []);

  return (
    <div>
      <div className="pt-[24px] px-[42px] relative">
        <Image src="/images/slideshow-bg.png" alt="" width={1728} height={412} className="absolute left-0 top-0 w-full" />
        <span className="inline-block leading-[120px] text-[80px] font-black bg-[linear-gradient(95.24deg,_#477CFC_2.17%,_#00FFEE_93.23%)] bg-clip-text text-transparent">
          Trending
        </span>
      </div>
      <div className="relative mt-[16px] mx-auto w-full max-w-[1728px]">
        {/* 左右渐隐遮罩 */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#071a2b] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#071a2b] to-transparent" />

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          loop
          centeredSlides
          autoplay={{ delay: 3800, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 1.05, spaceBetween: 18 },
            1024: { slidesPerView: 1.2, spaceBetween: 20 },
          }}
          className="pb-14"
        >
          {BANNERS.map((b, i) => (
            <SwiperSlide key={i}>
              <div
                className="overflow-hidden rounded-2xl p-8 md:p-10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                style={{
                  background: `linear-gradient(95deg, ${b.gradient[0]} 5%, ${b.gradient[1]} 95%)`,
                }}
              >
                <div className="flex items-center gap-6 md:gap-10">
                  {/* 左侧文字 */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[22px] font-extrabold leading-tight md:text-[32px] md:leading-[1.1]">
                      {b.title}
                    </h2>
                    <div className="mt-5">
                      <button className="group inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-black transition hover:bg-white">
                        {b.button}
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10 transition group-hover:bg-black/20">
                        ↗
                      </span>
                      </button>
                    </div>
                  </div>

                  {/* 右侧图片 */}
                  <div className="relative h-[130px] w-[200px] md:h-[180px] md:w-[280px]">
                    <Image
                      src={b.image}
                      alt={b.title}
                      fill
                      className="object-contain drop-shadow-[0_14px_30px_rgba(0,0,0,0.25)]"
                      sizes="(max-width: 768px) 200px, 280px"
                      priority={i === 0}
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 底部自定义箭头 */}
        <div className="pointer-events-none absolute -bottom-1 left-1/2 z-20 -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/8 p-2 ring-1 ring-white/10 backdrop-blur-sm">
            <button
              ref={prevRef}
              aria-label="Previous slide"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"
            >
              <ChevronLeft />
            </button>
            <button
              ref={nextRef}
              aria-label="Next slide"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
