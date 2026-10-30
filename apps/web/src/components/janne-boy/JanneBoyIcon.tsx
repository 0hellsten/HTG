import React from 'react';
import { getJanneBoyAvatarUrl } from './janneBoyAvatar';

interface JanneBoyIconProps {
  className?: string;
  alt?: string;
}

export const JanneBoyIcon: React.FC<JanneBoyIconProps> = ({
  className = 'w-5 h-5',
  alt = 'Janne Boy',
}) => {
  return (
    <img
      src={getJanneBoyAvatarUrl()}
      alt={alt}
      className={`${className} rounded-full object-cover shrink-0 select-none`}
      loading="eager"
    />
  );
};
