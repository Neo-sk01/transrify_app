import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '../lib/theme';
import { toast } from '../lib/toast';

export interface QuickActionProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  onPress: () => void;
}

export function QuickAction({ label, icon, disabled = false, onPress }: QuickActionProps) {
  const handlePress = () => {
    if (disabled) {
      toast('Temporarily unavailable');
      return;
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityHint={disabled ? 'This action is temporarily unavailable' : `Double tap to ${label.toLowerCase()}`}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={colors.primary}
        />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
