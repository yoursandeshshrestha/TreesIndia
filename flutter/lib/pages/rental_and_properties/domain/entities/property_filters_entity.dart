enum PropertySortType {
  relevance,
  newestFirst,
  priceLowToHigh,
  priceHighToLow,
  areaSqftLowToHigh,
  areaSqftHighToLow,
}

class PropertyFiltersEntity {
  final int page;
  final int limit;
  final bool isApproved;
  final String status;
  final String? listingType; // 'sale', 'rent', or null for all
  final bool? uploadedByAdmin; // For Trees India Assured filter
  final List<int>? bedrooms;
  final String? propertyType; // 'residential', 'commercial'
  final double? minPrice;
  final double? maxPrice;
  final double? minArea;
  final double? maxArea;
  final String? furnishingStatus; // 'furnished', 'semi-furnished', 'unfurnished'
  final PropertySortType sortBy;

  const PropertyFiltersEntity({
    this.page = 1,
    this.limit = 12,
    this.isApproved = true,
    this.status = 'available',
    this.listingType,
    this.uploadedByAdmin,
    this.bedrooms,
    this.propertyType,
    this.minPrice,
    this.maxPrice,
    this.minArea,
    this.maxArea,
    this.furnishingStatus,
    this.sortBy = PropertySortType.relevance,
  });

  PropertyFiltersEntity copyWith({
    int? page,
    int? limit,
    bool? isApproved,
    String? status,
    String? listingType,
    bool? uploadedByAdmin,
    List<int>? bedrooms,
    String? propertyType,
    double? minPrice,
    double? maxPrice,
    double? minArea,
    double? maxArea,
    String? furnishingStatus,
    PropertySortType? sortBy,
    bool clearListingType = false,
    bool clearUploadedByAdmin = false,
    bool clearBedrooms = false,
    bool clearPropertyType = false,
    bool clearPriceRange = false,
    bool clearAreaRange = false,
    bool clearFurnishingStatus = false,
  }) {
    return PropertyFiltersEntity(
      page: page ?? this.page,
      limit: limit ?? this.limit,
      isApproved: isApproved ?? this.isApproved,
      status: status ?? this.status,
      listingType: clearListingType ? null : (listingType ?? this.listingType),
      uploadedByAdmin: clearUploadedByAdmin ? null : (uploadedByAdmin ?? this.uploadedByAdmin),
      bedrooms: clearBedrooms ? null : (bedrooms ?? this.bedrooms),
      propertyType: clearPropertyType ? null : (propertyType ?? this.propertyType),
      minPrice: clearPriceRange ? null : (minPrice ?? this.minPrice),
      maxPrice: clearPriceRange ? null : (maxPrice ?? this.maxPrice),
      minArea: clearAreaRange ? null : (minArea ?? this.minArea),
      maxArea: clearAreaRange ? null : (maxArea ?? this.maxArea),
      furnishingStatus: clearFurnishingStatus ? null : (furnishingStatus ?? this.furnishingStatus),
      sortBy: sortBy ?? this.sortBy,
    );
  }

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
      'is_approved': isApproved,
      'status': status,
    };

    if (listingType != null) params['listing_type'] = listingType;
    if (uploadedByAdmin != null) params['uploaded_by_admin'] = uploadedByAdmin;
    if (propertyType != null) params['property_type'] = propertyType;
    if (minPrice != null) params['min_price'] = minPrice;
    if (maxPrice != null) params['max_price'] = maxPrice;
    if (minArea != null) params['min_area'] = minArea;
    if (maxArea != null) params['max_area'] = maxArea;
    if (furnishingStatus != null) params['furnishing_status'] = furnishingStatus;

    // Handle bedrooms as comma-separated string
    if (bedrooms != null && bedrooms!.isNotEmpty) {
      params['bedrooms'] = bedrooms!.join(',');
    }

    // Add sort parameter
    if (sortBy != PropertySortType.relevance) {
      params['sort'] = _getSortParam(sortBy);
    }

    return params;
  }

  String _getSortParam(PropertySortType sortType) {
    switch (sortType) {
      case PropertySortType.relevance:
        return 'relevance';
      case PropertySortType.newestFirst:
        return 'created_at_desc';
      case PropertySortType.priceLowToHigh:
        return 'price_asc';
      case PropertySortType.priceHighToLow:
        return 'price_desc';
      case PropertySortType.areaSqftLowToHigh:
        return 'area_asc';
      case PropertySortType.areaSqftHighToLow:
        return 'area_desc';
    }
  }

  String getSortDisplayName(PropertySortType sortType) {
    switch (sortType) {
      case PropertySortType.relevance:
        return 'Relevance';
      case PropertySortType.newestFirst:
        return 'Newest first';
      case PropertySortType.priceLowToHigh:
        return 'Price Low to High';
      case PropertySortType.priceHighToLow:
        return 'Price High to Low';
      case PropertySortType.areaSqftLowToHigh:
        return 'Price / sq.ft.: Low to High';
      case PropertySortType.areaSqftHighToLow:
        return 'Price / sq.ft.: High to Low';
    }
  }
}