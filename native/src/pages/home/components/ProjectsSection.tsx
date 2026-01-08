import React from 'react';
import { View, ScrollView } from 'react-native';
import { Project } from '../../../services';
import ProjectCard from '../../../components/ProjectCard';
import HorizontalSection from './HorizontalSection';

interface ProjectsSectionProps {
  projects: Project[];
  isLoading: boolean;
  hasActiveSubscription: boolean;
  onProjectPress: (project: Project) => void;
  onSeeAll?: () => void;
}

export default function ProjectsSection({
  projects,
  isLoading,
  hasActiveSubscription,
  onProjectPress,
  onSeeAll,
}: ProjectsSectionProps) {
  return (
    <HorizontalSection
      title="Projects"
      onSeeAll={onSeeAll}
      isLoading={isLoading}
      isEmpty={projects.length === 0}
    >
      <View style={{ height: 240 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {projects.map((project, index) => (
            <View
              key={project.id}
              style={{ marginLeft: index === 0 ? 24 : 16 }}
            >
              <ProjectCard
                project={project}
                onPress={() => onProjectPress(project)}
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
