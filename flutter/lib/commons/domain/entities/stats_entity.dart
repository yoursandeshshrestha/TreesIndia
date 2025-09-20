class ProjectStatsEntity {
  final int active;
  final int commercial;
  final int completed;
  final int infrastructure;
  final int residential;
  final int total;

  const ProjectStatsEntity({
    required this.active,
    required this.commercial,
    required this.completed,
    required this.infrastructure,
    required this.residential,
    required this.total,
  });

  ProjectStatsEntity copyWith({
    int? active,
    int? commercial,
    int? completed,
    int? infrastructure,
    int? residential,
    int? total,
  }) {
    return ProjectStatsEntity(
      active: active ?? this.active,
      commercial: commercial ?? this.commercial,
      completed: completed ?? this.completed,
      infrastructure: infrastructure ?? this.infrastructure,
      residential: residential ?? this.residential,
      total: total ?? this.total,
    );
  }

  @override
  String toString() {
    return 'ProjectStatsEntity(active: $active, commercial: $commercial, completed: $completed, infrastructure: $infrastructure, residential: $residential, total: $total)';
  }
}

class VendorStatsEntity {
  final int activeVendors;
  final int inactiveVendors;
  final int totalVendors;

  const VendorStatsEntity({
    required this.activeVendors,
    required this.inactiveVendors,
    required this.totalVendors,
  });

  VendorStatsEntity copyWith({
    int? activeVendors,
    int? inactiveVendors,
    int? totalVendors,
  }) {
    return VendorStatsEntity(
      activeVendors: activeVendors ?? this.activeVendors,
      inactiveVendors: inactiveVendors ?? this.inactiveVendors,
      totalVendors: totalVendors ?? this.totalVendors,
    );
  }

  @override
  String toString() {
    return 'VendorStatsEntity(activeVendors: $activeVendors, inactiveVendors: $inactiveVendors, totalVendors: $totalVendors)';
  }
}

class WorkerStatsEntity {
  final int activeWorkers;
  final int availableWorkers;
  final int normalWorkers;
  final int totalWorkers;
  final int treesindiaWorkers;

  const WorkerStatsEntity({
    required this.activeWorkers,
    required this.availableWorkers,
    required this.normalWorkers,
    required this.totalWorkers,
    required this.treesindiaWorkers,
  });

  WorkerStatsEntity copyWith({
    int? activeWorkers,
    int? availableWorkers,
    int? normalWorkers,
    int? totalWorkers,
    int? treesindiaWorkers,
  }) {
    return WorkerStatsEntity(
      activeWorkers: activeWorkers ?? this.activeWorkers,
      availableWorkers: availableWorkers ?? this.availableWorkers,
      normalWorkers: normalWorkers ?? this.normalWorkers,
      totalWorkers: totalWorkers ?? this.totalWorkers,
      treesindiaWorkers: treesindiaWorkers ?? this.treesindiaWorkers,
    );
  }

  @override
  String toString() {
    return 'WorkerStatsEntity(activeWorkers: $activeWorkers, availableWorkers: $availableWorkers, normalWorkers: $normalWorkers, totalWorkers: $totalWorkers, treesindiaWorkers: $treesindiaWorkers)';
  }
}

class StatsResponseEntity<T> {
  final bool success;
  final String message;
  final T? data;
  final String timestamp;

  const StatsResponseEntity({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  StatsResponseEntity<T> copyWith({
    bool? success,
    String? message,
    T? data,
    String? timestamp,
  }) {
    return StatsResponseEntity<T>(
      success: success ?? this.success,
      message: message ?? this.message,
      data: data ?? this.data,
      timestamp: timestamp ?? this.timestamp,
    );
  }

  @override
  String toString() {
    return 'StatsResponseEntity(success: $success, message: $message, data: $data, timestamp: $timestamp)';
  }
}