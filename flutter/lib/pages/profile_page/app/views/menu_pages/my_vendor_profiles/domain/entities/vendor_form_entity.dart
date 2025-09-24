class VendorFormEntity {
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

  VendorFormEntity({
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

  VendorFormEntity copyWith({
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
    return VendorFormEntity(
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

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is VendorFormEntity &&
        other.vendorName == vendorName &&
        other.contactPersonName == contactPersonName &&
        other.contactPersonPhone == contactPersonPhone;
  }

  @override
  int get hashCode {
    return vendorName.hashCode ^
        contactPersonName.hashCode ^
        contactPersonPhone.hashCode;
  }

  @override
  String toString() {
    return 'VendorFormEntity(vendorName: $vendorName, businessType: $businessType)';
  }

  static VendorFormEntity empty() {
    return VendorFormEntity(
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
}