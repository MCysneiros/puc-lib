import { cn } from '~/lib/utils';

describe('Utils - cn function', () => {
  it('merges class values correctly', () => {
    // Basic test
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    
    // Test with conditional classes
    expect(cn('text-red-500', false && 'bg-blue-500')).toBe('text-red-500');
    expect(cn('text-red-500', true && 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    
    // Test with undefined values
    expect(cn('text-red-500', undefined, 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    
    // Test with array values
    expect(cn(['text-red-500', 'p-4'])).toBe('text-red-500 p-4');
    
    // Test tailwind-merge functionality (resolving conflicts)
    expect(cn('p-4 p-6')).toBe('p-6');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    
    // Complex example
    const result = cn(
      'fixed inset-0 z-50 flex',
      'bg-background/80 backdrop-blur-sm',
      'items-center justify-center'
    );
    expect(result).toBe('fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm items-center justify-center');
  });
});
