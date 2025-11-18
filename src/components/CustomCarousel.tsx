'use client';

import {useMemo, useState} from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
  EffectCube,
  EffectFade,
  EffectFlip,
  EffectCards,
  EffectCreative
} from 'swiper/modules';
import ChevronLeft from '@/assets/icons/chevronLeft.svg';
import ChevronRight from '@/assets/icons/chevronRight.svg';
import { Maximize } from 'lucide-react';
import { Swiper as SwiperType } from 'swiper';
import FullscreenModal from './FullscreenModal';
import { useIsMobile } from '@/contexts/viewport';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-cube';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-flip';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-creative';
import {BannerInfo} from "@/lib/api/interface";

export type EffectType = 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'cards' | 'creative';

interface CustomCarouselProps {
  items: BannerInfo[];
  autoplay?: boolean;
  loop?: boolean;
  slidesPerView?: number;
  spaceBetween?: number;
  centeredSlides?: boolean;
  autoplayDelay?: number;
  onSwiper?: (swiper: SwiperType) => void;
  effect?: EffectType;
  height?: string;
}

export default function CustomCarousel({
  items,
  autoplay = true,
  loop = true,
  slidesPerView = 3,
  spaceBetween = 30,
  centeredSlides = true,
  autoplayDelay = 3000,
  onSwiper,
  effect = 'slide',
  height = '400px',
}: CustomCarouselProps) {
  const isMobile = useIsMobile();
  const computedSlidesPerView = isMobile ? 1 : slidesPerView;
  const computedHeight = isMobile
    ? `${Math.round(400 * (document.documentElement.clientWidth - 32) / 1020)}px`
    : height;

  const supportFullscreen = false;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 获取所有可用的模块
  const getAllModules = () => {
    return [Navigation, Pagination, Autoplay, EffectCoverflow, EffectCube, EffectFade, EffectFlip, EffectCards, EffectCreative];
  };

  // 根据效果类型获取配置
  const getEffectConfig = () => {
    switch (effect) {
      case 'cube':
        return {
          effect: 'cube' as const,
          cubeEffect: {
            shadow: true,
            slideShadows: true,
            shadowOffset: 20,
            shadowScale: 0.94,
          },
          slidesPerView: 1,
          spaceBetween: 0,
        };

      case 'fade':
        return {
          effect: 'fade' as const,
          fadeEffect: {
            crossFade: true,
          },
          slidesPerView: 1,
          spaceBetween: 0,
        };

      case 'flip':
        return {
          effect: 'flip' as const,
          flipEffect: {
            slideShadows: true,
            limitRotation: true,
          },
          slidesPerView: 1,
          spaceBetween: 0,
        };

      case 'cards':
        return {
          effect: 'cards' as const,
          cardsEffect: {
            perSlideOffset: 8,
            perSlideRotate: 2,
            rotate: true,
            slideShadows: true,
          },
          slidesPerView: 1,
          spaceBetween: 0,
        };

      case 'creative':
        return {
          effect: 'creative' as const,
          creativeEffect: {
            prev: {
              shadow: true,
              translate: ['-20%', 0, -1],
            },
            next: {
              translate: ['100%', 0, 0],
            },
          },
          slidesPerView: 1,
          spaceBetween: 0,
        };

      case 'coverflow':
        return {
          effect: 'coverflow' as const,
          coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          },
          slidesPerView: computedSlidesPerView,
          spaceBetween: spaceBetween,
        };

      default: // slide
        return {
          effect: 'slide' as const,
          slidesPerView: computedSlidesPerView,
          spaceBetween: spaceBetween,
        };
    }
  };

  const effectConfig = getEffectConfig();
  const showNavigation = !['cube', 'fade', 'flip', 'cards'].includes(effect);

  const swiperKey = useMemo(() => {
    const sig = items.map(it => `${it.id}-${it.imageUrl}`).join('|');
    return `${effect}-${loop}-${sig}`;
  }, [items, effect, loop]);

  return (
    <div className={`group relative w-full ${isMobile ? 'my-[16px]' : 'my-[40px]'}`}>
      <Swiper
        key={swiperKey}
        modules={getAllModules()}
        centeredSlides={centeredSlides}
        loop={loop}
        onSwiper={onSwiper}
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        navigation={showNavigation ? {
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        } : false}
        pagination={{
          el: '.swiper-pagination-custom',
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} ${isMobile ? 'mobile-custom-bullet' : 'custom-bullet'}"></span>`;
          },
        }}
        autoplay={
          autoplay
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        breakpoints={effect === 'slide' || effect === 'coverflow' ? {
          1020: {
            slidesPerView: 1,
            spaceBetween: 72,
          },
          1648: {
            slidesPerView: 1.597,
            spaceBetween: -55,
          },
        } : undefined}
        className="w-full"
        style={{ height: computedHeight }}
        {...effectConfig}
      >
        {items.map((item, index) => (
          <SwiperSlide key={`${item.id}_${index}`} className="relative">
            <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-lg group cursor-pointer ${
              effect === 'cards' ? 'bg-white' : ''
            }`}
            onClick={() => {
              if(item.bannerLink) {
                window.open(item.bannerLink.indexOf('http') < 0 ? `https://${item.bannerLink}` : item.bannerLink, '_blank', 'noopener,noreferrer');
              }
              // if (!supportFullscreen) return;
              // setCurrentSlide(index);
              // setIsFullscreen(true);
            }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* 全屏按钮 */}
              {supportFullscreen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(index);
                    setIsFullscreen(true);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              )}

              {(item.title || item.description) && (
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  {item.title && <h3 className="text-xl font-bold mb-2">{item.title}</h3>}
                  {item.description && <p className="text-sm opacity-90">{item.description}</p>}
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute left-0 right-0 bottom-1 z-20">
        <div className="swiper-pagination-custom w-full flex justify-center gap-[8px]"></div>
      </div>
      {!isMobile && showNavigation && items.length > 1 && (
        <>
          <button className="swiper-button-prev-custom w-[42px] h-[42px] absolute left-[36px] top-1/2 -translate-y-1/2 z-20 bg-[#051A3D] border border-white/20 hover:border-white rounded-full text-white/20 hover:text-white hidden group-hover:flex items-center justify-center transition-all duration-300 hover:scale-110">
            <ChevronLeft />
          </button>

          <button className="swiper-button-next-custom w-[42px] h-[42px] absolute right-[36px] top-1/2 -translate-y-1/2 z-20 bg-[#051A3D] border border-white/20 hover:border-white rounded-full text-white/20 hover:text-white hidden group-hover:flex items-center justify-center transition-all duration-300 hover:scale-110">
            <ChevronRight />
          </button>
        </>
      )}

      <style jsx global>{`
        .custom-bullet {
          width: 30px !important;
          height: 4px !important;
          background: #ffffff !important;
          border-radius: 20px !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
          opacity: 0.1 !important;
          border: none !important;
        }

        .custom-bullet:hover {
          background: #467dff !important;
          opacity: 1 !important;
        }

        .custom-bullet.swiper-pagination-bullet-active {
          width: 60px !important;
          background: #467dff !important;
          opacity: 1 !important;
        }
        
        .mobile-custom-bullet {
            width: 4px !important;
            height: 4px !important;
            background: rgba(255,255,255,0.6) !important;
            border-radius: 20px !important;
            transition: all 0.3s ease !important;
            cursor: pointer !important;
            border: none !important;
            margin: 0 !important;
        }

        .mobile-custom-bullet:hover {
            background: #ffffff !important;
            opacity: 1 !important;
        }

        .mobile-custom-bullet.swiper-pagination-bullet-active {
            width: 4px !important;
            background: #ffffff !important;
            opacity: 1 !important;
        }

        .swiper-slide-active .group {
          transform: scale(1);
        }

        .swiper-slide:not(.swiper-slide-active) .group {
          transform: scale(0.75);
          opacity: 0.6;
        }

        .swiper-slide {
          transition: all 0.5s ease;
        }

        /* 立方体效果特殊样式 */
        .swiper-cube .swiper-slide {
          pointer-events: auto;
        }

        /* 卡片效果特殊样式 */
        .swiper-cards .swiper-slide {
          border-radius: 18px;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
        }

        /* 翻页效果特殊样式 */
        .swiper-flip .swiper-slide {
          background: #fff;
        }
        
        @media (max-width: 768px) {
            .swiper-slide:not(.swiper-slide-active) .group {
                transform: none;
            }
        }
      `}</style>

      {/* 全屏模态 */}
      <FullscreenModal
        items={items}
        isOpen={isFullscreen}
        initialSlide={currentSlide}
        onClose={() => setIsFullscreen(false)}
      />
    </div>
  );
}
