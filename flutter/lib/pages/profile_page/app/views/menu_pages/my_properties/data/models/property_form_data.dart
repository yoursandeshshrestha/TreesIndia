import 'dart:io';

class PropertyFormData {
  // Step 1: Basic Details
  String title;
  String description;
  String propertyType; // 'residential' or 'commercial'
  String listingType; // 'sale' or 'rent'

  // Step 2: Location Details
  String state;
  String city;
  String? address;
  String? pincode;

  // Step 3: Property Profile
  int? bedrooms;
  int? bathrooms;
  double? area; // carpet area in sq.ft
  int? floorNumber;
  String? age; // 'under_1_year', '1_2_years', '2_5_years', '10_plus_years'
  String? furnishingStatus; // 'furnished', 'semi_furnished', 'unfurnished'

  // Step 4: Photos
  List<File> images;

  // Step 5: Pricing
  double? salePrice;
  double? monthlyRent;
  bool priceNegotiable;

  PropertyFormData({
    this.title = '',
    this.description = '',
    this.propertyType = '',
    this.listingType = '',
    this.state = '',
    this.city = '',
    this.address,
    this.pincode,
    this.bedrooms,
    this.bathrooms,
    this.area,
    this.floorNumber,
    this.age,
    this.furnishingStatus,
    this.images = const [],
    this.salePrice,
    this.monthlyRent,
    this.priceNegotiable = false,
  });

  PropertyFormData copyWith({
    String? title,
    String? description,
    String? propertyType,
    String? listingType,
    String? state,
    String? city,
    String? address,
    String? pincode,
    int? bedrooms,
    int? bathrooms,
    double? area,
    int? floorNumber,
    String? age,
    String? furnishingStatus,
    List<File>? images,
    double? salePrice,
    double? monthlyRent,
    bool? priceNegotiable,
  }) {
    return PropertyFormData(
      title: title ?? this.title,
      description: description ?? this.description,
      propertyType: propertyType ?? this.propertyType,
      listingType: listingType ?? this.listingType,
      state: state ?? this.state,
      city: city ?? this.city,
      address: address ?? this.address,
      pincode: pincode ?? this.pincode,
      bedrooms: bedrooms ?? this.bedrooms,
      bathrooms: bathrooms ?? this.bathrooms,
      area: area ?? this.area,
      floorNumber: floorNumber ?? this.floorNumber,
      age: age ?? this.age,
      furnishingStatus: furnishingStatus ?? this.furnishingStatus,
      images: images ?? this.images,
      salePrice: salePrice ?? this.salePrice,
      monthlyRent: monthlyRent ?? this.monthlyRent,
      priceNegotiable: priceNegotiable ?? this.priceNegotiable,
    );
  }
}

class PropertyFormValidation {
  static const int maxTitleLength = 30;
  static const int maxDescriptionLength = 500;
  static const int maxImages = 7;
  static const int maxImageSizeMB = 10;

  // Step 1 validation
  static String? validateTitle(String value) {
    if (value.trim().isEmpty) {
      return 'Property title is required';
    }
    if (value.length > maxTitleLength) {
      return 'Title cannot exceed $maxTitleLength characters';
    }
    return null;
  }

  static String? validateDescription(String value) {
    if (value.trim().isEmpty) {
      return 'Property description is required';
    }
    if (value.length > maxDescriptionLength) {
      return 'Description cannot exceed $maxDescriptionLength characters';
    }
    return null;
  }

  static String? validatePropertyType(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please select a property type';
    }
    return null;
  }

  static String? validateListingType(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please select a listing type';
    }
    return null;
  }

  // Step 2 validation
  static String? validateState(String value) {
    if (value.trim().isEmpty) {
      return 'State is required';
    }
    return null;
  }

  static String? validateCity(String value) {
    if (value.trim().isEmpty) {
      return 'City is required';
    }
    return null;
  }

  static String? validatePincode(String? value) {
    if (value != null && value.isNotEmpty) {
      if (value.length != 6 || !RegExp(r'^\d{6}$').hasMatch(value)) {
        return 'Please enter a valid 6-digit pincode';
      }
    }
    return null;
  }

  // Step 3 validation (all optional)
  static String? validateArea(String? value) {
    if (value != null && value.isNotEmpty) {
      final area = double.tryParse(value);
      if (area == null || area <= 0) {
        return 'Please enter a valid area';
      }
    }
    return null;
  }

  static String? validateFloorNumber(String? value) {
    if (value != null && value.isNotEmpty) {
      final floor = int.tryParse(value);
      if (floor == null || floor < 0) {
        return 'Please enter a valid floor number';
      }
    }
    return null;
  }

  // Step 4 validation
  static String? validateImages(List<File> images) {
    if (images.isEmpty) {
      return 'At least one image is required';
    }
    if (images.length > maxImages) {
      return 'Maximum $maxImages images allowed';
    }
    return null;
  }

  static String? validateImageSize(File image) {
    final sizeInBytes = image.lengthSync();
    final sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > maxImageSizeMB) {
      return 'Image size cannot exceed ${maxImageSizeMB}MB';
    }
    return null;
  }

  // Step 5 validation
  static String? validateSalePrice(String? value, String? listingType) {
    if (listingType == 'sale') {
      if (value == null || value.trim().isEmpty) {
        return 'Sale price is required';
      }
      final price = double.tryParse(value);
      if (price == null || price <= 0) {
        return 'Please enter a valid sale price';
      }
    }
    return null;
  }

  static String? validateMonthlyRent(String? value, String? listingType) {
    if (listingType == 'rent') {
      if (value == null || value.trim().isEmpty) {
        return 'Monthly rent is required';
      }
      final rent = double.tryParse(value);
      if (rent == null || rent <= 0) {
        return 'Please enter a valid monthly rent';
      }
    }
    return null;
  }

  // Step completion validation
  static bool isStep1Complete(PropertyFormData data) {
    return validateTitle(data.title) == null &&
        validateDescription(data.description) == null &&
        validatePropertyType(data.propertyType) == null &&
        validateListingType(data.listingType) == null;
  }

  static bool isStep2Complete(PropertyFormData data) {
    return validateState(data.state) == null &&
        validateCity(data.city) == null &&
        validatePincode(data.pincode) == null;
  }

  static bool isStep3Complete(PropertyFormData data) {
    // Step 3 is optional, so it's always complete
    return validateArea(data.area?.toString()) == null &&
        validateFloorNumber(data.floorNumber?.toString()) == null;
  }

  static bool isStep4Complete(PropertyFormData data) {
    return validateImages(data.images) == null;
  }

  static bool isStep5Complete(PropertyFormData data) {
    return validateSalePrice(data.salePrice?.toString(), data.listingType) == null &&
        validateMonthlyRent(data.monthlyRent?.toString(), data.listingType) == null;
  }

  static bool isFormComplete(PropertyFormData data) {
    return isStep1Complete(data) &&
        isStep2Complete(data) &&
        isStep3Complete(data) &&
        isStep4Complete(data) &&
        isStep5Complete(data);
  }
}

// Property form constants
class PropertyFormConstants {
  static const List<String> propertyTypes = ['residential', 'commercial'];
  static const List<String> listingTypes = ['sale', 'rent'];
  static const List<String> ageOptions = [
    'under_1_year',
    '1_2_years',
    '2_5_years',
    '10_plus_years'
  ];
  static const List<String> furnishingOptions = [
    'furnished',
    'semi_furnished',
    'unfurnished'
  ];

  static const List<int> bedroomOptions = [1, 2, 3, 4];
  static const List<int> bathroomOptions = [1, 2, 3, 4];

  static String getPropertyTypeLabel(String type) {
    switch (type) {
      case 'residential':
        return 'Residential';
      case 'commercial':
        return 'Commercial';
      default:
        return type;
    }
  }

  static String getListingTypeLabel(String type) {
    switch (type) {
      case 'sale':
        return 'For Sale';
      case 'rent':
        return 'For Rent';
      default:
        return type;
    }
  }

  static String getAgeLabel(String age) {
    switch (age) {
      case 'under_1_year':
        return 'Under 1 year';
      case '1_2_years':
        return '1-2 years';
      case '2_5_years':
        return '2-5 years';
      case '10_plus_years':
        return '10+ years';
      default:
        return age;
    }
  }

  static String getFurnishingLabel(String furnishing) {
    switch (furnishing) {
      case 'furnished':
        return 'Furnished';
      case 'semi_furnished':
        return 'Semi-Furnished';
      case 'unfurnished':
        return 'Unfurnished';
      default:
        return furnishing;
    }
  }
}