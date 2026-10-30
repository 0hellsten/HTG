import React from 'react';

interface BongIconProps {
  className?: string;
  alt?: string;
}

export const BongIcon: React.FC<BongIconProps> = ({
  className = 'w-5 h-5',
  alt = 'Bong-maskinen',
}) => {
  const base = import.meta.env.BASE_URL ?? './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return (
    <img
      src={`${cleanBase}bong.png`}
      alt={alt}
      className={`${className} object-contain shrink-0 select-none`}
      loading="eager"
    />
  );
};
