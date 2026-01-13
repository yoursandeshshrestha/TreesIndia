import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { createOrGetConversation } from '../../store/slices/chatSlice';
import { workerAssignmentService, WorkerAssignment } from '../../services';
import WorkerAssignmentBottomSheet from './components/WorkerAssignmentBottomSheet';

interface WorkScreenProps {
  onNavigateToChat: (
    conversationId: number,
    customerInfo: {
      id: number;
      name: string;
      phone?: string;
      profileImage?: string;
    }
  ) => void;
}

export default function WorkScreen({ onNavigateToChat }: WorkScreenProps) {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [assignments, setAssignments] = useState<WorkerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<WorkerAssignment | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;

    try {
      const statuses = activeTab === 'ongoing'
        ? 'assigned,accepted,in_progress'
        : 'completed,rejected';

      const response = await workerAssignmentService.getWorkerAssignments(statuses);
      setAssignments(response.assignments || []);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignments();
  }, [fetchAssignments]);

  const handleAcceptAssignment = async (assignmentId: number) => {
    try {
      await workerAssignmentService.acceptAssignment(assignmentId, {
        notes: 'Accepted',
      });
      fetchAssignments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept assignment';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleRejectAssignment = async (assignmentId: number) => {
    try {
      await workerAssignmentService.rejectAssignment(assignmentId, {
        reason: 'Not available',
        notes: 'Cannot accept this assignment',
      });
      fetchAssignments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject assignment';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleStartWork = async (assignment: WorkerAssignment) => {
    try {
      // Call API to start the assignment
      await workerAssignmentService.startAssignment(assignment.ID);

      // Refresh assignments to show updated status
      await fetchAssignments();

      // Show success message
      Alert.alert(
        'Work Started',
        'You can now tap the assignment card to view details and navigate to the location.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start work';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCompleteWork = async (assignmentId: number) => {
    try {
      await workerAssignmentService.completeAssignment(assignmentId);
      fetchAssignments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete work';
      Alert.alert('Error', errorMessage);
    }
  };


  const handleNavigateToChat = async (assignment: WorkerAssignment) => {
    try {
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const customerId = assignment.booking.user_id;
      const customerInfo = assignment.booking.user;

      if (!customerId || !customerInfo) {
        Alert.alert('Error', 'Customer information not available');
        return;
      }

      // Create or get conversation with the customer
      const result = await dispatch(
        createOrGetConversation({
          userId1: user.id,
          userId2: customerId,
        })
      ).unwrap();

      if (!result?.conversation?.id) {
        Alert.alert('Error', 'Failed to create conversation');
        return;
      }

      // Navigate to chat with conversation ID and customer info
      onNavigateToChat(result.conversation.id, {
        id: customerId,
        name: customerInfo.name || assignment.booking.contact_person,
        phone: assignment.booking.contact_phone,
        profileImage: customerInfo.avatar,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to open chat. Please try again.');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'assigned':
        return '#F59E0B';
      case 'accepted':
        return '#00a871';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'rejected':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'New Assignment';
      case 'accepted':
        return 'Accepted';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatAddress = (addressString?: string) => {
    if (!addressString) return null;

    try {
      const addressObj = JSON.parse(addressString);
      const parts = [];

      if (addressObj.house_number) parts.push(addressObj.house_number);
      if (addressObj.address) parts.push(addressObj.address);
      if (addressObj.landmark) parts.push(addressObj.landmark);
      if (addressObj.city) parts.push(addressObj.city);
      if (addressObj.state) parts.push(addressObj.state);
      if (addressObj.postal_code) parts.push(addressObj.postal_code);

      return parts.join(', ');
    } catch {
      // If parsing fails, return the original string
      return addressString;
    }
  };

  const handleCardPress = (assignment: WorkerAssignment) => {
    // Open bottom sheet for in_progress and completed assignments
    if (assignment.status === 'in_progress' || assignment.status === 'completed') {
      setSelectedAssignment(assignment);
      setShowBottomSheet(true);
    }
  };

  const renderAssignmentCard = (assignment: WorkerAssignment) => {
    const { booking } = assignment;
    const statusColor = getStatusColor(assignment.status);
    const isInProgress = assignment.status === 'in_progress';
    const isCompleted = assignment.status === 'completed';
    const isClickable = isInProgress || isCompleted;

    return (
      <TouchableOpacity
        key={assignment.ID}
        activeOpacity={0.7}
        className="bg-white"
        onPress={() => handleCardPress(assignment)}
        disabled={!isClickable}
      >
        <View className="px-6 py-4">
          {/* Header: Service Name and Status */}
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text
                className="text-base font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
                numberOfLines={2}
              >
                {booking.service?.name || 'Service'}
              </Text>
            </View>
            <View
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: statusColor }}
            >
              <Text
                className="text-xs font-semibold text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                {getStatusLabel(assignment.status)}
              </Text>
            </View>
          </View>

          {/* Booking ID */}
          <View className="mb-3">
            <Text
              className="text-xs font-semibold text-[#6B7280] mb-1"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              BOOKING ID
            </Text>
            <Text
              className="text-sm text-[#111928]"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              {booking.booking_reference}
            </Text>
          </View>

          {/* Schedule */}
          {(booking.scheduled_date || booking.scheduled_time) && (
            <View className="mb-3">
              <Text
                className="text-xs font-semibold text-[#6B7280] mb-1"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                SCHEDULED
              </Text>
              <Text
                className="text-sm text-[#111928]"
                style={{ fontFamily: 'Inter-Medium' }}
              >
                {booking.scheduled_date && new Date(booking.scheduled_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                {booking.scheduled_time && booking.scheduled_date && ' • '}
                {booking.scheduled_time && new Date(booking.scheduled_time).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}

          {/* Customer */}
          {booking.contact_person && (
            <View className="mb-3">
              <Text
                className="text-xs font-semibold text-[#6B7280] mb-1"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                CUSTOMER
              </Text>
              <Text
                className="text-sm text-[#111928]"
                style={{ fontFamily: 'Inter-Medium' }}
              >
                {booking.contact_person}
                {booking.contact_phone && ` • ${booking.contact_phone}`}
              </Text>
            </View>
          )}

          {/* Address */}
          {booking.address && (
            <View className="mb-3">
              <Text
                className="text-xs font-semibold text-[#6B7280] mb-1"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                ADDRESS
              </Text>
              <Text
                className="text-sm text-[#4B5563] leading-5"
                style={{ fontFamily: 'Inter-Regular' }}
                numberOfLines={2}
              >
                {formatAddress(booking.address)}
              </Text>
            </View>
          )}

          {/* Amount */}
          {booking.quote_amount && (
            <View className="mb-3">
              <Text
                className="text-xs font-semibold text-[#6B7280] mb-1"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                QUOTE AMOUNT
              </Text>
              <Text
                className="text-xl font-bold text-[#00a871]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                ₹{booking.quote_amount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          {/* Notes */}
          {assignment.assignment_notes && (
            <View className="bg-[#F9FAFB] border-y border-[#E5E7EB] -mx-6 px-6 py-3 mt-1">
              <Text
                className="text-xs font-semibold text-[#6B7280] mb-1.5"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                ASSIGNMENT NOTES
              </Text>
              <Text
                className="text-sm text-[#4B5563] leading-5"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                {assignment.assignment_notes}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {assignment.status === 'assigned' && (
            <View className="mt-4">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={() => handleRejectAssignment(assignment.ID)}
                    className="flex-1 border border-[#055c3a] bg-transparent rounded-lg py-2.5 items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Text
                      className="text-[#055c3a] text-sm font-semibold"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={() => handleAcceptAssignment(assignment.ID)}
                    className="flex-1 bg-[#055c3a] rounded-lg py-2.5 items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Text
                      className="text-white text-sm font-semibold"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Accept
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {assignment.status === 'accepted' && (
            <>
              <View className="mt-4">
                <TouchableOpacity
                  onPress={() => handleStartWork(assignment)}
                  className="bg-[#055c3a] rounded-lg py-2.5 items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Text
                    className="text-white text-sm font-semibold"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    Start Work
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="mt-2">
                <TouchableOpacity
                  onPress={() => handleNavigateToChat(assignment)}
                  className="border border-[#055c3a] bg-transparent rounded-lg py-2.5 items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Text
                    className="text-[#055c3a] text-sm font-semibold"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    Message Customer
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {assignment.status === 'in_progress' && (
            <View className="mt-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg p-3">
              <Text
                className="text-xs text-[#1E40AF] text-center"
                style={{ fontFamily: 'Inter-Medium' }}
              >
                Tap to view actions
              </Text>
            </View>
          )}

          {assignment.status === 'completed' && (
            <View className="mt-4 bg-[#D1FAE5] border border-[#6EE7B7] rounded-lg p-3">
              <Text
                className="text-xs text-[#059669] text-center"
                style={{ fontFamily: 'Inter-Medium' }}
              >
                Tap to view completion details
              </Text>
            </View>
          )}

          {assignment.status === 'rejected' && (
            <View className="mt-4">
              <TouchableOpacity
                onPress={() => handleNavigateToChat(assignment)}
                className="border border-[#055c3a] bg-transparent rounded-lg py-2.5 items-center justify-center"
                activeOpacity={0.8}
              >
                <Text
                  className="text-[#055c3a] text-sm font-semibold"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Message Customer
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View className="h-px bg-[#E5E7EB]" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
        <Text
          className="text-xl font-semibold text-[#111928] flex-1"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          My Work
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-[#E5E7EB]">
        <TouchableOpacity
          onPress={() => setActiveTab('ongoing')}
          className="flex-1"
          activeOpacity={0.7}
        >
          <View
            className={`py-4 px-6 border-b-2 ${
              activeTab === 'ongoing'
                ? 'border-[#055c3a]'
                : 'border-transparent'
            }`}
          >
            <Text
              className="text-base font-medium text-center"
              style={{
                fontFamily: 'Inter-Medium',
                color: activeTab === 'ongoing' ? '#055c3a' : '#6B7280',
              }}
            >
              Ongoing
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          className="flex-1"
          activeOpacity={0.7}
        >
          <View
            className={`py-4 px-6 border-b-2 ${
              activeTab === 'completed'
                ? 'border-[#055c3a]'
                : 'border-transparent'
            }`}
          >
            <Text
              className="text-base font-medium text-center"
              style={{
                fontFamily: 'Inter-Medium',
                color: activeTab === 'completed' ? '#055c3a' : '#6B7280',
              }}
            >
              Completed
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
        </View>
      ) : assignments.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-lg font-semibold text-[#4B5563] mb-2 mt-4 text-center"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            No {activeTab} assignments
          </Text>
          <Text
            className="text-sm text-[#6B7280] text-center"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {activeTab === 'ongoing'
              ? 'Your active work assignments will appear here'
              : 'Your completed assignments will appear here'}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#055c3a"
            />
          }
        >
          {assignments.map(renderAssignmentCard)}
        </ScrollView>
      )}

      {/* Worker Assignment Bottom Sheet */}
      <WorkerAssignmentBottomSheet
        visible={showBottomSheet}
        onClose={() => {
          setShowBottomSheet(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        onCompleteWork={(assignmentId) => {
          handleCompleteWork(assignmentId);
        }}
        onMessageCustomer={(assignment) => {
          handleNavigateToChat(assignment);
        }}
      />
    </SafeAreaView>
  );
}

