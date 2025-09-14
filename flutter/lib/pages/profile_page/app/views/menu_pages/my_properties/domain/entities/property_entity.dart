class PropertyEntity {
  final int id;
  final String title;
  final String? description;
  final String propertyType;
  final String listingType;
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
  final DateTime createdAt;
  final DateTime updatedAt;

  PropertyEntity({
    required this.id,
    required this.title,
    this.description,
    required this.propertyType,
    required this.listingType,
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
    required this.createdAt,
    required this.updatedAt,
  });

  String get displayPrice {
    if (listingType == 'sale' && salePrice != null) {
      return '₹${_formatPrice(salePrice!)}';
    } else if (listingType == 'rent' && monthlyRent != null) {
      return '₹${_formatPrice(monthlyRent!)}/month';
    }
    return 'Price not available';
  }

  String get displayLocation {
    return address != null && address!.isNotEmpty
        ? '$address, $city, $state'
        : '$city, $state';
  }

  String get displayArea {
    return area != null ? '${area!.toInt()} sq ft' : 'Area not specified';
  }

  String get displayBedBath {
    if (bedrooms != null && bathrooms != null) {
      return '${bedrooms}BHK, ${bathrooms}Bath';
    } else if (bedrooms != null) {
      return '${bedrooms}BHK';
    } else if (bathrooms != null) {
      return '${bathrooms}Bath';
    }
    return '';
  }

  String get displayPropertyType {
    return propertyType.substring(0, 1).toUpperCase() +
           propertyType.substring(1).toLowerCase();
  }

  String get displayListingType {
    return listingType.substring(0, 1).toUpperCase() +
           listingType.substring(1).toLowerCase();
  }

  String get displayStatus {
    switch (status.toLowerCase()) {
      case 'available':
        return 'Available';
      case 'sold':
        return 'Sold';
      case 'rented':
        return 'Rented';
      default:
        return status.substring(0, 1).toUpperCase() +
               status.substring(1).toLowerCase();
    }
  }

  String get displayApprovalStatus {
    return isApproved ? 'Approved' : 'Pending Review';
  }

  String get primaryImage {
    return images.isNotEmpty ? images.first : '';
  }

  bool get hasMultipleImages {
    return images.length > 1;
  }

  int get imageCount {
    return images.length;
  }

  String _formatPrice(double price) {
    if (price >= 10000000) {
      return '${(price / 10000000).toStringAsFixed(1)}Cr';
    } else if (price >= 100000) {
      return '${(price / 100000).toStringAsFixed(1)}L';
    } else if (price >= 1000) {
      return '${(price / 1000).toStringAsFixed(1)}K';
    }
    return price.toStringAsFixed(0);
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PropertyEntity &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'PropertyEntity{id: $id, title: $title, city: $city, state: $state}';
  }
}