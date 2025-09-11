'use client';

import { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import Image from 'next/image';
import ChevronLeft from '@/assets/icons/chevronLeft.svg';
import ChevronRight from '@/assets/icons/chevronRight.svg';

type Banner = {
  title: string;
  image: string;
};

const BANNERS: Banner[] = [
  {
    title: 'learn more',
    image: '/images/banners/banner_1.png',
  },
  {
    title: 'submit a question',
    image: '/images/banners/banner_2.png',
  }
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
      {/*<div className="pt-[24px] px-[42px] relative">*/}
      {/*  <Image src="/images/slideshow-bg.png" alt="" width={1728} height={412} className="absolute left-0 top-0 w-full" />*/}
      {/*  <span className="inline-block leading-[120px] text-[80px] font-black bg-[linear-gradient(95.24deg,_#477CFC_2.17%,_#00FFEE_93.23%)] bg-clip-text text-transparent">*/}
      {/*    Trending*/}
      {/*  </span>*/}
      {/*</div>*/}
      <div className="relative mt-[40px] mx-auto w-full max-w-[1728px] pb-[108px]">
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
            1024: { slidesPerView: 1.6, spaceBetween: 72 },
          }}
          className="pb-14"
        >
          {BANNERS.map((b, i) => (
            <SwiperSlide key={i}>
              <div
                className="overflow-hidden rounded-[24px] w-[1020px] h-[400px]"
              >
                <Image
                  src={b.image}
                  alt={b.title}
                  fill
                  className="object-contain drop-shadow-[0_14px_30px_rgba(0,0,0,0.25)]"
                  sizes="(max-width: 1020px) 1020px, 400px"
                  priority={i === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 底部自定义箭头 */}
        <div className="flex gap-[14px] pointer-events-none absolute bottom-[40px] left-1/2 z-200 -translate-x-1/2">
          <button
            ref={prevRef}
            aria-label="Previous slide"
            className="grid h-[42px] w-[42px] place-items-center rounded-full text-white/40 border border-white/20 transition hover:text-white"
          >
            <ChevronLeft />
          </button>
          <button
            ref={nextRef}
            aria-label="Next slide"
            className="grid h-[42px] w-[42px] place-items-center rounded-full text-white/40 border border-white/20 transition hover:text-white"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
