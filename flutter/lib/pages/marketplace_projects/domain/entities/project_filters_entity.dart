enum ProjectSortType {
  relevance,
  newestFirst,
  titleAtoZ,
  titleZtoA,
  durationShortToLong,
  durationLongToShort,
}

class ProjectFiltersEntity {
  final int page;
  final int limit;
  final String? projectType;
  final String? status;
  final String? city;
  final String? state;
  final ProjectSortType sortBy;

  const ProjectFiltersEntity({
    this.page = 1,
    this.limit = 10,
    this.projectType,
    this.status,
    this.city,
    this.state,
    this.sortBy = ProjectSortType.relevance,
  });

  ProjectFiltersEntity copyWith({
    int? page,
    int? limit,
    String? projectType,
    String? status,
    String? city,
    String? state,
    ProjectSortType? sortBy,
    bool clearProjectType = false,
    bool clearStatus = false,
    bool clearCity = false,
    bool clearState = false,
  }) {
    return ProjectFiltersEntity(
      page: page ?? this.page,
      limit: limit ?? this.limit,
      projectType: clearProjectType ? null : (projectType ?? this.projectType),
      status: clearStatus ? null : (status ?? this.status),
      city: clearCity ? null : (city ?? this.city),
      state: clearState ? null : (state ?? this.state),
      sortBy: sortBy ?? this.sortBy,
    );
  }

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (projectType != null && projectType!.isNotEmpty) {
      params['project_type'] = projectType!.toLowerCase();
    }

    if (status != null && status!.isNotEmpty) {
      params['status'] = _mapStatusToApi(status!);
    }

    if (city != null && city!.isNotEmpty) {
      params['city'] = city!;
    }

    if (state != null && state!.isNotEmpty) {
      params['state'] = state!;
    }

    switch (sortBy) {
      case ProjectSortType.newestFirst:
        params['sort'] = 'created_at_desc';
        break;
      case ProjectSortType.titleAtoZ:
        params['sort'] = 'title_asc';
        break;
      case ProjectSortType.titleZtoA:
        params['sort'] = 'title_desc';
        break;
      case ProjectSortType.durationShortToLong:
        params['sort'] = 'duration_asc';
        break;
      case ProjectSortType.durationLongToShort:
        params['sort'] = 'duration_desc';
        break;
      case ProjectSortType.relevance:
      break;
    }

    return params;
  }

  String _mapStatusToApi(String status) {
    final statusMap = {
      'Starting Soon': 'starting_soon',
      'On Going': 'on_going',
      'Completed': 'completed',
      'On Hold': 'on_hold',
      'Cancelled': 'cancelled',
    };
    return statusMap[status] ?? status.toLowerCase().replaceAll(' ', '_');
  }

  String getSortDisplayName(ProjectSortType sortType) {
    switch (sortType) {
      case ProjectSortType.relevance:
        return 'Relevance';
      case ProjectSortType.newestFirst:
        return 'Newest First';
      case ProjectSortType.titleAtoZ:
        return 'Title A-Z';
      case ProjectSortType.titleZtoA:
        return 'Title Z-A';
      case ProjectSortType.durationShortToLong:
        return 'Duration Short to Long';
      case ProjectSortType.durationLongToShort:
        return 'Duration Long to Short';
    }
  }

  bool get hasActiveFilters {
    return projectType != null ||
        status != null ||
        city != null ||
        state != null ||
        sortBy != ProjectSortType.relevance;
  }

  int get activeFiltersCount {
    int count = 0;
    if (projectType != null) count++;
    if (status != null) count++;
    if (city != null) count++;
    if (state != null) count++;
    if (sortBy != ProjectSortType.relevance) count++;
    return count;
  }

  @override
  String toString() {
    return 'ProjectFiltersEntity(page: $page, limit: $limit, projectType: $projectType, status: $status, city: $city, state: $state, sortBy: $sortBy)';
  }
}