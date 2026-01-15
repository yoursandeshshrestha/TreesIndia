import React from 'react';
import { View, ScrollView } from 'react-native';
import { Worker } from '../../../services';
import WorkerCard from '../../../components/WorkerCard';
import HorizontalSection from './HorizontalSection';

interface WorkersSectionProps {
  workers: Worker[];
  isLoading: boolean;
  hasActiveSubscription: boolean;
  onWorkerPress: (worker: Worker) => void;
  onSeeAll?: () => void;
}

export default function WorkersSection({
  workers,
  isLoading,
  hasActiveSubscription,
  onWorkerPress,
  onSeeAll,
}: WorkersSectionProps) {
  return (
    <HorizontalSection
      title="Top Rated Workers"
      onSeeAll={onSeeAll}
      isLoading={isLoading}
      isEmpty={workers.length === 0}>
      <View style={{ height: 240 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}>
          {workers.map((worker, index) => (
            <View key={worker.id} style={{ marginLeft: index === 0 ? 24 : 16 }}>
              <WorkerCard
                worker={worker}
                onPress={() => onWorkerPress(worker)}
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
