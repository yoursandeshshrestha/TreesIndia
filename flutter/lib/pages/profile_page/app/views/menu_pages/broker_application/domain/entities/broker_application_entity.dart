import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/app/views/widgets/application_status_badge.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/domain/entities/contact_info_entity.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/domain/entities/address_entity.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/domain/entities/documents_entity.dart';
import 'broker_details_entity.dart';

class BrokerApplicationEntity {
  final ContactInfoEntity contactInfo;
  final DocumentsEntity documents;
  final AddressEntity address;
  final BrokerDetailsEntity brokerDetails;
  final String? status;
  final String? id;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const BrokerApplicationEntity({
    required this.contactInfo,
    required this.documents,
    required this.address,
    required this.brokerDetails,
    this.status,
    this.id,
    this.createdAt,
    this.updatedAt,
  });

  BrokerApplicationEntity copyWith({
    ContactInfoEntity? contactInfo,
    DocumentsEntity? documents,
    AddressEntity? address,
    BrokerDetailsEntity? brokerDetails,
    String? status,
    String? id,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BrokerApplicationEntity(
      contactInfo: contactInfo ?? this.contactInfo,
      documents: documents ?? this.documents,
      address: address ?? this.address,
      brokerDetails: brokerDetails ?? this.brokerDetails,
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
    // Broker only needs 3 documents (no police verification)
    return documents.hasAadhaarCard &&
        documents.hasPanCard &&
        documents.hasProfilePhoto;
  }

  bool get isAddressComplete {
    return address.street.isNotEmpty &&
        address.city.isNotEmpty &&
        address.state.isNotEmpty &&
        address.pincode.isNotEmpty;
  }

  bool get areBrokerDetailsComplete {
    return brokerDetails.licenseNumber.isNotEmpty &&
        brokerDetails.agencyName.isNotEmpty;
  }

  bool get isReadyForSubmission {
    return isPersonalInfoComplete &&
        areDocumentsComplete &&
        isAddressComplete &&
        areBrokerDetailsComplete;
  }

  Map<String, bool> get stepCompletion {
    return {
      'personalInfo': isPersonalInfoComplete,
      'documents': areDocumentsComplete,
      'address': isAddressComplete,
      'brokerDetails': areBrokerDetailsComplete,
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

    return other is BrokerApplicationEntity &&
        other.contactInfo == contactInfo &&
        other.documents == documents &&
        other.address == address &&
        other.brokerDetails == brokerDetails &&
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
        brokerDetails.hashCode ^
        status.hashCode ^
        id.hashCode ^
        createdAt.hashCode ^
        updatedAt.hashCode;
  }

  @override
  String toString() {
    return 'BrokerApplicationEntity(contactInfo: $contactInfo, documents: $documents, address: $address, brokerDetails: $brokerDetails, status: $status, id: $id, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}
