import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SubscriptionRequiredBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  contentType?: 'vendor' | 'worker' | 'project';
}

export default function SubscriptionRequiredBottomSheet({
  visible,
  onClose,
  onSubscribe,
  contentType = 'vendor',
}: SubscriptionRequiredBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['75%'], []);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const getMessage = () => {
    const messages = {
      vendor: 'Subscribe to view full vendor details and connect with trusted service providers.',
      worker: 'Subscribe to view worker profiles and hire skilled professionals.',
      project: 'Subscribe to explore project details and opportunities.',
    };
    return messages[contentType];
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
      backgroundStyle={{
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}>
      <BottomSheetScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Subscription Required</Text>
        </View>

        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/subscription.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.message}>{getMessage()}</Text>

        <View style={styles.benefits}>
          <BenefitItem text="Access to all vendor profiles" />
          <BenefitItem text="Connect with verified workers" />
          <BenefitItem text="Explore active projects" />
          <BenefitItem text="Priority customer support" />
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={onSubscribe}>
          <Text style={styles.subscribeButtonText}>View Subscription Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.dismiss()}
          style={styles.cancelButton}>
          <Text style={styles.cancelText}>Maybe Later</Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.checkmark}>✓</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#111928',
  },
  closeButton: { fontSize: 24, color: '#6B7280' },
  iconContainer: { alignItems: 'center', marginBottom: 16 },
  iconImage: { width: 150, height: 150 },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  benefits: { marginBottom: 24 },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: { fontSize: 18, color: '#00a871', marginRight: 12 },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111928',
  },
  subscribeButton: {
    backgroundColor: '#00a871',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  cancelButton: { marginTop: 16, alignItems: 'center' },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});
