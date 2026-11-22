import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface LogoProps {
  variant?: 'full' | 'symbol' | 'wordmark' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withTagline?: boolean;
  className?: string;
  forceTheme?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  withTagline = true,
  className = '',
  forceTheme,
}) => {
  const { isDarkMode } = useFinanceStore();
  const theme = forceTheme || (isDarkMode ? 'dark' : 'light');

  const symbolSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const wordmarkSizes = {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  // Pure SVG Symbol
  const renderSymbol = () => (
    <svg
      viewBox="0 0 200 200"
      className={`${symbolSizes[size]} shrink-0 transition-transform duration-300 hover:scale-105`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`blueCyanGrad_${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="50%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        <linearGradient id={`purpleLoopGrad_${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="60%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>

        <linearGradient id={`leafGrad_${theme}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>

      {/* Top Bowl & House Silhouette of B */}
      <path
        d="M 46 28 L 108 28 C 142 28 164 44 164 74 C 164 96 148 112 124 116 L 46 116 Z"
        fill={`url(#blueCyanGrad_${theme})`}
      />

      {/* Bottom Bowl of B with Purple Gradient */}
      <path
        d="M 46 94 L 118 94 C 152 94 176 112 176 142 C 176 172 148 188 106 188 L 46 188 Z"
        fill={`url(#purpleLoopGrad_${theme})`}
      />

      {/* Integrated House Silhouette Inlay */}
      <path
        d="M 50 114 L 105 76 L 142 102 C 140 134 126 150 96 150 L 50 150 Z"
        fill={theme === 'dark' ? '#07111F' : '#FFFFFF'}
      />

      {/* 4-Square Window Element */}
      <rect
        x="94"
        y="104"
        width="10"
        height="10"
        rx="2"
        fill={theme === 'dark' ? '#22D3EE' : '#0F172A'}
      />
      <rect
        x="108"
        y="104"
        width="10"
        height="10"
        rx="2"
        fill={theme === 'dark' ? '#22D3EE' : '#0F172A'}
      />
      <rect
        x="94"
        y="118"
        width="10"
        height="10"
        rx="2"
        fill={theme === 'dark' ? '#22D3EE' : '#0F172A'}
      />
      <rect
        x="108"
        y="118"
        width="10"
        height="10"
        rx="2"
        fill={theme === 'dark' ? '#22D3EE' : '#0F172A'}
      />

      {/* Flowing Leaf / Sprout Shape */}
      <path
        d="M 28 184 C 24 140 40 102 78 88 C 66 118 64 154 28 184 Z"
        fill={`url(#leafGrad_${theme})`}
      />
      <path
        d="M 40 178 C 42 150 56 122 84 108 C 76 132 72 158 40 178 Z"
        fill="#00F2FE"
        opacity="0.8"
      />
    </svg>
  );

  if (variant === 'symbol') {
    return <div className={`inline-flex items-center ${className}`}>{renderSymbol()}</div>;
  }

  if (variant === 'icon') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-2xl p-2 shadow-lg ${
          theme === 'dark'
            ? 'bg-[#0B1728] border border-white/10'
            : 'bg-white border border-slate-200'
        } ${className}`}
      >
        {renderSymbol()}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {renderSymbol()}

      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-[0.18em]">
          <span
            className={`font-black font-sans ${wordmarkSizes[size]} leading-none ${
              theme === 'dark' ? 'text-white' : 'text-[#07111F]'
            }`}
            style={{ letterSpacing: '0.14em' }}
          >
            BARAKA
          </span>
        </div>

        {withTagline && (
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 leading-none ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Oilangiz farovonligi uchun
          </span>
        )}
      </div>
    </div>
  );
};
