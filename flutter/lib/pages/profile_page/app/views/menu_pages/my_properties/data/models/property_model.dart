import '../../domain/entities/property_entity.dart';
import 'user_model.dart';

class PropertyModel {
  final int id;
  final int? userId;
  final String title;
  final String? description;
  final String propertyType;
  final String listingType;
  final String? slug;
  final double? salePrice;
  final double? monthlyRent;
  final bool priceNegotiable;
  final int? bedrooms;
  final int? bathrooms;
  final double? area;
  final int? floorNumber;
  final String? age;
  final String? furnishingStatus;
  final String state;
  final String city;
  final String? address;
  final String? pincode;
  final List<String> images;
  final String status;
  final bool isApproved;
  final bool uploadedByAdmin;
  final bool treesindiaAssured;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final DateTime? approvedAt;
  final int? approvedBy;
  final int priorityScore;
  final bool subscriptionRequired;
  final DateTime? expiresAt;
  final int? brokerId;
  final PropertyUserModel? user;

  PropertyModel({
    required this.id,
    this.userId,
    required this.title,
    this.description,
    required this.propertyType,
    required this.listingType,
    this.slug,
    this.salePrice,
    this.monthlyRent,
    required this.priceNegotiable,
    this.bedrooms,
    this.bathrooms,
    this.area,
    this.floorNumber,
    this.age,
    this.furnishingStatus,
    required this.state,
    required this.city,
    this.address,
    this.pincode,
    required this.images,
    required this.status,
    required this.isApproved,
    required this.uploadedByAdmin,
    required this.treesindiaAssured,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    this.approvedAt,
    this.approvedBy,
    required this.priorityScore,
    required this.subscriptionRequired,
    this.expiresAt,
    this.brokerId,
    this.user,
  });

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel(
      id: json['ID'] ?? json['id'],
      userId: json['user_id'],
      title: json['title'],
      description: json['description'],
      propertyType: json['property_type'],
      listingType: json['listing_type'],
      slug: json['slug'],
      salePrice: json['sale_price']?.toDouble(),
      monthlyRent: json['monthly_rent']?.toDouble(),
      priceNegotiable: json['price_negotiable'] ?? true,
      bedrooms: json['bedrooms'],
      bathrooms: json['bathrooms'],
      area: json['area']?.toDouble(),
      floorNumber: json['floor_number'],
      age: json['age'],
      furnishingStatus: json['furnishing_status'],
      state: json['state'],
      city: json['city'],
      address: json['address'],
      pincode: json['pincode'],
      images: json['images'] != null ? List<String>.from(json['images']) : [],
      status: json['status'] ?? 'available',
      isApproved: json['is_approved'] ?? false,
      uploadedByAdmin: json['uploaded_by_admin'] ?? false,
      treesindiaAssured: json['treesindia_assured'] ?? false,
      createdAt: DateTime.parse(json['created_at'] ?? json['CreatedAt']),
      updatedAt: DateTime.parse(json['updated_at'] ?? json['UpdatedAt']),
      deletedAt: json['DeletedAt'] != null
          ? DateTime.parse(json['DeletedAt'])
          : json['deleted_at'] != null
              ? DateTime.parse(json['deleted_at'])
              : null,
      approvedAt: json['approved_at'] != null
          ? DateTime.parse(json['approved_at'])
          : null,
      approvedBy: json['approved_by'],
      priorityScore: json['priority_score'] ?? 50,
      subscriptionRequired: json['subscription_required'] ?? false,
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'])
          : null,
      brokerId: json['broker_id'],
      user: json['user'] != null ? PropertyUserModel.fromJson(json['user']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'description': description,
      'property_type': propertyType,
      'listing_type': listingType,
      'slug': slug,
      'sale_price': salePrice,
      'monthly_rent': monthlyRent,
      'price_negotiable': priceNegotiable,
      'bedrooms': bedrooms,
      'bathrooms': bathrooms,
      'area': area,
      'floor_number': floorNumber,
      'age': age,
      'furnishing_status': furnishingStatus,
      'state': state,
      'city': city,
      'address': address,
      'pincode': pincode,
      'images': images,
      'status': status,
      'is_approved': isApproved,
      'uploaded_by_admin': uploadedByAdmin,
      'treesindia_assured': treesindiaAssured,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'deleted_at': deletedAt?.toIso8601String(),
      'approved_at': approvedAt?.toIso8601String(),
      'approved_by': approvedBy,
      'priority_score': priorityScore,
      'subscription_required': subscriptionRequired,
      'expires_at': expiresAt?.toIso8601String(),
      'broker_id': brokerId,
      'user': user?.toJson(),
    };
  }

  PropertyEntity toEntity() {
    return PropertyEntity(
      id: id,
      userId: userId,
      title: title,
      description: description,
      propertyType: propertyType,
      listingType: listingType,
      slug: slug,
      salePrice: salePrice,
      monthlyRent: monthlyRent,
      priceNegotiable: priceNegotiable,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      area: area,
      floorNumber: floorNumber,
      age: age,
      furnishingStatus: furnishingStatus,
      state: state,
      city: city,
      address: address,
      pincode: pincode,
      images: images,
      status: status,
      isApproved: isApproved,
      uploadedByAdmin: uploadedByAdmin,
      treesindiaAssured: treesindiaAssured,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      approvedAt: approvedAt,
      approvedBy: approvedBy,
      priorityScore: priorityScore,
      subscriptionRequired: subscriptionRequired,
      expiresAt: expiresAt,
      brokerId: brokerId,
      user: user?.toEntity(),
    );
  }
}

class PropertiesResponseModel {
  final List<PropertyModel> properties;
  final int total;
  final int page;
  final int limit;
  final int totalPages;
  final bool hasNext;
  final bool hasPrev;

  PropertiesResponseModel({
    required this.properties,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
    required this.hasNext,
    required this.hasPrev,
  });

  factory PropertiesResponseModel.fromJson(Map<String, dynamic> json) {
    return PropertiesResponseModel(
      properties: (json['data'] as List?)
              ?.map((item) => PropertyModel.fromJson(item))
              .toList() ??
          [],
      total: json['pagination']?['total'] ?? 0,
      page: json['pagination']?['page'] ?? 1,
      limit: json['pagination']?['limit'] ?? 20,
      totalPages: json['pagination']?['total_pages'] ?? 1,
      hasNext: json['pagination']?['has_next'] ?? false,
      hasPrev: json['pagination']?['has_prev'] ?? false,
    );
  }
}
