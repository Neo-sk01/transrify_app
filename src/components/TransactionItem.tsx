import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, typography } from '../lib/theme';

/**
 * Props for TransactionItem component
 */
export interface TransactionItemProps {
  id: string;
  merchant: string;
  note?: string;
  dateISO: string;
  amount: number;
  currency: string;
}

/**
 * Format an ISO date string to short format (DD MMM)
 * @param dateISO - ISO date string (e.g., "2025-10-28")
 * @returns Formatted date string (e.g., "28 Oct")
 */
const formatDate = (dateISO: string): string => {
  const date = new Date(dateISO);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/**
 * Format a number as currency using Intl.NumberFormat
 * @param amount - The amount to format
 * @param currency - Currency code (e.g., "ZAR")
 * @returns Formatted currency string (e.g., "R 12,345.67")
 */
const formatMoney = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * TransactionItem - Display individual transaction in list
 * Shows merchant icon, name, note, date, and amount with color coding
 */
export const TransactionItem: React.FC<TransactionItemProps> = ({
  id,
  merchant,
  note,
  dateISO,
  amount,
  currency,
}) => {
  // Determine amount color based on positive/negative
  const amountColor = amount < 0 ? colors.error : colors.success;
  
  // Format the amount and date
  const formattedAmount = formatMoney(amount, currency);
  const formattedDate = formatDate(dateISO);

  // Create accessible description
  const transactionType = amount < 0 ? 'Payment' : 'Deposit';
  const accessibilityLabel = `${transactionType} to ${merchant}, ${formattedAmount}, ${note ? note + ', ' : ''}${formattedDate}`;

  return (
    <View 
      style={styles.container}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      <View style={styles.leftSection}>
        {/* Merchant icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="cart-outline" size={20} color={colors.textSecondary} />
        </View>
        
        {/* Merchant name and details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.merchantText}>{merchant}</Text>
          <View style={styles.metaRow}>
            {note && (
              <>
                <Text style={styles.noteText}>{note}</Text>
                <Text style={styles.separatorText}> · </Text>
              </>
            )}
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>
      </View>
      
      {/* Amount */}
      <Text style={[styles.amountText, { color: amountColor }]}>
        {formattedAmount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  detailsContainer: {
    flex: 1,
  },
  merchantText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    color: colors.textSecondary,
  },
  separatorText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    color: colors.textSecondary,
  },
  amountText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    marginLeft: spacing.md,
  },
});

export default TransactionItem;
