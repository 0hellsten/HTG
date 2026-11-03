import React, { useState } from 'react';

export const LaddaOverlay: React.FC = () => {
  const [imageUnavailable, setImageUnavailable] = useState(false);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-16 top-16 z-10 grid place-items-center bg-slate-100/30 backdrop-blur-[2px] lg:inset-y-0 lg:left-64"
      role="status"
    >
      <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-4 border-amber-400 bg-white shadow-lg sm:h-52 sm:w-52">
        {imageUnavailable ? (
          <span className="pb-8 text-6xl" aria-hidden="true">
            🐎
          </span>
        ) : (
          <img
            src={`${import.meta.env.BASE_URL}waiting.gif`}
            alt=""
            className="h-full w-full object-contain px-2 pb-8"
            onError={() => setImageUnavailable(true)}
          />
        )}
        <span className="absolute inset-x-0 bottom-5 text-center text-lg font-bold text-slate-800">
          Laddar…
        </span>
      </div>
    </div>
  );
};
