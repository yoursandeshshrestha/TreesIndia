class SkillsEntity {
  final int experienceYears;
  final List<String> skills;

  const SkillsEntity({
    required this.experienceYears,
    required this.skills,
  });

  SkillsEntity copyWith({
    int? experienceYears,
    List<String>? skills,
  }) {
    return SkillsEntity(
      experienceYears: experienceYears ?? this.experienceYears,
      skills: skills ?? this.skills,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'experienceYears': experienceYears,
      'skills': skills,
    };
  }

  bool get hasSkills => skills.isNotEmpty;
  bool get hasValidExperience => experienceYears >= 0;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is SkillsEntity &&
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
    return 'SkillsEntity(experienceYears: $experienceYears, skills: $skills)';
  }
}