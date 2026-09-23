import { describe, expect, it } from 'vitest';

import { isE2eMode } from './env';

describe('isE2eMode', () => {
  it('is on when ?e2e=1 is in the URL', () => {
    expect(isE2eMode('?e2e=1')).toBe(true);
  });

  it('is off by default', () => {
    expect(isE2eMode('')).toBe(false);
    expect(isE2eMode('?e2e=0')).toBe(false);
  });
});
