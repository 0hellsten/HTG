/**
 * Janne Boy avatar-hantering.
 *
 * janneboy1 är standard (85 % chans).
 * janneboy2 och janneboy3 ersätter janneboy1 vid 15 % sammanlagd chans vid sidladdning (7,5 % vardera).
 */

export function selectJanneBoyAvatar(roll: number): string {
  if (roll < 0.075) {
    return 'janneboy2.png';
  }
  if (roll < 0.15) {
    return 'janneboy3.png';
  }
  return 'janneboy1.png';
}

// Slumpas en gång vid appens start i webbläsaren
const sessionAvatar = selectJanneBoyAvatar(Math.random());

export function getJanneBoyAvatarUrl(avatarFile = sessionAvatar): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${avatarFile}`;
}
