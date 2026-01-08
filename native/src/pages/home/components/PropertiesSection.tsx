import React from 'react';
import { View, ScrollView } from 'react-native';
import { Property } from '../../../services';
import PropertyCardCompact from '../../../components/PropertyCardCompact';
import HorizontalSection from './HorizontalSection';

interface PropertiesSectionProps {
  title: string;
  properties: Property[];
  isLoading: boolean;
  onPropertyPress: (property: Property) => void;
  onSeeAll?: () => void;
}

export default function PropertiesSection({
  title,
  properties,
  isLoading,
  onPropertyPress,
  onSeeAll,
}: PropertiesSectionProps) {
  return (
    <HorizontalSection
      title={title}
      onSeeAll={onSeeAll}
      isLoading={isLoading}
      isEmpty={properties.length === 0}
    >
      <View style={{ height: 240 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {properties.map((property, index) => (
            <View
              key={property.id}
              style={{ marginLeft: index === 0 ? 24 : 16 }}
            >
              <PropertyCardCompact
                property={property}
                onPress={() => onPropertyPress(property)}
                width={200}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </HorizontalSection>
  );
}
