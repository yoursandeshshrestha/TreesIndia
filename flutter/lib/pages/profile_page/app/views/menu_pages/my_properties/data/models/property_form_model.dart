import 'dart:io';
import '../../domain/entities/property_form_entity.dart';

class PropertyFormModel {
  // Step 1: Basic Details
  final String title;
  final String description;
  final String propertyType; // "residential" | "commercial"
  final String listingType; // "sale" | "rent"

  // Step 2: Location Details
  final String state;
  final String city;
  final String? address;
  final String? pincode;

  // Step 3: Property Profile
  final int? bedrooms;
  final int? bathrooms;
  final double? area; // in sq ft
  final int? floorNumber;
  final String? age; // "under_1_year" | "1_2_years" | "2_5_years" | "10_plus_years"
  final String? furnishingStatus; // "furnished" | "semi_furnished" | "unfurnished"

  // Step 4: Photos
  final List<File> images;

  // Step 5: Pricing
  final double? salePrice; // For sale properties
  final double? monthlyRent; // For rental properties
  final bool priceNegotiable;

  PropertyFormModel({
    required this.title,
    required this.description,
    required this.propertyType,
    required this.listingType,
    required this.state,
    required this.city,
    this.address,
    this.pincode,
    this.bedrooms,
    this.bathrooms,
    this.area,
    this.floorNumber,
    this.age,
    this.furnishingStatus,
    required this.images,
    this.salePrice,
    this.monthlyRent,
    required this.priceNegotiable,
  });

  factory PropertyFormModel.empty() {
    return PropertyFormModel(
      title: '',
      description: '',
      propertyType: 'residential',
      listingType: 'sale',
      state: '',
      city: '',
      images: [],
      priceNegotiable: true,
    );
  }

  PropertyFormModel copyWith({
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
    return PropertyFormModel(
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

  PropertyFormEntity toEntity() {
    return PropertyFormEntity(
      title: title,
      description: description,
      propertyType: propertyType,
      listingType: listingType,
      state: state,
      city: city,
      address: address,
      pincode: pincode,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      area: area,
      floorNumber: floorNumber,
      age: age,
      furnishingStatus: furnishingStatus,
      images: images,
      salePrice: salePrice,
      monthlyRent: monthlyRent,
      priceNegotiable: priceNegotiable,
    );
  }

  Map<String, dynamic> toFormData() {
    final Map<String, dynamic> data = {
      'title': title,
      'description': description,
      'property_type': propertyType,
      'listing_type': listingType,
      'state': state,
      'city': city,
      'price_negotiable': priceNegotiable.toString(),
    };

    if (address != null && address!.isNotEmpty) {
      data['address'] = address;
    }
    if (pincode != null && pincode!.isNotEmpty) {
      data['pincode'] = pincode;
    }
    if (bedrooms != null) {
      data['bedrooms'] = bedrooms.toString();
    }
    if (bathrooms != null) {
      data['bathrooms'] = bathrooms.toString();
    }
    if (area != null) {
      data['area'] = area.toString();
    }
    if (floorNumber != null) {
      data['floor_number'] = floorNumber.toString();
    }
    if (age != null && age!.isNotEmpty) {
      data['age'] = age;
    }
    if (furnishingStatus != null && furnishingStatus!.isNotEmpty) {
      data['furnishing_status'] = furnishingStatus;
    }
    if (salePrice != null) {
      data['sale_price'] = salePrice.toString();
    }
    if (monthlyRent != null) {
      data['monthly_rent'] = monthlyRent.toString();
    }

    return data;
  }

  bool isStep1Valid() {
    return title.isNotEmpty &&
        description.isNotEmpty &&
        propertyType.isNotEmpty &&
        listingType.isNotEmpty;
  }

  bool isStep2Valid() {
    return state.isNotEmpty && city.isNotEmpty;
  }

  bool isStep3Valid() {
    return true; // Optional step
  }

  bool isStep4Valid() {
    return images.isNotEmpty;
  }

  bool isStep5Valid() {
    if (listingType == 'sale') {
      return salePrice != null && salePrice! > 0;
    } else if (listingType == 'rent') {
      return monthlyRent != null && monthlyRent! > 0;
    }
    return false;
  }

  bool isValidForSubmission() {
    return isStep1Valid() &&
        isStep2Valid() &&
        isStep4Valid() &&
        isStep5Valid();
  }
}