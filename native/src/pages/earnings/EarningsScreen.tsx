import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  workerEarningsService,
  PeriodFilter,
  WorkerEarningsDashboard,
} from '../../services/api/worker-earnings.service';
import {
  workerWithdrawalService,
  WorkerWithdrawalResponse,
} from '../../services/api/worker-withdrawal.service';
import WithdrawalRequestBottomSheet from './components/WithdrawalRequestBottomSheet';

type ActivityTab = 'active' | 'withdraw';

export default function EarningsScreen() {
  const [activePeriod, setActivePeriod] = useState<PeriodFilter>('30_days');
  const [activeTab, setActiveTab] = useState<ActivityTab>('active');
  const [dashboard, setDashboard] = useState<WorkerEarningsDashboard | null>(null);
  const [withdrawals, setWithdrawals] = useState<WorkerWithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null);
  const [showWithdrawalSheet, setShowWithdrawalSheet] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const data = await workerEarningsService.getEarningsDashboard(activePeriod);
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earnings data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activePeriod]);

  const fetchWithdrawals = useCallback(async () => {
    try {
      setWithdrawalsLoading(true);
      setWithdrawalsError(null);
      const data = await workerWithdrawalService.getWithdrawals(1, 20);
      setWithdrawals(data.withdrawals);
    } catch (err) {
      setWithdrawalsError(err instanceof Error ? err.message : 'Failed to load withdrawals');
    } finally {
      setWithdrawalsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab === 'withdraw') {
      fetchWithdrawals();
    }
  }, [activeTab, fetchWithdrawals]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
    if (activeTab === 'withdraw') {
      fetchWithdrawals();
    }
  }, [fetchDashboard, fetchWithdrawals, activeTab]);

  const getPeriodLabel = (period: PeriodFilter): string => {
    switch (period) {
      case '30_days':
        return '30 Days';
      case '90_days':
        return '90 Days';
      case 'all_time':
        return 'All Time';
      default:
        return '30 Days';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatHours = (hours: number): string => {
    return `${hours.toFixed(1)} hrs`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderPeriodFilter = () => {
    const periods: PeriodFilter[] = ['30_days', '90_days', 'all_time'];

    return (
      <View className="flex-row rounded-xl bg-[#F9FAFB] p-1">
        {periods.map((period) => {
          const isActive = activePeriod === period;
          return (
            <TouchableOpacity
              key={period}
              onPress={() => {
                setActivePeriod(period);
                setLoading(true);
              }}
              className={`flex-1 rounded-lg py-2.5 ${isActive ? 'bg-[#055c3a]' : 'bg-transparent'}`}
              activeOpacity={0.7}>
              <Text
                className={`text-center font-medium text-sm ${
                  isActive ? 'text-white' : 'text-[#6B7280]'
                }`}
                style={{
                  fontFamily: isActive ? 'Inter-SemiBold' : 'Inter-Medium',
                }}>
                {getPeriodLabel(period)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderActivityTabs = () => {
    const tabs: { key: ActivityTab; label: string }[] = [
      { key: 'active', label: 'Recent Active' },
      { key: 'withdraw', label: 'Recent Withdraw' },
    ];

    return (
      <View className="flex-row rounded-xl bg-[#F9FAFB] p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-lg py-2.5 ${isActive ? 'bg-[#055c3a]' : 'bg-transparent'}`}
              activeOpacity={0.7}>
              <Text
                className={`text-center font-medium text-sm ${
                  isActive ? 'text-white' : 'text-[#6B7280]'
                }`}
                style={{
                  fontFamily: isActive ? 'Inter-SemiBold' : 'Inter-Medium',
                }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderStatCard = (title: string, value: string) => {
    return (
      <View className="flex-1 rounded-xl bg-[#F9FAFB] p-4">
        <Text className="mb-2 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Medium' }}>
          {title}
        </Text>
        <Text className="font-bold text-xl text-[#111928]" style={{ fontFamily: 'Inter-Bold' }}>
          {value}
        </Text>
      </View>
    );
  };

  const getStatusColor = (status: WorkerWithdrawalResponse['status']) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#D97706';
      case 'failed':
      case 'cancelled':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: WorkerWithdrawalResponse['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderRecentAssignments = () => {
    if (!dashboard || dashboard.recent_assignments.length === 0) {
      return (
        <View className="mx-6">
          <View className="rounded-2xl bg-[#F9FAFB] p-6">
            <Text
              className="text-center text-sm text-[#6B7280]"
              style={{ fontFamily: 'Inter-Regular' }}>
              No completed services yet
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="px-6">
        {dashboard.recent_assignments.map((assignment, index) => (
          <View
            key={assignment.id}
            className={`rounded-2xl bg-[#F9FAFB] p-4 ${
              index < dashboard.recent_assignments.length - 1 ? 'mb-3' : ''
            }`}>
            {/* Service Name and Earnings */}
            <View className="mb-3 flex-row items-start justify-between">
              <Text
                className="mr-3 flex-1 font-semibold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}
                numberOfLines={2}>
                {assignment.service_name}
              </Text>
              <Text
                className="font-bold text-lg text-[#055c3a]"
                style={{ fontFamily: 'Inter-Bold' }}>
                {formatCurrency(assignment.earnings)}
              </Text>
            </View>

            {/* Details Row */}
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                {formatDate(assignment.completed_at)}
              </Text>

              {assignment.duration_hours && (
                <>
                  <View className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
                  <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                    {formatHours(assignment.duration_hours)}
                  </Text>
                </>
              )}

              <View className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
              <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                {assignment.service_type === 'fixed' ? 'Fixed' : 'Inquiry'}
              </Text>

              <View className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
              <Text className="text-xs text-[#9CA3AF]" style={{ fontFamily: 'Inter-Regular' }}>
                #{assignment.booking_reference}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRecentWithdrawals = () => {
    if (withdrawalsLoading) {
      return (
        <View className="mx-6">
          <View className="rounded-2xl bg-[#F9FAFB] p-6">
            <ActivityIndicator size="small" color="#055c3a" />
          </View>
        </View>
      );
    }

    if (withdrawalsError) {
      return (
        <View className="mx-6">
          <View className="rounded-2xl bg-[#F9FAFB] p-6">
            <Text
              className="mb-3 text-center text-sm text-[#DC2626]"
              style={{ fontFamily: 'Inter-Regular' }}>
              {withdrawalsError}
            </Text>
            <TouchableOpacity
              onPress={fetchWithdrawals}
              className="self-center rounded-lg bg-[#055c3a] px-4 py-2"
              activeOpacity={0.7}>
              <Text
                className="font-semibold text-sm text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (withdrawals.length === 0) {
      return (
        <View className="mx-6">
          <View className="rounded-2xl bg-[#F9FAFB] p-6">
            <Text
              className="text-center text-sm text-[#6B7280]"
              style={{ fontFamily: 'Inter-Regular' }}>
              No withdrawal history yet
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="px-6">
        {withdrawals.map((withdrawal, index) => (
          <View
            key={withdrawal.id}
            className={`rounded-2xl bg-[#F9FAFB] p-4 ${
              index < withdrawals.length - 1 ? 'mb-3' : ''
            }`}>
            {/* Amount and Status */}
            <View className="mb-3 flex-row items-start justify-between">
              <View className="mr-3 flex-1">
                <Text
                  className="mb-1 font-bold text-lg text-[#111928]"
                  style={{ fontFamily: 'Inter-Bold' }}>
                  {formatCurrency(withdrawal.amount)}
                </Text>
                <View
                  className="self-start rounded-md px-2 py-1"
                  style={{ backgroundColor: `${getStatusColor(withdrawal.status)}15` }}>
                  <Text
                    className="font-semibold text-xs"
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      color: getStatusColor(withdrawal.status),
                    }}>
                    {getStatusLabel(withdrawal.status)}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-[#9CA3AF]" style={{ fontFamily: 'Inter-Regular' }}>
                #{withdrawal.payment_reference}
              </Text>
            </View>

            {/* Bank Details */}
            <View className="mb-3">
              <Text
                className="mb-1 font-semibold text-sm text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                {withdrawal.account_name}
              </Text>
              <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                {withdrawal.bank_name} - {withdrawal.account_number}
              </Text>
            </View>

            {/* Details Row */}
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                Requested: {formatDate(withdrawal.requested_at)}
              </Text>

              {withdrawal.processed_at && (
                <>
                  <View className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
                  <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                    Processed: {formatDate(withdrawal.processed_at)}
                  </Text>
                </>
              )}
            </View>

            {/* Rejection Reason */}
            {withdrawal.rejection_reason && (
              <View className="mt-3 border-t border-[#E5E7EB] pt-3">
                <Text className="text-xs text-[#DC2626]" style={{ fontFamily: 'Inter-Regular' }}>
                  Reason: {withdrawal.rejection_reason}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="font-bold text-2xl text-[#111928]" style={{ fontFamily: 'Inter-Bold' }}>
          Earnings
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="mb-4 text-center text-sm text-[#DC2626]"
            style={{ fontFamily: 'Inter-Regular' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchDashboard}
            className="rounded-lg bg-[#055c3a] px-6 py-3"
            activeOpacity={0.7}>
            <Text className="font-semibold text-white" style={{ fontFamily: 'Inter-SemiBold' }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#055c3a" />
          }>
          {/* Period Filter */}
          <View className="mb-5 px-6">{renderPeriodFilter()}</View>

          {/* Summary Cards */}
          {dashboard && (
            <>
              {/* Total Earnings - Full Width */}
              <View className="mb-5 px-6">
                <View
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: '#055c3a',
                  }}>
                  <Text
                    className="mb-2 font-semibold text-xs uppercase tracking-wide"
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}>
                    {getPeriodLabel(activePeriod)}
                  </Text>
                  <Text
                    className="mb-1 font-bold text-4xl text-white"
                    style={{ fontFamily: 'Inter-Bold' }}>
                    {formatCurrency(dashboard.summary.total_earnings)}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{
                      fontFamily: 'Inter-Medium',
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}>
                    Total Earnings
                  </Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View className="mb-6 px-6">
                <View className="mb-3 flex-row gap-3">
                  {renderStatCard('Hours Worked', formatHours(dashboard.summary.hours_worked))}
                  {renderStatCard('Services', dashboard.summary.total_services.toString())}
                </View>
                <View className="flex-row gap-3">
                  {renderStatCard('Fixed', dashboard.summary.fixed_services_count.toString())}
                  {renderStatCard('Inquiry', dashboard.summary.inquiry_services_count.toString())}
                </View>
              </View>

              {/* Wallet Section */}
              {dashboard.withdrawal_summary && (
                <View className="mb-6 px-6">
                  <Text
                    className="mb-3 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    Wallet
                  </Text>

                  <View className="rounded-2xl bg-[#F9FAFB] p-5">
                    {/* Available Balance */}
                    <View className="mb-4">
                      <Text
                        className="mb-1 text-xs text-[#6B7280]"
                        style={{ fontFamily: 'Inter-Medium' }}>
                        Available Balance
                      </Text>
                      <Text
                        className="font-bold text-3xl text-[#111928]"
                        style={{ fontFamily: 'Inter-Bold' }}>
                        {formatCurrency(dashboard.withdrawal_summary.available_balance)}
                      </Text>
                    </View>

                    {/* Stats Row */}
                    <View className="mb-4 flex-row border-t border-[#E5E7EB] pt-4">
                      <View className="flex-1">
                        <Text
                          className="mb-1 text-xs text-[#6B7280]"
                          style={{ fontFamily: 'Inter-Regular' }}>
                          Withdrawn
                        </Text>
                        <Text
                          className="font-semibold text-base text-[#111928]"
                          style={{ fontFamily: 'Inter-SemiBold' }}>
                          {formatCurrency(dashboard.withdrawal_summary.total_withdrawals)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className="mb-1 text-xs text-[#6B7280]"
                          style={{ fontFamily: 'Inter-Regular' }}>
                          Pending
                        </Text>
                        <Text
                          className="font-semibold text-base text-[#D97706]"
                          style={{ fontFamily: 'Inter-SemiBold' }}>
                          {formatCurrency(dashboard.withdrawal_summary.pending_withdrawals)}
                        </Text>
                      </View>
                    </View>

                    {/* Request Withdrawal Button */}
                    <TouchableOpacity
                      onPress={() => setShowWithdrawalSheet(true)}
                      className="rounded-xl bg-[#055c3a] py-3.5"
                      activeOpacity={0.7}
                      disabled={dashboard.withdrawal_summary.available_balance <= 0}
                      style={{
                        opacity: dashboard.withdrawal_summary.available_balance <= 0 ? 0.5 : 1,
                      }}>
                      <Text
                        className="text-center font-semibold text-base text-white"
                        style={{ fontFamily: 'Inter-SemiBold' }}>
                        Request Withdrawal
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Activity Tabs Section */}
              <View className="mb-4 px-6">
                <Text
                  className="mb-3 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Activity
                </Text>
                {renderActivityTabs()}
              </View>

              {/* Tab Content */}
              {activeTab === 'active' ? renderRecentAssignments() : renderRecentWithdrawals()}

              {/* Bottom Padding */}
              <View className="h-8" />
            </>
          )}
        </ScrollView>
      )}

      {/* Withdrawal Request Bottom Sheet */}
      {dashboard?.withdrawal_summary && (
        <WithdrawalRequestBottomSheet
          visible={showWithdrawalSheet}
          onClose={() => setShowWithdrawalSheet(false)}
          availableBalance={dashboard.withdrawal_summary.available_balance}
          onSuccess={() => {
            // Refresh dashboard to show updated balance
            fetchDashboard();
          }}
        />
      )}
    </SafeAreaView>
  );
}
