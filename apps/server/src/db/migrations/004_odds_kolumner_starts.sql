-- Migration 004: Lägg till win_odds och stake_percent på starts för snabbåtkomst
ALTER TABLE starts ADD COLUMN win_odds REAL;
ALTER TABLE starts ADD COLUMN stake_percent REAL;
