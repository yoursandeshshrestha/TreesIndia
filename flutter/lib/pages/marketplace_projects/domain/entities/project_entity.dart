class ProjectEntity {
  final int id;
  final String title;
  final String description;
  final String slug;
  final String projectType;
  final String status;
  final String state;
  final String city;
  final String address;
  final String pincode;
  final int estimatedDurationDays;
  final String contactPersonName;
  final String contactPersonPhone;
  final String contactPersonEmail;
  final String alternativeContact;
  final bool uploadedByAdmin;
  final List<String> images;
  final int userId;
  final String userDisplayName;
  final String createdAt;
  final String updatedAt;

  const ProjectEntity({
    required this.id,
    required this.title,
    required this.description,
    required this.slug,
    required this.projectType,
    required this.status,
    required this.state,
    required this.city,
    required this.address,
    required this.pincode,
    required this.estimatedDurationDays,
    required this.contactPersonName,
    required this.contactPersonPhone,
    required this.contactPersonEmail,
    required this.alternativeContact,
    required this.uploadedByAdmin,
    required this.images,
    required this.userId,
    required this.userDisplayName,
    required this.createdAt,
    required this.updatedAt,
  });

  String get formattedLocation {
    if (city.isNotEmpty && state.isNotEmpty) {
      return '$city, $state';
    } else if (city.isNotEmpty) {
      return city;
    } else if (state.isNotEmpty) {
      return state;
    }
    return 'Unknown Location';
  }

  String get formattedProjectType {
    switch (projectType.toLowerCase()) {
      case 'residential':
        return 'Residential';
      case 'commercial':
        return 'Commercial';
      case 'infrastructure':
        return 'Infrastructure';
      default:
        return projectType;
    }
  }

  String get formattedStatus {
    switch (status.toLowerCase()) {
      case 'starting_soon':
        return 'Starting Soon';
      case 'on_going':
        return 'On Going';
      case 'completed':
        return 'Completed';
      case 'on_hold':
        return 'On Hold';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  String get formattedDuration {
    if (estimatedDurationDays <= 0) {
      return 'Duration not specified';
    }

    if (estimatedDurationDays < 30) {
      return '$estimatedDurationDays days';
    } else if (estimatedDurationDays < 365) {
      final months = (estimatedDurationDays / 30).round();
      return '$months month${months > 1 ? 's' : ''}';
    } else {
      final years = (estimatedDurationDays / 365).round();
      return '$years year${years > 1 ? 's' : ''}';
    }
  }

  String get formattedCreatedAt {
    final date = DateTime.parse(createdAt);

    // Convert to IST timezone if needed
    final istDateTime = date.isUtc
        ? date.add(const Duration(hours: 5, minutes: 30))
        : date;

    return '${istDateTime.day.toString().padLeft(2, '0')}/${istDateTime.month.toString().padLeft(2, '0')}/${istDateTime.year}';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ProjectEntity && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'ProjectEntity(id: $id, title: $title, projectType: $projectType, status: $status)';
  }
}
