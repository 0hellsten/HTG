import React from 'react';
import { formatShoeInfo, formatSulky } from '../lib/format';

interface SkoVisareProps {
  shoesFront?: boolean;
  shoesBack?: boolean;
  shoesChanged?: boolean;
  sulkyType?: string;
}

export const SkoVisare: React.FC<SkoVisareProps> = ({
  shoesFront,
  shoesBack,
  shoesChanged,
  sulkyType,
}) => {
  const shoe = formatShoeInfo(shoesFront, shoesBack, shoesChanged);
  const sulky = formatSulky(sulkyType);
  const isAmerikansk = sulky === 'Amerikansk sulky';

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
      {/* Skokod */}
      <span
        title={shoe.label}
        className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-medium ${
          shoe.code === 'C/C'
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : shoe.code.includes('C')
            ? 'bg-amber-50 text-amber-800 border border-amber-200'
            : 'bg-slate-100 text-slate-700'
        }`}
      >
        {shoe.code}
      </span>

      {/* Skoändring */}
      {shoe.changed && (
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-semibold"
          title="Ny skoinformation sedan förra starten"
        >
          Ändring
        </span>
      )}

      {/* Sulkytyp */}
      {sulky !== '–' && (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            isAmerikansk
              ? 'bg-blue-100 text-blue-900 border border-blue-200'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isAmerikansk ? 'Amerikansk' : 'Vanlig'}
        </span>
      )}
    </div>
  );
};
