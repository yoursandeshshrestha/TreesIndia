import React from 'react';
import { View, ScrollView } from 'react-native';
import { Service } from '../../../services';
import ServiceCard from '../../../components/ServiceCard';
import HorizontalSection from './HorizontalSection';

interface ServicesSectionProps {
  title: string;
  services: Service[];
  isLoading: boolean;
  onServicePress: (service: Service) => void;
  onSeeAll?: () => void;
}

export default function ServicesSection({
  title,
  services,
  isLoading,
  onServicePress,
  onSeeAll,
}: ServicesSectionProps) {
  return (
    <HorizontalSection
      title={title}
      onSeeAll={onSeeAll}
      isLoading={isLoading}
      isEmpty={services.length === 0}
    >
      <View style={{ height: 240 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {services.map((service, index) => (
            <View
              key={service.id || service.ID || index}
              style={{ marginLeft: index === 0 ? 24 : 16 }}
            >
              <ServiceCard
                service={service}
                onPress={() => onServicePress(service)}
                onBook={() => onServicePress(service)}
                showBookButton={true}
                width={200}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </HorizontalSection>
  );
}
