enum VendorSortType {
  relevance,
  newestFirst,
  nameAtoZ,
  nameZtoA,
  ratingHighToLow,
  ratingLowToHigh,
}

class VendorFiltersEntity {
  final int page;
  final int limit;
  final bool isActive;
  final String? businessType;
  final List<String>? services;
  final String? location;
  final String? city;
  final String? state;
  final VendorSortType sortBy;

  const VendorFiltersEntity({
    this.page = 1,
    this.limit = 12,
    this.isActive = true,
    this.businessType,
    this.services,
    this.location,
    this.city,
    this.state,
    this.sortBy = VendorSortType.relevance,
  });

  VendorFiltersEntity copyWith({
    int? page,
    int? limit,
    bool? isActive,
    String? businessType,
    List<String>? services,
    String? location,
    String? city,
    String? state,
    VendorSortType? sortBy,
    bool clearBusinessType = false,
    bool clearServices = false,
    bool clearLocation = false,
    bool clearCity = false,
    bool clearState = false,
  }) {
    return VendorFiltersEntity(
      page: page ?? this.page,
      limit: limit ?? this.limit,
      isActive: isActive ?? this.isActive,
      businessType: clearBusinessType ? null : (businessType ?? this.businessType),
      services: clearServices ? null : (services ?? this.services),
      location: clearLocation ? null : (location ?? this.location),
      city: clearCity ? null : (city ?? this.city),
      state: clearState ? null : (state ?? this.state),
      sortBy: sortBy ?? this.sortBy,
    );
  }

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{
      'page': page.toString(),
      'limit': limit.toString(),
      'is_active': isActive.toString(),
    };

    if (businessType != null) {
      params['business_type'] = _mapBusinessType(businessType!);
    }

    if (services != null && services!.isNotEmpty) {
      // Join services with comma if multiple selections are supported
      params['services'] = services!.join(',');
    }

    if (location != null && location!.isNotEmpty) {
      params['location'] = location!;
    }

    if (city != null && city!.isNotEmpty) {
      params['city'] = city!;
    }

    if (state != null && state!.isNotEmpty) {
      params['state'] = state!;
    }

    // Add sort parameter if needed
    switch (sortBy) {
      case VendorSortType.newestFirst:
        params['sort'] = 'created_at_desc';
        break;
      case VendorSortType.nameAtoZ:
        params['sort'] = 'name_asc';
        break;
      case VendorSortType.nameZtoA:
        params['sort'] = 'name_desc';
        break;
      case VendorSortType.ratingHighToLow:
        params['sort'] = 'rating_desc';
        break;
      case VendorSortType.ratingLowToHigh:
        params['sort'] = 'rating_asc';
        break;
      case VendorSortType.relevance:
      default:
        // No sort parameter for relevance (default)
        break;
    }

    return params;
  }

  String _mapBusinessType(String businessType) {
    final typeMap = {
      'individual': 'individual',
      'partnership': 'partnership',
      'company': 'company',
      'llp': 'llp',
      'private limited': 'pvt_ltd',
      'public limited': 'public_ltd',
      'other': 'other',
    };
    return typeMap[businessType.toLowerCase()] ?? businessType.toLowerCase();
  }

  String getSortDisplayName(VendorSortType sortType) {
    switch (sortType) {
      case VendorSortType.relevance:
        return 'Relevance';
      case VendorSortType.newestFirst:
        return 'Newest First';
      case VendorSortType.nameAtoZ:
        return 'Name A-Z';
      case VendorSortType.nameZtoA:
        return 'Name Z-A';
      case VendorSortType.ratingHighToLow:
        return 'Rating High to Low';
      case VendorSortType.ratingLowToHigh:
        return 'Rating Low to High';
    }
  }

  @override
  String toString() {
    return 'VendorFiltersEntity(page: $page, limit: $limit, isActive: $isActive, businessType: $businessType, services: $services, location: $location, city: $city, state: $state, sortBy: $sortBy)';
  }
}