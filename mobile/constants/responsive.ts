import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base de design: iPhone 13 (390x844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Escala horizontal — para fontes e tamanhos gerais
export function rs(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * (SCREEN_WIDTH / BASE_WIDTH)));
}

// Escala vertical — para alturas e espaçamentos
export function vs(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * (SCREEN_HEIGHT / BASE_HEIGHT)));
}

// Escala moderada — evita que telas grandes fiquem exageradas
export function ms(size: number, factor = 0.5): number {
  return Math.round(size + (rs(size) - size) * factor);
}

export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_HEIGHT < 700,
  isMedium: SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 850,
  isLarge: SCREEN_HEIGHT >= 850,
};