export function selectJanneBoyAvatar(roll: number): string {
  if (roll < 0.075) {
    return 'janneboy2.png';
  }
  if (roll < 0.15) {
    return 'janneboy3.png';
  }
  return 'janneboy1.png';
}

const sessionAvatar = selectJanneBoyAvatar(Math.random());

export function getJanneBoyAvatarUrl(avatarFile = sessionAvatar): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${avatarFile}`;
}
