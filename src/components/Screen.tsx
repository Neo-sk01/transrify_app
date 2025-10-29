import React from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing } from '../lib/theme';

export interface ScreenProps {
  children: React.ReactNode;
  withKeyboardAvoid?: boolean;
  style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  withKeyboardAvoid = false,
  style,
}) => {
  const content = (
    <SafeAreaView style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );

  if (withKeyboardAvoid) {
    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  keyboardAvoid: {
    flex: 1,
  },
});

export default Screen;
