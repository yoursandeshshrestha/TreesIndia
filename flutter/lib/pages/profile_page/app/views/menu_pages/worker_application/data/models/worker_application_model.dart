import '../../domain/entities/worker_application_entity.dart';
import 'contact_info_model.dart';
import 'address_model.dart';
import 'banking_info_model.dart';
import 'documents_model.dart';
import 'skills_model.dart';

class WorkerApplicationModel {
  final ContactInfoModel contactInfo;
  final DocumentsModel documents;
  final AddressModel address;
  final SkillsModel skills;
  final BankingInfoModel bankingInfo;
  final String? status;
  final String? id;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const WorkerApplicationModel({
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

  factory WorkerApplicationModel.fromJson(Map<String, dynamic> json) {
    return WorkerApplicationModel(
      contactInfo: ContactInfoModel.fromJson(json['contactInfo'] ?? {}),
      documents: DocumentsModel.fromJson(json['documents'] ?? {}),
      address: AddressModel.fromJson(json['address'] ?? {}),
      skills: SkillsModel.fromJson(json['skills'] ?? {}),
      bankingInfo: BankingInfoModel.fromJson(json['bankingInfo'] ?? {}),
      status: json['status'],
      id: json['id'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'contactInfo': contactInfo.toJson(),
      'documents': documents.toJson(),
      'address': address.toJson(),
      'skills': skills.toJson(),
      'bankingInfo': bankingInfo.toJson(),
      'status': status,
      'id': id,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  WorkerApplicationEntity toEntity() {
    return WorkerApplicationEntity(
      contactInfo: contactInfo.toEntity(),
      documents: documents.toEntity(),
      address: address.toEntity(),
      skills: skills.toEntity(),
      bankingInfo: bankingInfo.toEntity(),
      status: status,
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory WorkerApplicationModel.fromEntity(WorkerApplicationEntity entity) {
    return WorkerApplicationModel(
      contactInfo: ContactInfoModel.fromEntity(entity.contactInfo),
      documents: DocumentsModel.fromEntity(entity.documents),
      address: AddressModel.fromEntity(entity.address),
      skills: SkillsModel.fromEntity(entity.skills),
      bankingInfo: BankingInfoModel.fromEntity(entity.bankingInfo),
      status: entity.status,
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  WorkerApplicationModel copyWith({
    ContactInfoModel? contactInfo,
    DocumentsModel? documents,
    AddressModel? address,
    SkillsModel? skills,
    BankingInfoModel? bankingInfo,
    String? status,
    String? id,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return WorkerApplicationModel(
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

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WorkerApplicationModel &&
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
    return 'WorkerApplicationModel(contactInfo: $contactInfo, documents: $documents, address: $address, skills: $skills, bankingInfo: $bankingInfo, status: $status, id: $id, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}