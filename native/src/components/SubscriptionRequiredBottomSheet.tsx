import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Easing, Image } from 'react-native';

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
  const [isClosing, setIsClosing] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    onClose();
  };

  const getMessage = () => {
    const messages = {
      vendor: 'Subscribe to view full vendor details and connect with trusted service providers.',
      worker: 'Subscribe to view worker profiles and hire skilled professionals.',
      project: 'Subscribe to explore project details and opportunities.',
    };
    return messages[contentType];
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      <View style={styles.modalContainer}>
        {/* Animated Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Subscription Required</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            <Image source={require('../../assets/subscription.png')} style={styles.iconImage} resizeMode="contain" />
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

          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Maybe Later</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
