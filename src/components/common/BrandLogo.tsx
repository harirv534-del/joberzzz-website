import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  taglineClassName?: string;
  className?: string;
  variant?: 'vertical' | 'horizontal';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  taglineClassName = '',
  className = '',
  variant = 'vertical',
}) => {
  // Proportional sizing without distortion
  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  }[size];

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        {/* Logo without any box, outline, border, frame, or shadow */}
        <img
          src="/joberzzz-logo.png"
          alt="Joberzzz"
          className={`${iconSizes} object-contain select-none shrink-0`}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            filter: 'none',
          }}
          loading="eager"
        />
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight text-blue-600 ${titleSizes} leading-tight select-none`}
            style={{ letterSpacing: '-0.02em' }}
          >
            Joberzzz
          </span>
          {showTagline && (
            <p
              className={`font-semibold text-slate-500 uppercase tracking-wider ${taglineSizes} ${taglineClassName}`}
            >
              Jobs Today • Better Tomorrow.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Exact vertical alignment: Logo on top, "Joberzzz" directly below, perfectly centered
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* 
        Exact logo with original proportions and appearance.
        Zero shadow, zero glow, zero outline, zero border, zero frame, zero rectangular background.
      */}
      <img
        src="/joberzzz-logo.png"
        alt="Joberzzz"
        className={`${iconSizes} object-contain select-none mx-auto block`}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          filter: 'none',
        }}
        loading="eager"
      />

      {/* "Joberzzz" title placed directly below the logo, perfectly horizontally center-aligned */}
      <h1
        className={`font-black text-blue-600 ${titleSizes} tracking-tight mt-2 select-none text-center`}
        style={{ letterSpacing: '-0.02em' }}
      >
        Joberzzz
      </h1>

      {/* Official Tagline */}
      {showTagline && (
        <p
          className={`font-semibold text-slate-500 uppercase tracking-wider mt-1 text-center ${taglineSizes} ${taglineClassName}`}
        >
          Jobs Today • Better Tomorrow.
        </p>
      )}
    </div>
  );
};
