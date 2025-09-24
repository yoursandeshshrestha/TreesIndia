class VendorEntity {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String? deletedAt;
  final String vendorName;
  final String businessDescription;
  final String contactPersonName;
  final String contactPersonPhone;
  final String contactPersonEmail;
  final String businessAddress;
  final String businessType;
  final int yearsInBusiness;
  final String profilePicture;
  final bool isActive;
  final int userId;
  final List<String> servicesOffered;
  final List<String> businessGallery;
  final UserEntity? user;

  VendorEntity({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.vendorName,
    required this.businessDescription,
    required this.contactPersonName,
    required this.contactPersonPhone,
    required this.contactPersonEmail,
    required this.businessAddress,
    required this.businessType,
    required this.yearsInBusiness,
    required this.profilePicture,
    required this.isActive,
    required this.userId,
    required this.servicesOffered,
    required this.businessGallery,
    this.user,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is VendorEntity && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'VendorEntity(id: $id, vendorName: $vendorName, businessType: $businessType)';
  }
}

class UserEntity {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String? deletedAt;
  final String name;
  final String? email;
  final String phone;
  final String userType;
  final String avatar;
  final String gender;
  final bool isActive;
  final String lastLoginAt;
  final String roleApplicationStatus;
  final String? applicationDate;
  final String? approvalDate;
  final double walletBalance;
  final int? subscriptionId;
  final dynamic subscription;
  final bool hasActiveSubscription;
  final String subscriptionExpiryDate;
  final dynamic notificationSettings;

  UserEntity({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.name,
    this.email,
    required this.phone,
    required this.userType,
    required this.avatar,
    required this.gender,
    required this.isActive,
    required this.lastLoginAt,
    required this.roleApplicationStatus,
    this.applicationDate,
    this.approvalDate,
    required this.walletBalance,
    this.subscriptionId,
    this.subscription,
    required this.hasActiveSubscription,
    required this.subscriptionExpiryDate,
    this.notificationSettings,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserEntity && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'UserEntity(id: $id, name: $name, phone: $phone)';
  }
}