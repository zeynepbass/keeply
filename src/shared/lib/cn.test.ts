import { cn, mergeTextClasses } from './cn';

describe('class helpers', () => {
  it('joins truthy classes', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('lets overrides replace conflicting text classes', () => {
    expect(mergeTextClasses('font-body text-[15px] text-text', 'font-semibold text-on-primary')).toBe(
      'text-[15px] font-semibold text-on-primary',
    );
    expect(mergeTextClasses('font-display text-[21px] text-text', 'font-body text-center')).toBe(
      'text-[21px] text-text font-body text-center',
    );
    expect(mergeTextClasses('text-[12px] text-text-secondary', undefined)).toBe('text-[12px] text-text-secondary');
  });
});
