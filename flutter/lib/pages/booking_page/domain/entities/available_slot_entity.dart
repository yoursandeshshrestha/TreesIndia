import 'package:equatable/equatable.dart';

class AvailableSlotEntity extends Equatable {
  final String time;
  final int availableWorkers;
  final bool isAvailable;

  const AvailableSlotEntity({
    required this.time,
    required this.availableWorkers,
    required this.isAvailable,
  });

  @override
  List<Object?> get props => [time, availableWorkers, isAvailable];
}

class WorkingHoursEntity extends Equatable {
  final String start;
  final String end;

  const WorkingHoursEntity({
    required this.start,
    required this.end,
  });

  @override
  List<Object?> get props => [start, end];
}

class AvailableSlotsResponseEntity extends Equatable {
  final WorkingHoursEntity workingHours;
  final int serviceDuration;
  final int bufferTime;
  final List<AvailableSlotEntity> availableSlots;

  const AvailableSlotsResponseEntity({
    required this.workingHours,
    required this.serviceDuration,
    required this.bufferTime,
    required this.availableSlots,
  });

  @override
  List<Object?> get props => [
        workingHours,
        serviceDuration,
        bufferTime,
        availableSlots,
      ];
}