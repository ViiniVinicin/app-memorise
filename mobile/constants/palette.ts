/**
 * MemoRise — Design Token Palette
 *
 * Todas as cores do app centralizadas aqui.
 * Para mudar o visual do sistema, basta alterar estas variaveis.
 */

export const Palette = {
  // ── Base ──────────────────────────────────────────────
  background: '#E0E9EE',
  dark:       '#2E2832',
  primary:    '#D80E4E',
  secondary:  '#E4ACA6',
  white:      '#FFFFFF',
  black:      '#000000',

  // ── Accent Colors ────────────────────────────────────
  accentGreen:     '#10B981',
  accentGreenAlt:  '#16C784',
  success:         '#14B77B',
  info:            '#6269FF',
  warning:         '#FF7A2E',
  warningAlt:      '#F97316',
  teal:            '#20C997',
  link:            '#0a7ea4',

  // ── Opacity Variants (base) ──────────────────────────
  stroke:         'rgba(137, 137, 130, 0.70)',
  containerBg:    'rgba(46,  40,  50,  0.10)',
  textMuted:      'rgba(46,  40,  50,  0.50)',
  secondaryMuted: 'rgba(228, 172, 166, 0.70)',

  // ── Dark Overlays ────────────────────────────────────
  darkOverlay:  'rgba(46, 40, 50, 0.35)',
  darkSubtle:   'rgba(46, 40, 50, 0.28)',
  darkFaint:    'rgba(46, 40, 50, 0.08)',
  darkGhost:    'rgba(46, 40, 50, 0.06)',

  // ── White Overlays ───────────────────────────────────
  whiteCard:       'rgba(255, 255, 255, 0.28)',
  whiteCardMedium: 'rgba(255, 255, 255, 0.30)',
  whiteCardStrong: 'rgba(255, 255, 255, 0.32)',
  whiteCardBright: 'rgba(255, 255, 255, 0.40)',

  // ── Badge Backgrounds ────────────────────────────────
  successBadgeBg: 'rgba(39, 199, 143, 0.18)',
  infoBadgeBg:    'rgba(104, 111, 255, 0.18)',
  warningBadgeBg: 'rgba(255, 122, 46, 0.18)',
  primaryTint:    'rgba(216, 14, 78, 0.12)',

  // ── Card / Shadow ────────────────────────────────────
  cardBorder: 'rgba(160, 160, 160, 0.7)',
} as const;
