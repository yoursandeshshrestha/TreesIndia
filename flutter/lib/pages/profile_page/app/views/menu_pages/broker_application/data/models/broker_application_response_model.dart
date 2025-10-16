import '../../domain/entities/broker_application_entity.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/domain/entities/contact_info_entity.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/domain/entities/address_entity.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/domain/entities/documents_entity.dart';
import '../../domain/entities/broker_details_entity.dart';

class BrokerApplicationResponseModel {
  final bool success;
  final String message;
  final BrokerApplicationDataModel? data;
  final String timestamp;

  BrokerApplicationResponseModel({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory BrokerApplicationResponseModel.fromJson(Map<String, dynamic> json) {
    return BrokerApplicationResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null
          ? BrokerApplicationDataModel.fromJson(json['data'])
          : null,
      timestamp: json['timestamp'] ?? '',
    );
  }
}

class BrokerApplicationDataModel {
  final int id;
  final String createdAt;
  final String updatedAt;
  final int userId;
  final String requestedRole;
  final String status;
  final String submittedAt;
  final String reviewedAt;
  final UserModel user;
  final BrokerModel? broker;

  BrokerApplicationDataModel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.userId,
    required this.requestedRole,
    required this.status,
    required this.submittedAt,
    required this.reviewedAt,
    required this.user,
    this.broker,
  });

  factory BrokerApplicationDataModel.fromJson(Map<String, dynamic> json) {
    return BrokerApplicationDataModel(
      id: json['ID'] ?? 0,
      createdAt: json['CreatedAt'] ?? '',
      updatedAt: json['UpdatedAt'] ?? '',
      userId: json['user_id'] ?? 0,
      requestedRole: json['requested_role'] ?? '',
      status: json['status'] ?? '',
      submittedAt: json['submitted_at'] ?? '',
      reviewedAt: json['reviewed_at'] ?? '',
      user: UserModel.fromJson(json['user'] ?? {}),
      broker: json['broker'] != null
          ? BrokerModel.fromJson(json['broker'])
          : null,
    );
  }

  BrokerApplicationEntity toEntity() {
    return BrokerApplicationEntity(
      id: id.toString(),
      status: status,
      createdAt: DateTime.tryParse(createdAt),
      updatedAt: DateTime.tryParse(updatedAt),
      contactInfo: ContactInfoEntity(
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        alternativePhone: broker?.contactInfo?.alternativeNumber ?? '',
      ),
      address: AddressEntity(
        street: broker?.address?.street ?? '',
        city: broker?.address?.city ?? '',
        state: broker?.address?.state ?? '',
        pincode: broker?.address?.pincode ?? '',
        landmark: broker?.address?.landmark ?? '',
      ),
      documents: DocumentsEntity(
        aadhaarCard: broker?.documents?.aadharCard,
        panCard: broker?.documents?.panCard,
        profilePhoto: broker?.documents?.profilePic,
        policeVerification: null, // Broker doesn't need police verification
      ),
      brokerDetails: BrokerDetailsEntity(
        licenseNumber: broker?.license ?? '',
        agencyName: broker?.agency ?? '',
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

class BrokerModel {
  final int id;
  final int userId;
  final int roleApplicationId;
  final String license;
  final String agency;
  final ContactInfoResponseModel? contactInfo;
  final AddressResponseModel? address;
  final DocumentsResponseModel? documents;
  final bool isAvailable;
  final double rating;
  final int totalBookings;

  BrokerModel({
    required this.id,
    required this.userId,
    required this.roleApplicationId,
    required this.license,
    required this.agency,
    this.contactInfo,
    this.address,
    this.documents,
    required this.isAvailable,
    required this.rating,
    required this.totalBookings,
  });

  factory BrokerModel.fromJson(Map<String, dynamic> json) {
    return BrokerModel(
      id: json['ID'] ?? 0,
      userId: json['user_id'] ?? 0,
      roleApplicationId: json['role_application_id'] ?? 0,
      license: json['license'] ?? '',
      agency: json['agency'] ?? '',
      contactInfo: json['contact_info'] != null
          ? ContactInfoResponseModel.fromJson(json['contact_info'])
          : null,
      address: json['address'] != null
          ? AddressResponseModel.fromJson(json['address'])
          : null,
      documents: json['documents'] != null
          ? DocumentsResponseModel.fromJson(json['documents'])
          : null,
      isAvailable: json['is_available'] ?? false,
      rating: (json['rating'] ?? 0).toDouble(),
      totalBookings: json['total_bookings'] ?? 0,
    );
  }
}

class ContactInfoResponseModel {
  final String? alternativeNumber;

  ContactInfoResponseModel({
    this.alternativeNumber,
  });

  factory ContactInfoResponseModel.fromJson(Map<String, dynamic> json) {
    return ContactInfoResponseModel(
      alternativeNumber: json['alternative_number'],
    );
  }
}

class AddressResponseModel {
  final String street;
  final String city;
  final String state;
  final String pincode;
  final String landmark;

  AddressResponseModel({
    required this.street,
    required this.city,
    required this.state,
    required this.pincode,
    required this.landmark,
  });

  factory AddressResponseModel.fromJson(Map<String, dynamic> json) {
    return AddressResponseModel(
      street: json['street'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
      landmark: json['landmark'] ?? '',
    );
  }
}

class DocumentsResponseModel {
  final String? aadharCard;
  final String? panCard;
  final String? profilePic;

  DocumentsResponseModel({
    this.aadharCard,
    this.panCard,
    this.profilePic,
  });

  factory DocumentsResponseModel.fromJson(Map<String, dynamic> json) {
    return DocumentsResponseModel(
      aadharCard: json['aadhar_card'],
      panCard: json['pan_card'],
      profilePic: json['profile_pic'],
    );
  }
}
