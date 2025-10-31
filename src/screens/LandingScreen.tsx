import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '../components/Button';
import AccountCard from '../components/AccountCard';
import { QuickAction } from '../components/QuickAction';
import { TransactionItem } from '../components/TransactionItem';
import { AlertBanner } from '../components/AlertBanner';
import { useAuthStore } from '../state/useAuthStore';
import { useAlertsStore } from '../state/useAlertsStore';
import { ackAlert } from '../lib/alerts';
import { getCurrentLocation, formatDistance } from '../lib/geo';
import { colors, spacing, borderRadius, typography } from '../lib/theme';
import { toast } from '../lib/toast';

/**
 * Masked balance constant for hiding account balances
 */
const MASKED_BALANCE = '• • • •';

/**
 * Account interface for mock data
 */
interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number;
  last4: string;
}

/**
 * Transaction interface for mock data
 */
interface Transaction {
  id: string;
  merchant: string;
  note?: string;
  dateISO: string;
  amount: number;
  currency: string;
}

/**
 * Mock accounts data for development
 */
const accounts: Account[] = [
  {
    id: 'acc1',
    name: 'Everyday',
    currency: 'ZAR',
    balance: 12345.67,
    last4: '1023',
  },
  {
    id: 'acc2',
    name: 'Savings',
    currency: 'ZAR',
    balance: 98765.43,
    last4: '7782',
  },
  {
    id: 'acc3',
    name: 'Credit Card',
    currency: 'ZAR',
    balance: -2150.00,
    last4: '4456',
  },
];

/**
 * Mock transactions data for development
 */
const transactions: Transaction[] = [
  {
    id: 'tx1',
    merchant: 'Checkers Sandton',
    note: 'Groceries',
    dateISO: '2025-10-28',
    amount: -432.10,
    currency: 'ZAR',
  },
  {
    id: 'tx2',
    merchant: 'SnapScan',
    note: 'Coffee at Truth',
    dateISO: '2025-10-27',
    amount: -48.00,
    currency: 'ZAR',
  },
  {
    id: 'tx3',
    merchant: 'Woolworths',
    note: 'Lunch',
    dateISO: '2025-10-27',
    amount: -125.50,
    currency: 'ZAR',
  },
  {
    id: 'tx4',
    merchant: 'Uber',
    note: 'Ride to office',
    dateISO: '2025-10-26',
    amount: -87.30,
    currency: 'ZAR',
  },
  {
    id: 'tx5',
    merchant: 'Interest',
    note: 'Monthly yield',
    dateISO: '2025-10-26',
    amount: 21.98,
    currency: 'ZAR',
  },
  {
    id: 'tx6',
    merchant: 'Pick n Pay',
    note: 'Weekly shopping',
    dateISO: '2025-10-25',
    amount: -567.80,
    currency: 'ZAR',
  },
  {
    id: 'tx7',
    merchant: 'Netflix',
    note: 'Subscription',
    dateISO: '2025-10-24',
    amount: -199.00,
    currency: 'ZAR',
  },
  {
    id: 'tx8',
    merchant: 'Salary Deposit',
    note: 'Monthly salary',
    dateISO: '2025-10-23',
    amount: 25000.00,
    currency: 'ZAR',
  },
  {
    id: 'tx9',
    merchant: 'Takealot',
    note: 'Electronics',
    dateISO: '2025-10-22',
    amount: -1299.99,
    currency: 'ZAR',
  },
  {
    id: 'tx10',
    merchant: 'Dis-Chem',
    note: 'Pharmacy',
    dateISO: '2025-10-21',
    amount: -234.50,
    currency: 'ZAR',
  },
  {
    id: 'tx11',
    merchant: 'Shell',
    note: 'Fuel',
    dateISO: '2025-10-20',
    amount: -850.00,
    currency: 'ZAR',
  },
  {
    id: 'tx12',
    merchant: 'Refund',
    note: 'Return - Takealot',
    dateISO: '2025-10-19',
    amount: 299.00,
    currency: 'ZAR',
  },
];

/**
 * LandingScreen - Post-authentication home screen
 * Displays user information and provides logout functionality
 * UI is identical for NORMAL and DURESS session modes (plausible deniability)
 */
export const LandingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, sessionMode, clearSession } = useAuthStore();
  const { alerts, startForegroundAlerts, stopForegroundAlerts, removeAlert } = useAlertsStore();
  
  // Derive limitedMode from sessionMode
  const limitedMode = sessionMode === 'DURESS';
  
  // Local state for balance visibility
  const [showBalances, setShowBalances] = useState(false);
  
  // Local state for user's current location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  /**
   * Initialize alert monitoring on component mount
   * Gets current location and starts foreground alerts
   */
  useEffect(() => {
    let mounted = true;

    const initializeAlerts = async () => {
      try {
        console.log('📍 [LandingScreen] Getting current location...');
        const location = await getCurrentLocation();
        
        if (mounted) {
          console.log('📍 [LandingScreen] Location obtained:', location);
          setUserLocation(location);
          
          console.log('🚀 [LandingScreen] Starting foreground alerts...');
          await startForegroundAlerts(location);
          console.log('✅ [LandingScreen] Foreground alerts started');
        }
      } catch (error) {
        console.error('❌ [LandingScreen] Failed to initialize alerts:', error);
        // Continue without alerts if location fails
      }
    };

    initializeAlerts();

    // Cleanup on unmount
    return () => {
      mounted = false;
      console.log('🛑 [LandingScreen] Stopping foreground alerts...');
      stopForegroundAlerts();
    };
  }, [startForegroundAlerts, stopForegroundAlerts]);

  /**
   * Toggle balance visibility
   */
  const toggleBalances = () => {
    setShowBalances(prev => !prev);
  };

  /**
   * Handle alert acknowledgment
   * Calls ackAlert API and removes alert from store
   */
  const handleAck = async (alertId: string) => {
    try {
      console.log('✓ [LandingScreen] Acknowledging alert:', alertId);
      
      await ackAlert(alertId, user?.customerRef || 'unknown', 'INAPP');
      
      console.log('✅ [LandingScreen] Alert acknowledged, removing from store');
      removeAlert(alertId);
      
      toast('Alert acknowledged');
    } catch (error) {
      console.error('❌ [LandingScreen] Failed to acknowledge alert:', error);
      toast('Failed to acknowledge alert');
    }
  };

  /**
   * Handle view map action (mock implementation)
   */
  const handleMap = (alertId: string) => {
    console.log('🗺️ [LandingScreen] View map for alert:', alertId);
    toast('Map view coming soon');
  };

  /**
   * Handle call emergency action (mock implementation)
   */
  const handleCall = (alertId: string) => {
    console.log('📞 [LandingScreen] Call emergency for alert:', alertId);
    toast('Emergency call coming soon');
  };

  /**
   * Handle NFC confirmation action (mock implementation)
   */
  const handleNfc = (alertId: string) => {
    console.log('📱 [LandingScreen] NFC confirm for alert:', alertId);
    toast('NFC confirmation coming soon');
  };

  /**
   * Handle logout action
   * Clears session from SecureStore and state, then navigates to Login
   */
  const handleLogout = async () => {
    try {
      await clearSession();
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if clear fails
      navigation.navigate('Login' as never);
    }
  };

  // Get last 4 characters of session ID for display
  const sessionIdTail = user?.sessionId?.slice(-4) || '----';
  
  // Get first alert and format distance for display
  const firstAlert = alerts[0];
  const alertForDisplay = firstAlert
    ? {
        id: firstAlert.id,
        customerRef: firstAlert.customerRef,
        distance: firstAlert.distance !== undefined ? formatDistance(firstAlert.distance) : undefined,
      }
    : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Main ScrollView for all content */}
      <ScrollView 
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert Banner - Displayed when alerts exist */}
        {alertForDisplay && (
          <AlertBanner
            alert={alertForDisplay}
            onAck={() => handleAck(alertForDisplay.id)}
            onMap={() => handleMap(alertForDisplay.id)}
            onCall={() => handleCall(alertForDisplay.id)}
            onNfc={() => handleNfc(alertForDisplay.id)}
          />
        )}

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text 
              style={styles.greeting}
              accessibilityLabel={`Hi, ${user?.customerRef || 'Unknown'}`}
            >
              Hi, {user?.customerRef || 'Unknown'}
            </Text>
            <Text style={styles.tenantName}>Transrify</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            accessibilityLabel="Notifications"
            accessibilityHint="View notifications"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Limited Mode Pill - Conditional */}
        {limitedMode && (
          <View style={styles.limitedModePill}>
            <Text 
              style={styles.limitedModeText}
              accessibilityLabel="Limited mode active"
            >
              Limited Mode (Monitoring)
            </Text>
          </View>
        )}

        {/* Accounts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Accounts</Text>
            <TouchableOpacity
              onPress={toggleBalances}
              style={styles.toggleButton}
              accessibilityLabel={showBalances ? 'Hide account balances' : 'Show account balances'}
              accessibilityHint="Double tap to toggle balance visibility"
            >
              <Text style={styles.toggleButtonText}>
                {showBalances ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.accountsScrollView}
            contentContainerStyle={styles.accountsScrollContent}
          >
            {accounts.map((account) => (
              <View key={account.id} style={styles.accountCardWrapper}>
                <AccountCard
                  name={account.name}
                  maskedBalance={MASKED_BALANCE}
                  rawBalance={account.balance}
                  currency={account.currency}
                  last4={account.last4}
                  showBalances={showBalances}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <View style={styles.quickActionItem}>
              <QuickAction
                label="Send"
                icon="paper-plane-outline"
                disabled={limitedMode}
                onPress={() => toast('Send money')}
              />
            </View>
            <View style={styles.quickActionItem}>
              <QuickAction
                label="Receive"
                icon="arrow-down-outline"
                disabled={false}
                onPress={() => toast('Receive money')}
              />
            </View>
            <View style={styles.quickActionItem}>
              <QuickAction
                label="Top Up"
                icon="add-circle-outline"
                disabled={limitedMode}
                onPress={() => toast('Top up account')}
              />
            </View>
            <View style={styles.quickActionItem}>
              <QuickAction
                label="Statements"
                icon="document-text-outline"
                disabled={false}
                onPress={() => toast('View statements')}
              />
            </View>
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <FlatList
            data={transactions}
            renderItem={({ item }) => (
              <TransactionItem
                id={item.id}
                merchant={item.merchant}
                note={item.note}
                dateISO={item.dateISO}
                amount={item.amount}
                currency={item.currency}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.transactionsList}
          />
        </View>
      </ScrollView>

      {/* Session Strip - Fixed at bottom */}
      <View style={styles.sessionStrip}>
        <Text style={styles.sessionStripText}>
          Session …{sessionIdTail} · Signed in
        </Text>
        <Button
          title="Log out"
          onPress={handleLogout}
          variant="secondary"
          accessibilityLabel="Log out button"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainScrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  mainScrollViewContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tenantName: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    color: colors.textSecondary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitedModePill: {
    backgroundColor: `${colors.primary}33`, // 20% opacity (33 in hex = ~20%)
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  limitedModeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    color: colors.primary,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  toggleButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  accountsScrollView: {
    marginHorizontal: -spacing.lg, // Negative margin to allow full-width scroll
  },
  accountsScrollContent: {
    paddingHorizontal: spacing.lg,
  },
  accountCardWrapper: {
    marginRight: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    marginHorizontal: -spacing.md / 2, // Negative margin to offset item margins
  },
  quickActionItem: {
    width: '50%',
    padding: spacing.md / 2,
  },
  transactionsList: {
    backgroundColor: 'transparent',
  },
  sessionStrip: {
    backgroundColor: colors.surface,
    height: 60,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sessionStripText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.textSecondary,
    flex: 1,
  },
});

export default LandingScreen;
