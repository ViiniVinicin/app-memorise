/**
 * MemoRise — Design Token Palette
 *
 * Color 1 → Background  : #E0E9EE
 * Color 2 → Dark        : #2E2832
 * Color 3 → Primary     : #D80E4E
 * Color 4 → Secondary   : #E4ACA6
 *
 * Stroke  : #898982 @ 70 % → rgba(137,137,130,0.70)
 * ContBg  : #2E2832 @ 10 % → rgba(46,40,50,0.10)
 * TextMut : #2E2832 @ 50 % → rgba(46,40,50,0.50)
 * SecMut  : #E4ACA6 @ 70 % → rgba(228,172,166,0.70)
 */

export const Palette = {
  // ── Base ──────────────────────────────────────────────
  background: '#E0E9EE',
  dark:       '#2E2832',
  primary:    '#D80E4E',
  secondary:  '#E4ACA6',
  white:      '#FFFFFF',

  // ── Opacity Variants ──────────────────────────────────
  stroke:         'rgba(137, 137, 130, 0.70)',
  containerBg:    'rgba(46,  40,  50,  0.10)',
  textMuted:      'rgba(46,  40,  50,  0.50)',
  secondaryMuted: 'rgba(228, 172, 166, 0.70)',
} as const;
