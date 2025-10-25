import { COLORS } from '@/constants/colors';
import React from 'react';
import { Text as RNText, TextProps, StyleProp, TextStyle } from 'react-native';

type TextVariant =
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

interface Props extends TextProps {
  variant?: TextVariant;
  weight?: 'regular' | 'emphasized';
  color?: 'default' | 'inverse';
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, TextStyle> = {
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

export default function Text({
  variant = 'body',
  weight = 'regular',
  color = 'default',
  style,
  children,
  ...rest
}: Props) {
  const variantStyle = variantStyles[variant];

  const textColor =
    color === 'inverse' ? COLORS.label.onLight.primary : COLORS.label.onDark.primary;

  const fontWeight = weight === 'regular' ? '400' : '600';
  return (
    <RNText
      style={[variantStyle, { color: textColor }, { fontWeight: fontWeight }, style]}
      allowFontScaling
      {...rest}
    >
      {children}
    </RNText>
  );
}
