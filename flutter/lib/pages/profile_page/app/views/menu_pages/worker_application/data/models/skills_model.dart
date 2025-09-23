import '../../domain/entities/skills_entity.dart';

class SkillsModel {
  final String? experienceYears;
  final List<String> skills;

  const SkillsModel({
    required this.experienceYears,
    required this.skills,
  });

  factory SkillsModel.fromJson(Map<String, dynamic> json) {
    return SkillsModel(
      experienceYears: json['experienceYears']?.toString(),
      skills: List<String>.from(json['skills'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'experienceYears': experienceYears,
      'skills': skills,
    };
  }

  SkillsEntity toEntity() {
    return SkillsEntity(
      experienceYears: experienceYears,
      skills: skills,
    );
  }

  factory SkillsModel.fromEntity(SkillsEntity entity) {
    return SkillsModel(
      experienceYears: entity.experienceYears,
      skills: entity.skills,
    );
  }

  SkillsModel copyWith({
    String? experienceYears,
    List<String>? skills,
  }) {
    return SkillsModel(
      experienceYears: experienceYears ?? this.experienceYears,
      skills: skills ?? this.skills,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is SkillsModel &&
      other.experienceYears == experienceYears &&
      other.skills.length == skills.length &&
      other.skills.every((skill) => skills.contains(skill));
  }

  @override
  int get hashCode {
    return experienceYears.hashCode ^ skills.hashCode;
  }

  @override
  String toString() {
    return 'SkillsModel(experienceYears: $experienceYears, skills: $skills)';
  }
}