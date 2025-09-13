import React from 'react';
import './index.scss';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'pulse' | 'wave' | 'dots' | 'ripple';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  type = 'spinner', 
  text = 'Loading...',
  className = ''
}) => {
  const renderLoadingContent = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className={`loading-spinner loading-${size}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`loading-pulse loading-${size}`}>
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
          </div>
        );
      
      case 'wave':
        return (
          <div className={`loading-wave loading-${size}`}>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        );
      
      case 'dots':
        return (
          <div className={`loading-dots loading-${size}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      
      case 'ripple':
        return (
          <div className={`loading-ripple loading-${size}`}>
            <div className="ripple-circle"></div>
            <div className="ripple-circle"></div>
            <div className="ripple-circle"></div>
          </div>
        );
      
      default:
        return (
          <div className={`loading-spinner loading-${size}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        );
    }
  };

  return (
    <div className={`loading-container ${className}`}>
      {renderLoadingContent()}
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

export default Loading;
