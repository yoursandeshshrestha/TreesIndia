import '../../domain/entities/available_slot_entity.dart';

class AvailableSlotModel extends AvailableSlotEntity {
  const AvailableSlotModel({
    required super.time,
    required super.availableWorkers,
    required super.isAvailable,
  });

  factory AvailableSlotModel.fromJson(Map<String, dynamic> json) {
    return AvailableSlotModel(
      time: json['time'] as String? ?? '',
      availableWorkers: json['available_workers'] as int? ?? 0,
      isAvailable: json['is_available'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'time': time,
      'available_workers': availableWorkers,
      'is_available': isAvailable,
    };
  }

  AvailableSlotEntity toEntity() {
    return AvailableSlotEntity(
      time: time,
      availableWorkers: availableWorkers,
      isAvailable: isAvailable,
    );
  }
}

class WorkingHoursModel extends WorkingHoursEntity {
  const WorkingHoursModel({
    required super.start,
    required super.end,
  });

  factory WorkingHoursModel.fromJson(Map<String, dynamic> json) {
    return WorkingHoursModel(
      start: json['start'] as String? ?? '',
      end: json['end'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'start': start,
      'end': end,
    };
  }

  WorkingHoursEntity toEntity() {
    return WorkingHoursEntity(
      start: start,
      end: end,
    );
  }
}

class AvailableSlotsResponseModel extends AvailableSlotsResponseEntity {
  const AvailableSlotsResponseModel({
    required super.workingHours,
    required super.serviceDuration,
    required super.bufferTime,
    required super.availableSlots,
  });

  factory AvailableSlotsResponseModel.fromJson(Map<String, dynamic> json) {
    return AvailableSlotsResponseModel(
      workingHours: WorkingHoursModel.fromJson(json['working_hours'] as Map<String, dynamic>? ?? {}),
      serviceDuration: json['service_duration'] as int? ?? 0,
      bufferTime: json['buffer_time'] as int? ?? 0,
      availableSlots: (json['available_slots'] as List<dynamic>?)
          ?.map((slot) => AvailableSlotModel.fromJson(slot as Map<String, dynamic>))
          .toList() ?? [],
    );
  }

  AvailableSlotsResponseEntity toEntity() {
    return AvailableSlotsResponseEntity(
      workingHours: (workingHours as WorkingHoursModel).toEntity(),
      serviceDuration: serviceDuration,
      bufferTime: bufferTime,
      availableSlots: availableSlots
          .map((slot) => (slot as AvailableSlotModel).toEntity())
          .toList(),
    );
  }
}