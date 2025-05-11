import { cn } from '~/lib/utils';
import { vi } from 'vitest';

describe('cn function', () => {
  it('merges class names correctly', () => {
    const result = cn('test1', 'test2');
    expect(result).toBe('test1 test2');
  });

  it('handles conditional classes', () => {
    const condition = true;
    const result = cn('base', condition && 'conditional');
    expect(result).toBe('base conditional');
  });

  it('handles false conditions', () => {
    const condition = false;
    const result = cn('base', condition && 'conditional');
    expect(result).toBe('base');
  });
});
