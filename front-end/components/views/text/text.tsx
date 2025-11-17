import { COLORS } from '@/constants/colors';
import React from 'react';
import { Text as RNText, TextProps, StyleProp, TextStyle } from 'react-native';

type TextVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption1'
  | 'caption2';

type ColorKey =
  | 'on-dark-primary'
  | 'on-dark-secondary'
  | 'on-dark-tertiary'
  | 'on-light-primary'
  | 'on-light-secondary'
  | 'on-light-tertiary';

interface Props extends TextProps {
  variant?: TextVariant;
  weight?: 'regular' | 'emphasized';
  color?: ColorKey;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  largeTitle: { fontSize: 34, fontWeight: '400' },
  title1: { fontSize: 28, fontWeight: '400' },
  title2: { fontSize: 22, fontWeight: '400' },
  title3: { fontSize: 20, fontWeight: '400' },
  headline: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 17, fontWeight: '400' },
  callout: { fontSize: 16, fontWeight: '400' },
  subhead: { fontSize: 15, fontWeight: '400' },
  footnote: { fontSize: 13, fontWeight: '400' },
  caption1: { fontSize: 12, fontWeight: '400' },
  caption2: { fontSize: 11, fontWeight: '500' },
};

// Map color prop → actual hex from COLORS
const textColorMap: Record<ColorKey, string> = {
  'on-dark-primary': COLORS.label.onDark.primary,
  'on-dark-secondary': COLORS.label.onDark.secondary,
  'on-dark-tertiary': COLORS.label.onDark.tertiary,
  'on-light-primary': COLORS.label.onLight.primary,
  'on-light-secondary': COLORS.label.onLight.secondary,
  'on-light-tertiary': COLORS.label.onLight.tertiary,
};

export default function Text({
  variant = 'body',
  weight = 'regular',
  color = 'on-dark-primary',
  style,
  children,
  ...rest
}: Props) {
  const variantStyle = variantStyles[variant];
  const fontWeight = weight === 'regular' ? '400' : '600';
  const textColor = textColorMap[color] ?? COLORS.label.onDark.primary;

  return (
    <RNText
      style={[variantStyle, { color: textColor, fontWeight }, style]}
      allowFontScaling
      {...rest}
    >
      {children}
    </RNText>
  );
}
