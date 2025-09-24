import '../../../../commons/domain/entities/user_profile_entity.dart';

class ProfileState {
  final bool isLoading;
  final bool isUpdatingProfile;
  final bool isUploadingAvatar;
  final String? errorMessage;
  final String? successMessage;
  final String? avatarUrl;
  final String? name;
  final String? email;
  final String? gender;
  final String? phone;
  final bool isProfileLoaded;
  final String userType;
  final SubscriptionEntity? subscription;
  final RoleApplicationEntity? roleApplication;

  const ProfileState({
    this.isLoading = false,
    this.isUpdatingProfile = false,
    this.isUploadingAvatar = false,
    this.errorMessage,
    this.successMessage,
    this.avatarUrl,
    this.name,
    this.email,
    this.gender,
    this.phone,
    this.isProfileLoaded = false,
    this.userType = 'normal',
    this.subscription,
    this.roleApplication,
  });

  ProfileState copyWith({
    bool? isLoading,
    bool? isUpdatingProfile,
    bool? isUploadingAvatar,
    String? errorMessage,
    String? successMessage,
    String? avatarUrl,
    String? name,
    String? email,
    String? gender,
    String? phone,
    String? userType,
    bool? isProfileLoaded,
    SubscriptionEntity? subscription,
    RoleApplicationEntity? roleApplication,
  }) {
    return ProfileState(
      isLoading: isLoading ?? this.isLoading,
      isUpdatingProfile: isUpdatingProfile ?? this.isUpdatingProfile,
      isUploadingAvatar: isUploadingAvatar ?? this.isUploadingAvatar,
      errorMessage: errorMessage ?? this.errorMessage,
      successMessage: successMessage ?? this.successMessage,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      name: name ?? this.name,
      email: email ?? this.email,
      gender: gender ?? this.gender,
      phone: phone ?? this.phone,
      userType: userType ?? this.userType,
      isProfileLoaded: isProfileLoaded ?? this.isProfileLoaded,
      subscription: subscription ?? this.subscription,
      roleApplication: roleApplication ?? this.roleApplication,
    );
  }

  ProfileState clearMessages() {
    return copyWith(
      errorMessage: null,
      successMessage: null,
    );
  }

  @override
  String toString() {
    return 'ProfileState(isLoading: $isLoading, isUpdatingProfile: $isUpdatingProfile, isUploadingAvatar: $isUploadingAvatar, errorMessage: $errorMessage, successMessage: $successMessage, avatarUrl: $avatarUrl, name: $name, email: $email, gender: $gender, phone: $phone, isProfileLoaded: $isProfileLoaded, subscription: $subscription)';
  }
}
