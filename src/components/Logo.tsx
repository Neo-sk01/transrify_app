import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../lib/theme';

export interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

/**
 * Logo component for Transrify branding
 * Displays the Transrify logo with responsive sizing
 * Can be easily replaced with an image asset when available
 */
export const Logo: React.FC<LogoProps> = ({ size = 'medium', style }) => {
  const logoStyle = [
    styles.container,
    size === 'small' && styles.smallContainer,
    size === 'medium' && styles.mediumContainer,
    size === 'large' && styles.largeContainer,
    style,
  ];

  const textStyle = [
    styles.text,
    size === 'small' && styles.smallText,
    size === 'medium' && styles.mediumText,
    size === 'large' && styles.largeText,
  ];

  // For now, using text-based logo
  // Replace with <Image source={require('../../assets/logo.png')} /> when asset is available
  return (
    <View style={logoStyle}>
      <Text style={textStyle}>Transrify</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallContainer: {
    height: 32,
  },
  mediumContainer: {
    height: 48,
  },
  largeContainer: {
    height: 64,
  },
  text: {
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: 20,
    lineHeight: 28,
  },
  mediumText: {
    fontSize: 28,
    lineHeight: 36,
  },
  largeText: {
    fontSize: 36,
    lineHeight: 44,
  },
});

export default Logo;
