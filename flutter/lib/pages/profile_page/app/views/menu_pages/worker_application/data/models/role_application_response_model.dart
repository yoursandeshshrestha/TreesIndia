import '../../domain/entities/worker_application_entity.dart';
import '../../domain/entities/contact_info_entity.dart';
import '../../domain/entities/address_entity.dart';
import '../../domain/entities/banking_info_entity.dart';
import '../../domain/entities/documents_entity.dart';
import '../../domain/entities/skills_entity.dart';

class RoleApplicationResponseModel {
  final bool success;
  final String message;
  final RoleApplicationDataModel? data;
  final String timestamp;

  RoleApplicationResponseModel({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory RoleApplicationResponseModel.fromJson(Map<String, dynamic> json) {
    return RoleApplicationResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null
          ? RoleApplicationDataModel.fromJson(json['data'])
          : null,
      timestamp: json['timestamp'] ?? '',
    );
  }
}

class RoleApplicationDataModel {
  final int id;
  final String createdAt;
  final String updatedAt;
  final int userId;
  final String requestedRole;
  final String status;
  final String submittedAt;
  final String reviewedAt;
  final UserModel user;
  final WorkerModel? worker;

  RoleApplicationDataModel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.userId,
    required this.requestedRole,
    required this.status,
    required this.submittedAt,
    required this.reviewedAt,
    required this.user,
    this.worker,
  });

  factory RoleApplicationDataModel.fromJson(Map<String, dynamic> json) {
    return RoleApplicationDataModel(
      id: json['ID'] ?? 0,
      createdAt: json['CreatedAt'] ?? '',
      updatedAt: json['UpdatedAt'] ?? '',
      userId: json['user_id'] ?? 0,
      requestedRole: json['requested_role'] ?? '',
      status: json['status'] ?? '',
      submittedAt: json['submitted_at'] ?? '',
      reviewedAt: json['reviewed_at'] ?? '',
      user: UserModel.fromJson(json['user'] ?? {}),
      worker: json['worker'] != null
          ? WorkerModel.fromJson(json['worker'])
          : null,
    );
  }

  WorkerApplicationEntity toEntity() {
    return WorkerApplicationEntity(
      id: id.toString(),
      status: status,
      createdAt: DateTime.tryParse(createdAt),
      updatedAt: DateTime.tryParse(updatedAt),
      contactInfo: ContactInfoEntity(
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        alternativePhone: worker?.contactInfo?.alternativeNumber ?? '',
      ),
      address: AddressEntity(
        street: worker?.address?.street ?? '',
        city: worker?.address?.city ?? '',
        state: worker?.address?.state ?? '',
        pincode: worker?.address?.pincode ?? '',
        landmark: worker?.address?.landmark ?? '',
      ),
      bankingInfo: BankingInfoEntity(
        accountHolderName: worker?.bankingInfo?.accountHolderName ?? '',
        accountNumber: worker?.bankingInfo?.accountNumber ?? '',
        ifscCode: worker?.bankingInfo?.ifscCode ?? '',
        bankName: worker?.bankingInfo?.bankName ?? '',
      ),
      documents: DocumentsEntity(
        aadhaarCard: worker?.documents?.aadharCard,
        panCard: worker?.documents?.panCard,
        profilePhoto: worker?.documents?.profilePic,
        policeVerification: worker?.documents?.policeVerification,
      ),
      skills: SkillsEntity(
        experienceYears: worker?.experienceYears.toString() ?? '',
        skills: worker?.skills ?? [],
      ),
    );
  }
}

class UserModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String userType;
  final String? avatar;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.userType,
    this.avatar,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['ID'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      userType: json['user_type'] ?? '',
      avatar: json['avatar'],
    );
  }
}

class WorkerModel {
  final int id;
  final int userId;
  final int roleApplicationId;
  final String workerType;
  final ContactInfoModel? contactInfo;
  final AddressModel? address;
  final BankingInfoModel? bankingInfo;
  final DocumentsModel? documents;
  final List<String> skills;
  final int experienceYears;
  final bool isAvailable;
  final double rating;
  final int totalBookings;

  WorkerModel({
    required this.id,
    required this.userId,
    required this.roleApplicationId,
    required this.workerType,
    this.contactInfo,
    this.address,
    this.bankingInfo,
    this.documents,
    required this.skills,
    required this.experienceYears,
    required this.isAvailable,
    required this.rating,
    required this.totalBookings,
  });

  factory WorkerModel.fromJson(Map<String, dynamic> json) {
    return WorkerModel(
      id: json['ID'] ?? 0,
      userId: json['user_id'] ?? 0,
      roleApplicationId: json['role_application_id'] ?? 0,
      workerType: json['worker_type'] ?? '',
      contactInfo: json['contact_info'] != null
          ? ContactInfoModel.fromJson(json['contact_info'])
          : null,
      address: json['address'] != null
          ? AddressModel.fromJson(json['address'])
          : null,
      bankingInfo: json['banking_info'] != null
          ? BankingInfoModel.fromJson(json['banking_info'])
          : null,
      documents: json['documents'] != null
          ? DocumentsModel.fromJson(json['documents'])
          : null,
      skills: json['skills'] != null
          ? List<String>.from(json['skills'])
          : [],
      experienceYears: json['experience_years'] ?? 0,
      isAvailable: json['is_available'] ?? false,
      rating: (json['rating'] ?? 0).toDouble(),
      totalBookings: json['total_bookings'] ?? 0,
    );
  }
}

class ContactInfoModel {
  final String? alternativeNumber;

  ContactInfoModel({
    this.alternativeNumber,
  });

  factory ContactInfoModel.fromJson(Map<String, dynamic> json) {
    return ContactInfoModel(
      alternativeNumber: json['alternative_number'],
    );
  }
}

class AddressModel {
  final String street;
  final String city;
  final String state;
  final String pincode;
  final String landmark;

  AddressModel({
    required this.street,
    required this.city,
    required this.state,
    required this.pincode,
    required this.landmark,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      street: json['street'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
      landmark: json['landmark'] ?? '',
    );
  }
}

class BankingInfoModel {
  final String accountNumber;
  final String ifscCode;
  final String bankName;
  final String accountHolderName;

  BankingInfoModel({
    required this.accountNumber,
    required this.ifscCode,
    required this.bankName,
    required this.accountHolderName,
  });

  factory BankingInfoModel.fromJson(Map<String, dynamic> json) {
    return BankingInfoModel(
      accountNumber: json['account_number'] ?? '',
      ifscCode: json['ifsc_code'] ?? '',
      bankName: json['bank_name'] ?? '',
      accountHolderName: json['account_holder_name'] ?? '',
    );
  }
}

class DocumentsModel {
  final String? aadharCard;
  final String? panCard;
  final String? profilePic;
  final String? policeVerification;

  DocumentsModel({
    this.aadharCard,
    this.panCard,
    this.profilePic,
    this.policeVerification,
  });

  factory DocumentsModel.fromJson(Map<String, dynamic> json) {
    return DocumentsModel(
      aadharCard: json['aadhar_card'],
      panCard: json['pan_card'],
      profilePic: json['profile_pic'],
      policeVerification: json['police_verification'],
    );
  }
}