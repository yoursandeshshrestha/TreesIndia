enum WorkerSortType {
  relevance,
  newestFirst,
  nameAtoZ,
  nameZtoA,
  experienceHighToLow,
  experienceLowToHigh,
  ratingHighToLow,
  ratingLowToHigh,
}

class WorkerFiltersEntity {
  final int page;
  final int limit;
  final bool isActive;
  final String? workerType;
  final List<String>? skills;
  final int? minExperience;
  final int? maxExperience;
  final String? search;
  final WorkerSortType sortBy;

  const WorkerFiltersEntity({
    this.page = 1,
    this.limit = 12,
    this.isActive = true,
    this.workerType,
    this.skills,
    this.minExperience,
    this.maxExperience,
    this.search,
    this.sortBy = WorkerSortType.relevance,
  });

  WorkerFiltersEntity copyWith({
    int? page,
    int? limit,
    bool? isActive,
    String? workerType,
    List<String>? skills,
    int? minExperience,
    int? maxExperience,
    String? search,
    WorkerSortType? sortBy,
    bool clearWorkerType = false,
    bool clearSkills = false,
    bool clearMinExperience = false,
    bool clearMaxExperience = false,
    bool clearSearch = false,
  }) {
    return WorkerFiltersEntity(
      page: page ?? this.page,
      limit: limit ?? this.limit,
      isActive: isActive ?? this.isActive,
      workerType: clearWorkerType ? null : (workerType ?? this.workerType),
      skills: clearSkills ? null : (skills ?? this.skills),
      minExperience: clearMinExperience ? null : (minExperience ?? this.minExperience),
      maxExperience: clearMaxExperience ? null : (maxExperience ?? this.maxExperience),
      search: clearSearch ? null : (search ?? this.search),
      sortBy: sortBy ?? this.sortBy,
    );
  }

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{
      'page': page.toString(),
      'limit': limit.toString(),
      'is_active': isActive.toString(),
    };

    if (workerType != null) {
      params['worker_type'] = _mapWorkerType(workerType!);
    }

    if (skills != null && skills!.isNotEmpty) {
      // Join skills with comma for API
      params['skills'] = skills!.join(',');
    }

    if (minExperience != null) {
      params['min_experience'] = minExperience.toString();
    }

    if (maxExperience != null) {
      params['max_experience'] = maxExperience.toString();
    }

    if (search != null && search!.isNotEmpty) {
      params['search'] = search!;
    }

    // Add sort parameter if needed
    switch (sortBy) {
      case WorkerSortType.newestFirst:
        params['sortBy'] = 'newest';
        params['sortOrder'] = 'desc';
        break;
      case WorkerSortType.relevance: // Using this for "Oldest"
        params['sortBy'] = 'oldest';
        params['sortOrder'] = 'asc';
        break;
      case WorkerSortType.experienceHighToLow:
        params['sortBy'] = 'highest_experience';
        params['sortOrder'] = 'desc';
        break;
      case WorkerSortType.experienceLowToHigh:
        params['sortBy'] = 'lowest_experience';
        params['sortOrder'] = 'asc';
        break;
      case WorkerSortType.nameAtoZ:
        params['sort'] = 'name_asc';
        break;
      case WorkerSortType.nameZtoA:
        params['sort'] = 'name_desc';
        break;
      case WorkerSortType.ratingHighToLow:
        params['sort'] = 'rating_desc';
        break;
      case WorkerSortType.ratingLowToHigh:
        params['sort'] = 'rating_asc';
        break;
    }

    return params;
  }

  String _mapWorkerType(String workerType) {
    final typeMap = {
      'independent worker': 'normal',
      'normal': 'normal',
      'treesindia worker': 'treesindia_worker',
      'treesindia_worker': 'treesindia_worker',
    };
    return typeMap[workerType.toLowerCase()] ?? workerType.toLowerCase();
  }

  String getSortDisplayName(WorkerSortType sortType) {
    switch (sortType) {
      case WorkerSortType.relevance:
        return 'Oldest';
      case WorkerSortType.newestFirst:
        return 'Newest';
      case WorkerSortType.experienceHighToLow:
        return 'Highest Experience';
      case WorkerSortType.experienceLowToHigh:
        return 'Lowest Experience';
      case WorkerSortType.nameAtoZ:
        return 'Name A-Z';
      case WorkerSortType.nameZtoA:
        return 'Name Z-A';
      case WorkerSortType.ratingHighToLow:
        return 'Rating High to Low';
      case WorkerSortType.ratingLowToHigh:
        return 'Rating Low to High';
    }
  }

  @override
  String toString() {
    return 'WorkerFiltersEntity(page: $page, limit: $limit, isActive: $isActive, workerType: $workerType, skills: $skills, minExperience: $minExperience, maxExperience: $maxExperience, search: $search, sortBy: $sortBy)';
  }
}