'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import Loading from '@/components/Loading';
import './index.scss';

const GlobalLoading: React.FC = () => {
  const { isLoading, message } = useSelector((state: RootState) => state.loading);

  if (!isLoading) return null;

  return (
    <div className="global-loading-overlay">
      <div className="global-loading-content">
        <Loading type="spinner" size="large" text={message || 'Loading...'} />
      </div>
    </div>
  );
};

export default GlobalLoading;
