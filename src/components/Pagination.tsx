"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {useLanguage} from "@/contexts/LanguageContext";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50],
  className = "",
}) => {
  const { t } = useLanguage();

  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard events when the pagination component is focused
      if (!containerRef.current?.contains(document.activeElement)) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
          }
          break;
        case 'Home':
          event.preventDefault();
          onPageChange(1);
          break;
        case 'End':
          event.preventDefault();
          onPageChange(totalPages);
          break;
        case 'Escape':
          event.preventDefault();
          setShowItemsPerPageDropdown(false);
          break;
        // Number keys for direct page navigation
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          event.preventDefault();
          const pageNum = parseInt(event.key);
          if (pageNum <= totalPages) {
            onPageChange(pageNum);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, onPageChange]);

  // Generate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Show 1, 2, 3, 4, 5, ...
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('...');
        }
      } else if (currentPage >= totalPages - 2) {
        // Show 1, ..., n-4, n-3, n-2, n-1, n
        pages.push('...');
        for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., n
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
      }

      // Always show last page if not already included
      if (!pages.includes(totalPages) && totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
    setShowItemsPerPageDropdown(false);
  };

  return (
    <div
      ref={containerRef}
      className={`h-[32px] flex items-center justify-between ${className}`}
      tabIndex={0}
      role="navigation"
      aria-label="Pagination navigation"
    >
      {/* Page info */}
      <div className="leading-[32px] text-white text-[16px]">
        {t('common.pagination', {currentPage, totalPages})}
      </div>

      {/* Page navigation */}
      <div className="flex gap-[8px]">
        {/* Previous button */}
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          tabIndex={0}
          aria-label="Go to previous page"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePreviousPage();
            }
          }}
          className={`size-[32px] rounded-[8px] border text-[12px] flex items-center justify-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${
            currentPage === 1
              ? 'border-white/20 text-white/20 cursor-not-allowed'
              : 'border-white/40 text-white/40 hover:bg-white/20 hover:text-white hover:border-transparent focus:bg-white/20 focus:text-white focus:border-transparent'
          }`}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
            tabIndex={page === '...' ? -1 : 0}
            aria-label={page === '...' ? 'More pages' : `Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && page !== '...') {
                e.preventDefault();
                handlePageClick(page);
              }
            }}
            className={`size-[32px] rounded-[8px] leading-[32px] text-[16px] text-center border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${
              page === currentPage
                ? 'bg-white/20 text-white border-transparent focus:bg-white/30'
                : page === '...'
                ? 'text-white/40 border-white/40 cursor-default'
                : 'text-white/40 border-white/40 hover:bg-white/20 hover:text-white hover:border-transparent focus:bg-white/20 focus:text-white focus:border-transparent'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          tabIndex={0}
          aria-label="Go to next page"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNextPage();
            }
          }}
          className={`size-[32px] rounded-[8px] border text-[12px] flex items-center justify-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${
            currentPage === totalPages
              ? 'border-white/20 text-white/20 cursor-not-allowed'
              : 'border-white/40 text-white/40 hover:bg-white/20 hover:text-white hover:border-transparent focus:bg-white/20 focus:text-white focus:border-transparent'
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Items per page selector */}
      <div className="relative">
        <button
          onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
          tabIndex={0}
          aria-label={`Items per page: ${itemsPerPage}`}
          aria-expanded={showItemsPerPageDropdown}
          aria-haspopup="listbox"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowItemsPerPageDropdown(!showItemsPerPageDropdown);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setShowItemsPerPageDropdown(true);
            }
          }}
          className="h-[32px] w-[98px] border border-white/40 rounded-[8px] flex items-center justify-center cursor-pointer text-[16px] text-white/40 hover:text-white transition-all gap-1 focus:outline-none focus:ring-2 focus:ring-white/50 focus:text-white"
        >
          {itemsPerPage}/{t('common.page')}
          <ChevronDown size={12} />
        </button>

        {/* Dropdown */}
        {showItemsPerPageDropdown && onItemsPerPageChange && (
          <div
            className="absolute bottom-full mb-1 right-0 bg-gray-800 border border-white/40 rounded-[8px] overflow-hidden shadow-lg"
            role="listbox"
            aria-label="Items per page options"
          >
            {itemsPerPageOptions.map((option, optionIndex) => (
              <button
                key={option}
                onClick={() => handleItemsPerPageChange(option)}
                tabIndex={0}
                role="option"
                aria-selected={option === itemsPerPage}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemsPerPageChange(option);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (optionIndex + 1) % itemsPerPageOptions.length;
                    const nextButton = e.currentTarget.parentElement?.children[nextIndex] as HTMLButtonElement;
                    nextButton?.focus();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = optionIndex === 0 ? itemsPerPageOptions.length - 1 : optionIndex - 1;
                    const prevButton = e.currentTarget.parentElement?.children[prevIndex] as HTMLButtonElement;
                    prevButton?.focus();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowItemsPerPageDropdown(false);
                  }
                }}
                className={`w-full px-4 py-2 text-left text-[14px] transition-all focus:outline-none focus:bg-white/20 focus:text-white ${
                  option === itemsPerPage
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {option}/{t('common.page')}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
