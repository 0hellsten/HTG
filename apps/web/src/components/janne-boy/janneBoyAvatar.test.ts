import { describe, it, expect } from 'vitest';
import { selectJanneBoyAvatar, getJanneBoyAvatarUrl } from './janneBoyAvatar';

describe('janneBoyAvatar', () => {
  it('väljer janneboy2 vid roll < 0.075', () => {
    expect(selectJanneBoyAvatar(0.0)).toBe('janneboy2.png');
    expect(selectJanneBoyAvatar(0.05)).toBe('janneboy2.png');
    expect(selectJanneBoyAvatar(0.074)).toBe('janneboy2.png');
  });

  it('väljer janneboy3 vid 0.075 <= roll < 0.15', () => {
    expect(selectJanneBoyAvatar(0.075)).toBe('janneboy3.png');
    expect(selectJanneBoyAvatar(0.1)).toBe('janneboy3.png');
    expect(selectJanneBoyAvatar(0.149)).toBe('janneboy3.png');
  });

  it('väljer janneboy1 vid roll >= 0.15 (85 % av fallen)', () => {
    expect(selectJanneBoyAvatar(0.15)).toBe('janneboy1.png');
    expect(selectJanneBoyAvatar(0.5)).toBe('janneboy1.png');
    expect(selectJanneBoyAvatar(0.999)).toBe('janneboy1.png');
  });

  it('genererar giltig URL med rätt bas-sökväg', () => {
    const url = getJanneBoyAvatarUrl('janneboy1.png');
    expect(url).toContain('janneboy1.png');
  });
});
