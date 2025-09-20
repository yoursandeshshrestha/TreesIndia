import '../../domain/entities/stats_entity.dart';

class ProjectStatsModel {
  final int active;
  final int commercial;
  final int completed;
  final int infrastructure;
  final int residential;
  final int total;

  const ProjectStatsModel({
    required this.active,
    required this.commercial,
    required this.completed,
    required this.infrastructure,
    required this.residential,
    required this.total,
  });

  factory ProjectStatsModel.fromJson(Map<String, dynamic> json) {
    return ProjectStatsModel(
      active: json['active']?.toInt() ?? 0,
      commercial: json['commercial']?.toInt() ?? 0,
      completed: json['completed']?.toInt() ?? 0,
      infrastructure: json['infrastructure']?.toInt() ?? 0,
      residential: json['residential']?.toInt() ?? 0,
      total: json['total']?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'active': active,
      'commercial': commercial,
      'completed': completed,
      'infrastructure': infrastructure,
      'residential': residential,
      'total': total,
    };
  }

  ProjectStatsEntity toEntity() {
    return ProjectStatsEntity(
      active: active,
      commercial: commercial,
      completed: completed,
      infrastructure: infrastructure,
      residential: residential,
      total: total,
    );
  }

  @override
  String toString() {
    return 'ProjectStatsModel(active: $active, commercial: $commercial, completed: $completed, infrastructure: $infrastructure, residential: $residential, total: $total)';
  }
}

class VendorStatsModel {
  final int activeVendors;
  final int inactiveVendors;
  final int totalVendors;

  const VendorStatsModel({
    required this.activeVendors,
    required this.inactiveVendors,
    required this.totalVendors,
  });

  factory VendorStatsModel.fromJson(Map<String, dynamic> json) {
    return VendorStatsModel(
      activeVendors: json['active_vendors']?.toInt() ?? 0,
      inactiveVendors: json['inactive_vendors']?.toInt() ?? 0,
      totalVendors: json['total_vendors']?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'active_vendors': activeVendors,
      'inactive_vendors': inactiveVendors,
      'total_vendors': totalVendors,
    };
  }

  VendorStatsEntity toEntity() {
    return VendorStatsEntity(
      activeVendors: activeVendors,
      inactiveVendors: inactiveVendors,
      totalVendors: totalVendors,
    );
  }

  @override
  String toString() {
    return 'VendorStatsModel(activeVendors: $activeVendors, inactiveVendors: $inactiveVendors, totalVendors: $totalVendors)';
  }
}

class WorkerStatsModel {
  final int activeWorkers;
  final int availableWorkers;
  final int normalWorkers;
  final int totalWorkers;
  final int treesindiaWorkers;

  const WorkerStatsModel({
    required this.activeWorkers,
    required this.availableWorkers,
    required this.normalWorkers,
    required this.totalWorkers,
    required this.treesindiaWorkers,
  });

  factory WorkerStatsModel.fromJson(Map<String, dynamic> json) {
    return WorkerStatsModel(
      activeWorkers: json['active_workers']?.toInt() ?? 0,
      availableWorkers: json['available_workers']?.toInt() ?? 0,
      normalWorkers: json['normal_workers']?.toInt() ?? 0,
      totalWorkers: json['total_workers']?.toInt() ?? 0,
      treesindiaWorkers: json['treesindia_workers']?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'active_workers': activeWorkers,
      'available_workers': availableWorkers,
      'normal_workers': normalWorkers,
      'total_workers': totalWorkers,
      'treesindia_workers': treesindiaWorkers,
    };
  }

  WorkerStatsEntity toEntity() {
    return WorkerStatsEntity(
      activeWorkers: activeWorkers,
      availableWorkers: availableWorkers,
      normalWorkers: normalWorkers,
      totalWorkers: totalWorkers,
      treesindiaWorkers: treesindiaWorkers,
    );
  }

  @override
  String toString() {
    return 'WorkerStatsModel(activeWorkers: $activeWorkers, availableWorkers: $availableWorkers, normalWorkers: $normalWorkers, totalWorkers: $totalWorkers, treesindiaWorkers: $treesindiaWorkers)';
  }
}

class StatsResponseModel<T> {
  final bool success;
  final String message;
  final T? data;
  final String timestamp;

  const StatsResponseModel({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory StatsResponseModel.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    return StatsResponseModel<T>(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      timestamp: json['timestamp'] ?? '',
    );
  }

  Map<String, dynamic> toJson(Map<String, dynamic> Function(T) toJsonT) {
    return {
      'success': success,
      'message': message,
      'data': data != null ? toJsonT(data as T) : null,
      'timestamp': timestamp,
    };
  }

  StatsResponseEntity<R> toEntity<R>(R Function(T) toEntityT) {
    return StatsResponseEntity<R>(
      success: success,
      message: message,
      data: data != null ? toEntityT(data as T) : null,
      timestamp: timestamp,
    );
  }

  @override
  String toString() {
    return 'StatsResponseModel(success: $success, message: $message, data: $data, timestamp: $timestamp)';
  }
}