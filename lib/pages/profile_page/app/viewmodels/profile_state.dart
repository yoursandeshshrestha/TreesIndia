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
    bool? isProfileLoaded,
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
      isProfileLoaded: isProfileLoaded ?? this.isProfileLoaded,
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
    return 'ProfileState(isLoading: $isLoading, isUpdatingProfile: $isUpdatingProfile, isUploadingAvatar: $isUploadingAvatar, errorMessage: $errorMessage, successMessage: $successMessage, avatarUrl: $avatarUrl, name: $name, email: $email, gender: $gender, phone: $phone, isProfileLoaded: $isProfileLoaded)';
  }
}
