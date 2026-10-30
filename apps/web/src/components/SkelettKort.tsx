import React from 'react';

export const IdagSkelett: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Laddar dagens banor">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
        >
          {}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-36 bg-slate-200 rounded-md" />
                <div className="h-5 w-14 bg-amber-200/70 rounded-full" />
              </div>
              <div className="h-4 w-48 bg-slate-200 rounded" />
            </div>
            <div className="h-8 w-8 bg-slate-200 rounded-full" />
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {[1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="h-16 p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between"
              >
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-40 bg-slate-200 rounded" />
                </div>
                <div className="h-4 w-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoppSkelett: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Laddar loppkort och startlista">
      {}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
        <div className="h-4 w-24 bg-amber-200/60 rounded" />
        <div className="h-8 w-64 bg-slate-200 rounded-md" />
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-80 bg-slate-200 rounded pt-2" />
      </div>

      {}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-20 bg-slate-200 rounded" />
        </div>

        {}
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-slate-200 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-5 w-36 bg-slate-200 rounded" />
                  <div className="h-3.5 w-28 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-4 w-24 bg-slate-200 rounded hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
