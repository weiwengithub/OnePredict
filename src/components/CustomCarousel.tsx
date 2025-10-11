'use client';

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
import { useState } from 'react';
import FullscreenModal from './FullscreenModal';

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

interface CarouselItem {
  id: number;
  image: string;
  title?: string;
  description?: string;
}

export type EffectType = 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'cards' | 'creative';

interface CustomCarouselProps {
  items: CarouselItem[];
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
          slidesPerView: slidesPerView,
          spaceBetween: spaceBetween,
        };

      default: // slide
        return {
          effect: 'slide' as const,
          slidesPerView: slidesPerView,
          spaceBetween: spaceBetween,
        };
    }
  };

  const effectConfig = getEffectConfig();
  const showNavigation = !['cube', 'fade', 'flip', 'cards'].includes(effect);

  return (
    <div className="relative w-full my-[40px]">
      <Swiper
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
            return `<span class="${className} custom-bullet"></span>`;
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
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: effect === 'coverflow' ? 1.5 : 1.2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: effect === 'coverflow' ? 2.2 : 2,
            spaceBetween: 25,
          },
          1024: {
            slidesPerView: 1.7, // effectConfig.slidesPerView,
            spaceBetween: effectConfig.spaceBetween,
          },
        } : undefined}
        className="w-full"
        style={{ height }}
        {...effectConfig}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id} className="relative">
            <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-lg group cursor-pointer ${
              effect === 'cards' ? 'bg-white' : ''
            }`}
            onClick={() => {
              if (!supportFullscreen) return;
              setCurrentSlide(index);
              setIsFullscreen(true);
            }}
            >
              <img
                src={item.image}
                alt={item.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  effect === 'slide' || effect === 'coverflow' ? 'group-hover:scale-105' : ''
                }`}
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

      <div className="mt-[26px] mx-auto max-w-[1020px] flex items-center justify-between">
        {/* Custom Pagination */}
        <div className="swiper-pagination-custom flex gap-[8px]"></div>
        {/* Custom Navigation Buttons - 只在支持的效果下显示 */}
        {showNavigation && (
          <div className="mr-[52px] flex gap-[13px]">
            <button className="swiper-button-prev-custom w-[42px] h-[42px] border border-white/20 hover:border-white rounded-full text-white/20 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110">
              <ChevronLeft />
            </button>

            <button className="swiper-button-next-custom w-[42px] h-[42px] border border-white/20 hover:border-white rounded-full text-white/20 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110">
              <ChevronRight />
            </button>
          </div>
        )}

      </div>

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

        .swiper-slide-active .group {
          transform: scale(1.05);
        }

        .swiper-slide:not(.swiper-slide-active) .group {
          transform: scale(0.85);
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
