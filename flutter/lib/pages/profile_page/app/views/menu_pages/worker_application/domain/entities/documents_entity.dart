class DocumentsEntity {
  final String? aadhaarCard;
  final String? panCard;
  final String? profilePhoto;
  final String? policeVerification;

  const DocumentsEntity({
    this.aadhaarCard,
    this.panCard,
    this.profilePhoto,
    this.policeVerification,
  });

  DocumentsEntity copyWith({
    String? aadhaarCard,
    String? panCard,
    String? profilePhoto,
    String? policeVerification,
    bool removeAadhaarCard = false,
    bool removePanCard = false,
    bool removeProfilePhoto = false,
    bool removePoliceVerification = false,
  }) {
    return DocumentsEntity(
      aadhaarCard: removeAadhaarCard ? null : (aadhaarCard ?? this.aadhaarCard),
      panCard: removePanCard ? null : (panCard ?? this.panCard),
      profilePhoto: removeProfilePhoto ? null : (profilePhoto ?? this.profilePhoto),
      policeVerification: removePoliceVerification ? null : (policeVerification ?? this.policeVerification),
    );
  }

  bool get hasAadhaarCard => aadhaarCard?.isNotEmpty == true;
  bool get hasPanCard => panCard?.isNotEmpty == true;
  bool get hasProfilePhoto => profilePhoto?.isNotEmpty == true;
  bool get hasPoliceVerification => policeVerification?.isNotEmpty == true;

  bool get areAllDocumentsUploaded =>
      hasAadhaarCard && hasPanCard && hasProfilePhoto && hasPoliceVerification;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is DocumentsEntity &&
      other.aadhaarCard == aadhaarCard &&
      other.panCard == panCard &&
      other.profilePhoto == profilePhoto &&
      other.policeVerification == policeVerification;
  }

  @override
  int get hashCode {
    return aadhaarCard.hashCode ^
      panCard.hashCode ^
      profilePhoto.hashCode ^
      policeVerification.hashCode;
  }

  @override
  String toString() {
    return 'DocumentsEntity(aadhaarCard: $aadhaarCard, panCard: $panCard, profilePhoto: $profilePhoto, policeVerification: $policeVerification)';
  }
}