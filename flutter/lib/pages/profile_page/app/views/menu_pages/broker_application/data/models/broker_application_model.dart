import '../../domain/entities/broker_application_entity.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/data/models/contact_info_model.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/data/models/address_model.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/data/models/documents_model.dart';
import 'broker_details_model.dart';

class BrokerApplicationModel {
  final ContactInfoModel contactInfo;
  final DocumentsModel documents;
  final AddressModel address;
  final BrokerDetailsModel brokerDetails;
  final String? status;
  final String? id;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const BrokerApplicationModel({
    required this.contactInfo,
    required this.documents,
    required this.address,
    required this.brokerDetails,
    this.status,
    this.id,
    this.createdAt,
    this.updatedAt,
  });

  factory BrokerApplicationModel.fromJson(Map<String, dynamic> json) {
    return BrokerApplicationModel(
      contactInfo: ContactInfoModel.fromJson(json['contact_info'] ?? {}),
      documents: DocumentsModel.fromJson(json['documents'] ?? {}),
      address: AddressModel.fromJson(json['address'] ?? {}),
      brokerDetails: BrokerDetailsModel.fromJson(json['broker_details'] ?? {}),
      status: json['status'],
      id: json['id']?.toString(),
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'contactInfo': contactInfo.toJson(),
      'documents': documents.toJson(),
      'address': address.toJson(),
      'brokerDetails': brokerDetails.toJson(),
      'status': status,
      'id': id,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  BrokerApplicationEntity toEntity() {
    return BrokerApplicationEntity(
      contactInfo: contactInfo.toEntity(),
      documents: documents.toEntity(),
      address: address.toEntity(),
      brokerDetails: brokerDetails.toEntity(),
      status: status,
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory BrokerApplicationModel.fromEntity(BrokerApplicationEntity entity) {
    return BrokerApplicationModel(
      contactInfo: ContactInfoModel.fromEntity(entity.contactInfo),
      documents: DocumentsModel.fromEntity(entity.documents),
      address: AddressModel.fromEntity(entity.address),
      brokerDetails: BrokerDetailsModel.fromEntity(entity.brokerDetails),
      status: entity.status,
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  BrokerApplicationModel copyWith({
    ContactInfoModel? contactInfo,
    DocumentsModel? documents,
    AddressModel? address,
    BrokerDetailsModel? brokerDetails,
    String? status,
    String? id,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BrokerApplicationModel(
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

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is BrokerApplicationModel &&
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
    return 'BrokerApplicationModel(contactInfo: $contactInfo, documents: $documents, address: $address, brokerDetails: $brokerDetails, status: $status, id: $id, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}
