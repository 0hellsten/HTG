import React from 'react';

interface HastsKoIkonProps {
  className?: string;
  filled?: boolean;
  title?: string;
}

/**
 * Hästsko-ikon för favoritmarkering på banor, hästar och kuskar.
 * Tydlig symbol som känns igen direkt av travfolk.
 */
export const HastsKoIkon: React.FC<HastsKoIkonProps> = ({
  className = 'w-5 h-5',
  filled = false,
  title,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? '1.5' : '2'}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {/* Hästsko-båge */}
      <path d="M6 4.5 C6 3.5 7.5 3 8.5 3 C10 3 10 5 10 6 C10 11 14 11 14 6 C14 5 14 3 15.5 3 C16.5 3 18 3.5 18 4.5 C18 10 20 15 17 19 C14.5 22 9.5 22 7 19 C4 15 6 10 6 4.5 Z" />
      {/* Sömhål / hakar på hästskon */}
      {!filled && (
        <>
          <circle cx="8" cy="10" r="0.8" fill="currentColor" />
          <circle cx="8" cy="14" r="0.8" fill="currentColor" />
          <circle cx="10" cy="17.5" r="0.8" fill="currentColor" />
          <circle cx="16" cy="10" r="0.8" fill="currentColor" />
          <circle cx="16" cy="14" r="0.8" fill="currentColor" />
          <circle cx="14" cy="17.5" r="0.8" fill="currentColor" />
        </>
      )}
    </svg>
  );
};
