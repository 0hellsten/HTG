import React from 'react';
import { Compass, MapPin, Trash2 } from 'lucide-react';
import { FavoriteItem } from '../../lib/favoriter';

interface StallTracksTabProps {
  tracks: FavoriteItem[];
  isTrackRacingToday: (trackId: string) => boolean;
  onSelectTrack: (trackId: string) => void;
  onRemoveTrack: (trackId: string) => void;
  onToggleTrack: (trackId: string, trackName: string) => void;
}

const PRESET_TRACKS = [
  { id: '1', name: 'Solvalla' },
  { id: '6', name: 'Åby' },
  { id: '7', name: 'Jägersro' },
];

export const StallTracksTab: React.FC<StallTracksTabProps> = ({
  tracks,
  isTrackRacingToday,
  onSelectTrack,
  onRemoveTrack,
  onToggleTrack,
}) => {
  return (
    <div className="space-y-4">
      <span className="text-sm font-bold text-slate-600 uppercase tracking-wider block">
        Sparade favoritbanor
      </span>

      {tracks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
            Du har inte lagt till något än. Tryck på hästskon på en häst, kusk eller bana så hamnar
            den här.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {PRESET_TRACKS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onToggleTrack(preset.id, preset.name)}
                className="min-h-[44px] px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-sm font-bold"
              >
                + Lägg till {preset.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => {
            const isRacing = isTrackRacingToday(track.id);
            return (
              <div
                key={track.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectTrack(track.id)}
                      className="text-lg sm:text-xl font-bold text-slate-950 hover:text-amber-700 transition-colors text-left focus:outline-none focus:underline"
                    >
                      {track.name}
                    </button>

                    {isRacing ? (
                      <p className="text-sm font-bold text-emerald-800 mt-0.5">
                        Kör tävlingar idag!
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 mt-0.5">Inga tävlingar idag</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onRemoveTrack(track.id)}
                    className="min-h-[44px] px-3 py-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                    title="Ta bort från Mitt stall"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Ta bort</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTrack(track.id)}
                    className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Compass className="w-4 h-4 text-slate-600" />
                    <span>Banvisaren</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
