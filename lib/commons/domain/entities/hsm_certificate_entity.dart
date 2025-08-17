// {
//             "ProfileId": 990,
//             "ProfileName": "Class 2 individual test (00F871A5)",
//             "Password": true,
//             "IsOrgBased": false
//         }

class HsmCertificateEntity {
  final int profileId;
  final String profileName;
  final bool password;
  final bool isOrgBased;

  HsmCertificateEntity({
    required this.profileId,
    required this.profileName,
    required this.password,
    required this.isOrgBased,
  });

  HsmCertificateEntity copyWith({
    int? profileId,
    String? profileName,
    bool? password,
    bool? isOrgBased,
  }) {
    return HsmCertificateEntity(
      profileId: profileId ?? this.profileId,
      profileName: profileName ?? this.profileName,
      password: password ?? this.password,
      isOrgBased: isOrgBased ?? this.isOrgBased,
    );
  }

  @override
  String toString() {
    return 'HsmCertificateEntity(profileId: $profileId, profileName: $profileName, password: $password, isOrgBased: $isOrgBased)';
  }
}
