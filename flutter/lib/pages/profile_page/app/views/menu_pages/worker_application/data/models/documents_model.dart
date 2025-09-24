import '../../domain/entities/documents_entity.dart';

class DocumentsModel {
  final String? aadhaarCard;
  final String? panCard;
  final String? profilePhoto;
  final String? policeVerification;

  const DocumentsModel({
    this.aadhaarCard,
    this.panCard,
    this.profilePhoto,
    this.policeVerification,
  });

  factory DocumentsModel.fromJson(Map<String, dynamic> json) {
    return DocumentsModel(
      aadhaarCard: json['aadhaarCard'],
      panCard: json['panCard'],
      profilePhoto: json['profilePhoto'],
      policeVerification: json['policeVerification'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'aadhaarCard': aadhaarCard,
      'panCard': panCard,
      'profilePhoto': profilePhoto,
      'policeVerification': policeVerification,
    };
  }

  DocumentsEntity toEntity() {
    return DocumentsEntity(
      aadhaarCard: aadhaarCard,
      panCard: panCard,
      profilePhoto: profilePhoto,
      policeVerification: policeVerification,
    );
  }

  factory DocumentsModel.fromEntity(DocumentsEntity entity) {
    return DocumentsModel(
      aadhaarCard: entity.aadhaarCard,
      panCard: entity.panCard,
      profilePhoto: entity.profilePhoto,
      policeVerification: entity.policeVerification,
    );
  }

  DocumentsModel copyWith({
    String? aadhaarCard,
    String? panCard,
    String? profilePhoto,
    String? policeVerification,
  }) {
    return DocumentsModel(
      aadhaarCard: aadhaarCard ?? this.aadhaarCard,
      panCard: panCard ?? this.panCard,
      profilePhoto: profilePhoto ?? this.profilePhoto,
      policeVerification: policeVerification ?? this.policeVerification,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is DocumentsModel &&
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
    return 'DocumentsModel(aadhaarCard: $aadhaarCard, panCard: $panCard, profilePhoto: $profilePhoto, policeVerification: $policeVerification)';
  }
}