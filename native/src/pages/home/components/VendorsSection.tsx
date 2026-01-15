import React from 'react';
import { View, ScrollView } from 'react-native';
import { Vendor } from '../../../services';
import VendorCard from '../../../components/VendorCard';
import HorizontalSection from './HorizontalSection';

interface VendorsSectionProps {
  vendors: Vendor[];
  isLoading: boolean;
  hasActiveSubscription: boolean;
  onVendorPress: (vendor: Vendor) => void;
  onSeeAll?: () => void;
}

export default function VendorsSection({
  vendors,
  isLoading,
  hasActiveSubscription,
  onVendorPress,
  onSeeAll,
}: VendorsSectionProps) {
  return (
    <HorizontalSection
      title="Top Vendors"
      onSeeAll={onSeeAll}
      isLoading={isLoading}
      isEmpty={vendors.length === 0}>
      <View style={{ height: 240 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}>
          {vendors.map((vendor, index) => (
            <View key={vendor.id} style={{ marginLeft: index === 0 ? 24 : 16 }}>
              <VendorCard
                vendor={vendor}
                onPress={() => onVendorPress(vendor)}
                shouldBlur={!hasActiveSubscription}
                width={200}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </HorizontalSection>
  );
}
