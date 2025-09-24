import '../../domain/entities/vendor_form_entity.dart';

class VendorFormModel {
  final String vendorName;
  final String businessDescription;
  final String contactPersonName;
  final String contactPersonPhone;
  final String contactPersonEmail;
  final String businessType;
  final int yearsInBusiness;
  final Map<String, dynamic> businessAddress;
  final List<String> servicesOffered;
  final String profilePicture;
  final List<String> businessGallery;

  VendorFormModel({
    required this.vendorName,
    required this.businessDescription,
    required this.contactPersonName,
    required this.contactPersonPhone,
    required this.contactPersonEmail,
    required this.businessType,
    required this.yearsInBusiness,
    required this.businessAddress,
    required this.servicesOffered,
    required this.profilePicture,
    required this.businessGallery,
  });

  factory VendorFormModel.fromJson(Map<String, dynamic> json) {
    return VendorFormModel(
      vendorName: json['vendor_name'] ?? '',
      businessDescription: json['business_description'] ?? '',
      contactPersonName: json['contact_person_name'] ?? '',
      contactPersonPhone: json['contact_person_phone'] ?? '',
      contactPersonEmail: json['contact_person_email'] ?? '',
      businessType: json['business_type'] ?? '',
      yearsInBusiness: json['years_in_business'] ?? 0,
      businessAddress: Map<String, dynamic>.from(json['business_address'] ?? {}),
      servicesOffered: List<String>.from(json['services_offered'] ?? []),
      profilePicture: json['profile_picture'] ?? '',
      businessGallery: List<String>.from(json['business_gallery'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'vendor_name': vendorName,
      'business_description': businessDescription,
      'contact_person_name': contactPersonName,
      'contact_person_phone': contactPersonPhone,
      'contact_person_email': contactPersonEmail,
      'business_type': _convertBusinessTypeForAPI(businessType),
      'years_in_business': yearsInBusiness,
      'business_address': businessAddress,
      'services_offered': servicesOffered,
      'profile_picture': profilePicture,
      'business_gallery': businessGallery,
    };
  }

  String _convertBusinessTypeForAPI(String businessType) {
    final typeMap = {
      'individual': 'individual',
      'partnership': 'partnership',
      'company': 'company',
      'llp': 'llp',
      'private limited': 'pvt_ltd',
      'public limited': 'public_ltd',
      'other': 'other',
    };

    return typeMap[businessType.toLowerCase()] ?? 'other';
  }

  VendorFormEntity toEntity() {
    return VendorFormEntity(
      vendorName: vendorName,
      businessDescription: businessDescription,
      contactPersonName: contactPersonName,
      contactPersonPhone: contactPersonPhone,
      contactPersonEmail: contactPersonEmail,
      businessType: businessType,
      yearsInBusiness: yearsInBusiness,
      businessAddress: businessAddress,
      servicesOffered: servicesOffered,
      profilePicture: profilePicture,
      businessGallery: businessGallery,
    );
  }

  VendorFormModel copyWith({
    String? vendorName,
    String? businessDescription,
    String? contactPersonName,
    String? contactPersonPhone,
    String? contactPersonEmail,
    String? businessType,
    int? yearsInBusiness,
    Map<String, dynamic>? businessAddress,
    List<String>? servicesOffered,
    String? profilePicture,
    List<String>? businessGallery,
  }) {
    return VendorFormModel(
      vendorName: vendorName ?? this.vendorName,
      businessDescription: businessDescription ?? this.businessDescription,
      contactPersonName: contactPersonName ?? this.contactPersonName,
      contactPersonPhone: contactPersonPhone ?? this.contactPersonPhone,
      contactPersonEmail: contactPersonEmail ?? this.contactPersonEmail,
      businessType: businessType ?? this.businessType,
      yearsInBusiness: yearsInBusiness ?? this.yearsInBusiness,
      businessAddress: businessAddress ?? this.businessAddress,
      servicesOffered: servicesOffered ?? this.servicesOffered,
      profilePicture: profilePicture ?? this.profilePicture,
      businessGallery: businessGallery ?? this.businessGallery,
    );
  }

  static VendorFormModel empty() {
    return VendorFormModel(
      vendorName: '',
      businessDescription: '',
      contactPersonName: '',
      contactPersonPhone: '',
      contactPersonEmail: '',
      businessType: '',
      yearsInBusiness: 0,
      businessAddress: {},
      servicesOffered: [],
      profilePicture: '',
      businessGallery: [],
    );
  }

  factory VendorFormModel.fromEntity(VendorFormEntity entity) {
    return VendorFormModel(
      vendorName: entity.vendorName,
      businessDescription: entity.businessDescription,
      contactPersonName: entity.contactPersonName,
      contactPersonPhone: entity.contactPersonPhone,
      contactPersonEmail: entity.contactPersonEmail,
      businessType: entity.businessType,
      yearsInBusiness: entity.yearsInBusiness,
      businessAddress: entity.businessAddress,
      servicesOffered: entity.servicesOffered,
      profilePicture: entity.profilePicture,
      businessGallery: entity.businessGallery,
    );
  }
}