import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/app/views/widgets/application_status_badge.dart';

import 'contact_info_entity.dart';
import 'address_entity.dart';
import 'banking_info_entity.dart';
import 'documents_entity.dart';
import 'skills_entity.dart';

class WorkerApplicationEntity {
  final ContactInfoEntity contactInfo;
  final DocumentsEntity documents;
  final AddressEntity address;
  final SkillsEntity skills;
  final BankingInfoEntity bankingInfo;
  final String? status;
  final String? id;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const WorkerApplicationEntity({
    required this.contactInfo,
    required this.documents,
    required this.address,
    required this.skills,
    required this.bankingInfo,
    this.status,
    this.id,
    this.createdAt,
    this.updatedAt,
  });

  WorkerApplicationEntity copyWith({
    ContactInfoEntity? contactInfo,
    DocumentsEntity? documents,
    AddressEntity? address,
    SkillsEntity? skills,
    BankingInfoEntity? bankingInfo,
    String? status,
    String? id,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return WorkerApplicationEntity(
      contactInfo: contactInfo ?? this.contactInfo,
      documents: documents ?? this.documents,
      address: address ?? this.address,
      skills: skills ?? this.skills,
      bankingInfo: bankingInfo ?? this.bankingInfo,
      status: status ?? this.status,
      id: id ?? this.id,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  bool get isPersonalInfoComplete {
    return contactInfo.fullName.isNotEmpty &&
        contactInfo.email.isNotEmpty &&
        contactInfo.phone.isNotEmpty &&
        contactInfo.alternativePhone.isNotEmpty;
  }

  bool get areDocumentsComplete {
    return documents.areAllDocumentsUploaded;
  }

  bool get isAddressComplete {
    return address.street.isNotEmpty &&
        address.city.isNotEmpty &&
        address.state.isNotEmpty &&
        address.pincode.isNotEmpty;
  }

  bool get areSkillsComplete {
    return skills.hasSkills && skills.hasValidExperience;
  }

  bool get isBankingInfoComplete {
    return bankingInfo.accountHolderName.isNotEmpty &&
        bankingInfo.accountNumber.isNotEmpty &&
        bankingInfo.ifscCode.isNotEmpty &&
        bankingInfo.bankName.isNotEmpty;
  }

  bool get isReadyForSubmission {
    return isPersonalInfoComplete &&
        areDocumentsComplete &&
        isAddressComplete &&
        areSkillsComplete &&
        isBankingInfoComplete;
  }

  Map<String, bool> get stepCompletion {
    return {
      'personalInfo': isPersonalInfoComplete,
      'documents': areDocumentsComplete,
      'address': isAddressComplete,
      'skills': areSkillsComplete,
      'banking': isBankingInfoComplete,
    };
  }

  ApplicationStatus get applicationStatus {
    return ApplicationStatusBadge.fromString(status ?? 'pending');
  }

  bool get isApproved {
    return applicationStatus == ApplicationStatus.approved;
  }

  bool get isPending {
    return applicationStatus == ApplicationStatus.pending;
  }

  bool get isRejected {
    return applicationStatus == ApplicationStatus.rejected;
  }

  bool get isUnderReview {
    return applicationStatus == ApplicationStatus.underReview;
  }

  bool get hasExistingApplication {
    return id != null && id!.isNotEmpty;
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WorkerApplicationEntity &&
        other.contactInfo == contactInfo &&
        other.documents == documents &&
        other.address == address &&
        other.skills == skills &&
        other.bankingInfo == bankingInfo &&
        other.status == status &&
        other.id == id &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return contactInfo.hashCode ^
        documents.hashCode ^
        address.hashCode ^
        skills.hashCode ^
        bankingInfo.hashCode ^
        status.hashCode ^
        id.hashCode ^
        createdAt.hashCode ^
        updatedAt.hashCode;
  }

  @override
  String toString() {
    return 'WorkerApplicationEntity(contactInfo: $contactInfo, documents: $documents, address: $address, skills: $skills, bankingInfo: $bankingInfo, status: $status, id: $id, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}
