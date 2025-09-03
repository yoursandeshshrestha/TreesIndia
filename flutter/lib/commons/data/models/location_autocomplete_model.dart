import '../../domain/entities/location_entity.dart';

class LocationAutocompleteModel {
  final bool success;
  final String message;
  final LocationAutocompleteData data;
  final String timestamp;

  LocationAutocompleteModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory LocationAutocompleteModel.fromJson(Map<String, dynamic> json) {
    return LocationAutocompleteModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: LocationAutocompleteData.fromJson(json['data'] ?? {}),
      timestamp: json['timestamp'] ?? '',
    );
  }

  List<LocationEntity> toLocationEntities() {
    return data.predictions
        .map((prediction) => prediction.toLocationEntity())
        .toList();
  }
}

class LocationAutocompleteData {
  final String status;
  final List<LocationPrediction> predictions;

  LocationAutocompleteData({
    required this.status,
    required this.predictions,
  });

  factory LocationAutocompleteData.fromJson(Map<String, dynamic> json) {
    return LocationAutocompleteData(
      status: json['status'] ?? '',
      predictions: (json['predictions'] as List<dynamic>?)
              ?.map((prediction) => LocationPrediction.fromJson(prediction))
              .toList() ??
          [],
    );
  }
}

class LocationPrediction {
  final String placeId;
  final String description;
  final StructuredFormatting structuredFormatting;
  final List<String> types;
  final String country;
  final String countryCode;
  final String state;
  final String city;
  final String postcode;
  final String iso31662;
  final double latitude;
  final double longitude;
  final String resultType;
  final String addressLine1;
  final String addressLine2;
  final String formatted;

  LocationPrediction({
    required this.placeId,
    required this.description,
    required this.structuredFormatting,
    required this.types,
    required this.country,
    required this.countryCode,
    required this.state,
    required this.city,
    required this.postcode,
    required this.iso31662,
    required this.latitude,
    required this.longitude,
    required this.resultType,
    required this.addressLine1,
    required this.addressLine2,
    required this.formatted,
  });

  factory LocationPrediction.fromJson(Map<String, dynamic> json) {
    return LocationPrediction(
      placeId: json['place_id'] ?? '',
      description: json['description'] ?? '',
      structuredFormatting:
          StructuredFormatting.fromJson(json['structured_formatting'] ?? {}),
      types: List<String>.from(json['types'] ?? []),
      country: json['country'] ?? '',
      countryCode: json['country_code'] ?? '',
      state: json['state'] ?? '',
      city: json['city'] ?? '',
      postcode: json['postcode'] ?? '',
      iso31662: json['iso3166_2'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      resultType: json['result_type'] ?? '',
      addressLine1: json['address_line1'] ?? '',
      addressLine2: json['address_line2'] ?? '',
      formatted: json['formatted'] ?? '',
    );
  }

  LocationEntity toLocationEntity() {
    return LocationEntity(
      address: formatted.isNotEmpty ? formatted : description,
      latitude: latitude,
      longitude: longitude,
      city: city.isNotEmpty ? city : null,
      state: state.isNotEmpty ? state : null,
      country: country.isNotEmpty ? country : null,
      postalCode: postcode.isNotEmpty ? postcode : null,
    );
  }
}

class StructuredFormatting {
  final String mainText;
  final String secondaryText;

  StructuredFormatting({
    required this.mainText,
    required this.secondaryText,
  });

  factory StructuredFormatting.fromJson(Map<String, dynamic> json) {
    return StructuredFormatting(
      mainText: json['main_text'] ?? '',
      secondaryText: json['secondary_text'] ?? '',
    );
  }
}
