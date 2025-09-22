'use client';

import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Keyboard } from 'swiper/modules';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Info
} from 'lucide-react';
import { Swiper as SwiperType } from 'swiper';

// Import additional Swiper styles
import 'swiper/css/zoom';
import 'swiper/css/keyboard';

interface CarouselItem {
  id: number;
  image: string;
  title?: string;
  description?: string;
}

interface FullscreenModalProps {
  items: CarouselItem[];
  isOpen: boolean;
  initialSlide: number;
  onClose: () => void;
}

export default function FullscreenModal({
  items,
  isOpen,
  initialSlide,
  onClose,
}: FullscreenModalProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 键盘事件处理
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          swiperRef.current?.slidePrev();
          break;
        case 'ArrowRight':
          swiperRef.current?.slideNext();
          break;
        case 'i':
        case 'I':
          setShowInfo(!showInfo);
          break;
        case '+':
        case '=':
          setZoom((prev) => Math.min(prev * 1.5, 5));
          break;
        case '-':
          setZoom((prev) => Math.max(prev / 1.5, 0.5));
          break;
        case 'r':
        case 'R':
          setRotation((prev) => (prev + 90) % 360);
          break;
        case '0':
          setZoom(1);
          setRotation(0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showInfo, onClose]);

  // 自动隐藏控件
  useEffect(() => {
    if (!isOpen) return;

    const resetHideTimer = () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      setShowControls(true);
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetHideTimer();
    const handleTouchStart = () => resetHideTimer();

    resetHideTimer();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isOpen]);

  // 缩放和旋转处理
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.5, 0.5));
  };

  const resetZoomAndRotation = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = async () => {
    const currentItem = items[currentSlide];
    try {
      const response = await fetch(currentItem.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentItem.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    const currentItem = items[currentSlide];
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentItem.title,
          text: currentItem.description,
          url: currentItem.image,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // 复制到剪贴板作为后备方案
      navigator.clipboard.writeText(currentItem.image);
      alert('图片链接已复制到剪贴板');
    }
  };

  if (!isOpen) return null;

  const currentItem = items[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 主要轮播区域 */}
      <Swiper
        modules={[Navigation, Pagination, Zoom, Keyboard]}
        initialSlide={initialSlide}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          prevEl: '.fullscreen-prev',
          nextEl: '.fullscreen-next',
        }}
        pagination={{
          el: '.fullscreen-pagination',
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} fullscreen-bullet"></span>`;
          },
        }}
        zoom={{
          maxRatio: 5,
          minRatio: 0.5,
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: false,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setCurrentSlide(swiper.activeIndex);
          resetZoomAndRotation();
        }}
        className="w-full h-full"
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id} className="flex items-center justify-center">
            <div className="swiper-zoom-container">
              <img
                src={item.image}
                alt={item.title}
                className="max-w-full max-h-full object-contain cursor-pointer"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                }}
                onClick={() => setShowControls(!showControls)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 顶部控制栏 */}
      <div className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-white">
              <h3 className="font-semibold text-lg">{currentItem.title}</h3>
              <p className="text-sm opacity-80">{currentSlide + 1} / {items.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                showInfo ? 'bg-blue-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <Info className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleDownload}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 侧边控制栏 */}
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ZoomIn className="w-6 h-6" />
          </button>

          <button
            onClick={handleZoomOut}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ZoomOut className="w-6 h-6" />
          </button>

          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <RotateCw className="w-6 h-6" />
          </button>

          <button
            onClick={resetZoomAndRotation}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <Maximize2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 导航按钮 */}
      <button className={`fullscreen-prev absolute left-4 bottom-20 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button className={`fullscreen-next absolute right-4 bottom-20 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 底部分页器和信息 */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="fullscreen-pagination flex justify-center mb-4"></div>

        {showInfo && (
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <h4 className="text-white font-semibold text-lg mb-2">{currentItem.title}</h4>
            <p className="text-gray-300 text-sm mb-3">{currentItem.description}</p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>缩放: {zoom.toFixed(1)}x | 旋转: {rotation}°</p>
              <p>快捷键: ESC关闭 | ←→导航 | +/-缩放 | R旋转 | I信息 | 0重置</p>
            </div>
          </div>
        )}
      </div>

      {/* 全屏样式 */}
      <style jsx global>{`
        .fullscreen-bullet {
          width: 12px !important;
          height: 12px !important;
          background: rgba(255, 255, 255, 0.5) !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
          margin: 0 4px !important;
        }

        .fullscreen-bullet:hover {
          background: rgba(255, 255, 255, 0.8) !important;
          transform: scale(1.2) !important;
        }

        .fullscreen-bullet.swiper-pagination-bullet-active {
          background: #ffffff !important;
          transform: scale(1.3) !important;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important;
        }
      `}</style>
    </div>
  );
}
