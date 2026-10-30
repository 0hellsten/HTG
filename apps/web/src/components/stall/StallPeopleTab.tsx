import React, { useState } from 'react';
import { ChevronRight, Plus, Trash2, User } from 'lucide-react';
import { TodaysEntry } from '@stallbacken/shared';

interface StallPeopleTabProps {
  type: 'kusk' | 'tranare';
  items: string[];
  getEntries: (name: string) => TodaysEntry[];
  onSelectRace: (raceId: string) => void;
  onRemoveItem: (name: string) => void;
  onAddItem: (name: string) => void;
}

export const StallPeopleTab: React.FC<StallPeopleTabProps> = ({
  type,
  items,
  getEntries,
  onSelectRace,
  onRemoveItem,
  onAddItem,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualName, setManualName] = useState('');

  const isDriver = type === 'kusk';
  const title = isDriver ? 'Sparade favoritkuskar' : 'Sparade favorittränare';
  const addBtnText = isDriver ? 'Lägg till kusk' : 'Lägg till tränare';
  const inputLabel = isDriver ? 'Kuskens namn:' : 'Tränarens namn:';
  const placeholder = isDriver ? 'T.ex. Örjan Kihlström' : 'T.ex. Daniel Redén';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    onAddItem(manualName.trim());
    setManualName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">{title}</span>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{addBtnText}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-100 p-4 rounded-xl space-y-3">
          <label htmlFor="person-input" className="block text-sm font-bold text-slate-900">
            {inputLabel}
          </label>
          <div className="flex gap-2">
            <input
              id="person-input"
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-base focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Spara
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
          <User className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
            Du har inte lagt till något än. Tryck på hästskon på en häst, kusk eller bana så hamnar
            den här.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
          >
            {addBtnText}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((name) => {
            const todayRaces = getEntries(name);
            return (
              <div
                key={name}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-950">{name}</h2>
                    {todayRaces.length > 0 ? (
                      <div className="mt-1.5 space-y-1">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                          {isDriver ? 'Kör' : 'Tränar'} {todayRaces.length} lopp idag:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {todayRaces.map((entry) => (
                            <button
                              key={entry.raceId}
                              type="button"
                              onClick={() => onSelectRace(entry.raceId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <span>
                                {entry.trackName} L{entry.raceNumber} ({entry.horseName})
                              </span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mt-0.5">Inga anmälda lopp idag</p>
                    )}
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(name)}
                    className="min-h-[44px] px-3 py-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                    title="Ta bort från Mitt stall"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Ta bort</span>
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
