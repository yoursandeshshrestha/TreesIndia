import 'dart:convert';
import '../../domain/entities/worker_entity.dart';

class WorkerModel {
  final int id;
  final String createdAt;
  final String updatedAt;
  final int userId;
  final int roleApplicationId;
  final String workerType;
  final String contactInfo;
  final String address;
  final String bankingInfo;
  final String documents;
  final String skills;
  final int experienceYears;
  final bool isAvailable;
  final double rating;
  final int totalBookings;
  final double earnings;
  final int totalJobs;
  final bool isActive;

  const WorkerModel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.userId,
    required this.roleApplicationId,
    required this.workerType,
    required this.contactInfo,
    required this.address,
    required this.bankingInfo,
    required this.documents,
    required this.skills,
    required this.experienceYears,
    required this.isAvailable,
    required this.rating,
    required this.totalBookings,
    required this.earnings,
    required this.totalJobs,
    required this.isActive,
  });

  factory WorkerModel.fromJson(Map<String, dynamic> json) {
    return WorkerModel(
      id: json['ID'] ?? 0,
      createdAt: json['CreatedAt'] ?? '',
      updatedAt: json['UpdatedAt'] ?? '',
      userId: json['user_id'] ?? 0,
      roleApplicationId: json['role_application_id'] ?? 0,
      workerType: json['worker_type'] ?? '',
      contactInfo: json['contact_info'] ?? '{}',
      address: json['address'] ?? '{}',
      bankingInfo: json['banking_info'] ?? '{}',
      documents: json['documents'] ?? '{}',
      skills: json['skills'] ?? '[]',
      experienceYears: json['experience_years'] ?? 0,
      isAvailable: json['is_available'] ?? false,
      rating: (json['rating'] ?? 0).toDouble(),
      totalBookings: json['total_bookings'] ?? 0,
      earnings: (json['earnings'] ?? 0).toDouble(),
      totalJobs: json['total_jobs'] ?? 0,
      isActive: json['is_active'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'CreatedAt': createdAt,
      'UpdatedAt': updatedAt,
      'user_id': userId,
      'role_application_id': roleApplicationId,
      'worker_type': workerType,
      'contact_info': contactInfo,
      'address': address,
      'banking_info': bankingInfo,
      'documents': documents,
      'skills': skills,
      'experience_years': experienceYears,
      'is_available': isAvailable,
      'rating': rating,
      'total_bookings': totalBookings,
      'earnings': earnings,
      'total_jobs': totalJobs,
      'is_active': isActive,
    };
  }

  WorkerEntity toEntity() {
    // Parse contact info JSON
    Map<String, dynamic> contactData = {};
    try {
      contactData = jsonDecode(contactInfo);
    } catch (e) {
      contactData = {};
    }

    // Parse address JSON
    Map<String, dynamic> addressData = {};
    try {
      addressData = jsonDecode(address);
    } catch (e) {
      addressData = {};
    }

    // Parse documents JSON
    Map<String, dynamic> documentsData = {};
    try {
      documentsData = jsonDecode(documents);
    } catch (e) {
      documentsData = {};
    }

    // Parse skills list
    List<String> skillsList = [];
    try {
      final decoded = jsonDecode(skills);
      if (decoded is List) {
        skillsList = List<String>.from(decoded);
      }
    } catch (e) {
      skillsList = [];
    }

    return WorkerEntity(
      id: id,
      userId: userId,
      workerType: workerType,
      name: contactData['name'] ?? '',
      email: contactData['email'] ?? '',
      phone: contactData['phone'] ?? '',
      alternativeNumber: contactData['alternative_number'] ?? '',
      city: addressData['city'] ?? '',
      state: addressData['state'] ?? '',
      street: addressData['street'] ?? '',
      pincode: addressData['pincode'] ?? '',
      profilePicture: documentsData['profile_pic'] ?? '',
      skills: skillsList,
      experienceYears: experienceYears,
      isAvailable: isAvailable,
      rating: rating,
      totalBookings: totalBookings,
      totalJobs: totalJobs,
      isActive: isActive,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  @override
  String toString() {
    return 'WorkerModel(id: $id, name: ${_getName()}, workerType: $workerType, skills: $skills)';
  }

  String _getName() {
    try {
      final contactData = jsonDecode(contactInfo);
      return contactData['name'] ?? 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  }
}