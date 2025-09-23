class WorkerEntity {
  final int id;
  final int userId;
  final String workerType;
  final String name;
  final String email;
  final String phone;
  final String alternativeNumber;
  final String city;
  final String state;
  final String street;
  final String pincode;
  final String profilePicture;
  final List<String> skills;
  final int experienceYears;
  final bool isAvailable;
  final double rating;
  final int totalBookings;
  final int totalJobs;
  final bool isActive;
  final String createdAt;
  final String updatedAt;

  const WorkerEntity({
    required this.id,
    required this.userId,
    required this.workerType,
    required this.name,
    required this.email,
    required this.phone,
    this.alternativeNumber = '',
    required this.city,
    required this.state,
    this.street = '',
    this.pincode = '',
    this.profilePicture = '',
    required this.skills,
    required this.experienceYears,
    required this.isAvailable,
    required this.rating,
    required this.totalBookings,
    required this.totalJobs,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  WorkerEntity copyWith({
    int? id,
    int? userId,
    String? workerType,
    String? name,
    String? email,
    String? phone,
    String? alternativeNumber,
    String? city,
    String? state,
    String? street,
    String? pincode,
    String? profilePicture,
    List<String>? skills,
    int? experienceYears,
    bool? isAvailable,
    double? rating,
    int? totalBookings,
    int? totalJobs,
    bool? isActive,
    String? createdAt,
    String? updatedAt,
  }) {
    return WorkerEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      workerType: workerType ?? this.workerType,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      alternativeNumber: alternativeNumber ?? this.alternativeNumber,
      city: city ?? this.city,
      state: state ?? this.state,
      street: street ?? this.street,
      pincode: pincode ?? this.pincode,
      profilePicture: profilePicture ?? this.profilePicture,
      skills: skills ?? this.skills,
      experienceYears: experienceYears ?? this.experienceYears,
      isAvailable: isAvailable ?? this.isAvailable,
      rating: rating ?? this.rating,
      totalBookings: totalBookings ?? this.totalBookings,
      totalJobs: totalJobs ?? this.totalJobs,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  String get workerTypeDisplay {
    switch (workerType.toLowerCase()) {
      case 'treesindia_worker':
        return 'TreesIndia Worker';
      case 'normal':
        return 'Independent Worker';
      default:
        return workerType;
    }
  }

  String get fullAddress {
    final List<String> addressParts = [];
    if (street.isNotEmpty) addressParts.add(street);
    if (city.isNotEmpty) addressParts.add(city);
    if (state.isNotEmpty) addressParts.add(state);
    if (pincode.isNotEmpty) addressParts.add(pincode);
    return addressParts.join(', ');
  }

  String get cityState {
    final List<String> parts = [];
    if (city.isNotEmpty) parts.add(city);
    if (state.isNotEmpty) parts.add(state);
    return parts.join(', ');
  }

  String get experienceDisplay {
    if (experienceYears <= 0) {
      return 'New Worker';
    } else if (experienceYears == 1) {
      return '1 year experience';
    } else {
      return '$experienceYears years experience';
    }
  }

  @override
  String toString() {
    return 'WorkerEntity(id: $id, name: $name, workerType: $workerType, city: $city, skills: ${skills.length})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is WorkerEntity && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}