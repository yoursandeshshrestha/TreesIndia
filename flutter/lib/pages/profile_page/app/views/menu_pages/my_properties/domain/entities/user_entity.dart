class PropertyUserEntity {
  final int id;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final String name;
  final String? email;
  final String? phone;
  final String userType;
  final String? avatar;
  final String? gender;
  final bool isActive;
  final DateTime? lastLoginAt;
  final String roleApplicationStatus;
  final DateTime? applicationDate;
  final DateTime? approvalDate;
  final double walletBalance;
  final int? subscriptionId;
  final dynamic subscription;
  final bool hasActiveSubscription;
  final DateTime? subscriptionExpiryDate;
  final dynamic notificationSettings;

  PropertyUserEntity({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.name,
    this.email,
    this.phone,
    required this.userType,
    this.avatar,
    this.gender,
    required this.isActive,
    this.lastLoginAt,
    required this.roleApplicationStatus,
    this.applicationDate,
    this.approvalDate,
    required this.walletBalance,
    this.subscriptionId,
    this.subscription,
    required this.hasActiveSubscription,
    this.subscriptionExpiryDate,
    this.notificationSettings,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PropertyUserEntity &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'UserEntity{id: $id, name: $name, userType: $userType}';
  }
}
