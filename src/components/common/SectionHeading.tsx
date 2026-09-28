import React from 'react';

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  kicker,
  title,
  subtitle,
  align = 'center',
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${align === 'center' ? 'text-center mx-auto' : 'text-left'} max-w-3xl ${className}`}>
      {kicker && (
        <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
          {kicker}
        </p>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide leading-tight [text-wrap:balance]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-[#D1CCC0] font-sans leading-relaxed [text-wrap:balance] max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className={`pt-2 flex ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
        <div className="w-12 h-[1px] bg-[#C5A880]/50" />
      </div>
    </div>
  );
};
