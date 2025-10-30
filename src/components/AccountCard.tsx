import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../lib/theme';

export interface AccountCardProps {
  name: string;
  maskedBalance: string;
  rawBalance: number;
  currency: string;
  last4: string;
  showBalances: boolean;
}

export default function AccountCard({
  name,
  maskedBalance,
  rawBalance,
  currency,
  last4,
  showBalances,
}: AccountCardProps) {
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const displayBalance = showBalances ? formatMoney(rawBalance) : maskedBalance;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`${name} account, ${showBalances ? formatMoney(rawBalance) : 'balance hidden'}, last 4 digits ${last4}`}
    >
      <Text style={styles.accountName}>{name}</Text>
      <Text style={styles.balance}>{displayBalance}</Text>
      <Text style={styles.currency}>{currency}</Text>
      <Text style={styles.last4}>···· {last4}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: 280,
  },
  accountName: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  balance: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  currency: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  last4: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    color: colors.textSecondary,
  },
});
