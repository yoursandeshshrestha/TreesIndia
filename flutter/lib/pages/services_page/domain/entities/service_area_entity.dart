import 'package:equatable/equatable.dart';

class ServiceAreaEntity extends Equatable {
  final int id;
  final String city;
  final String state;
  final String country;
  final bool isActive;

  const ServiceAreaEntity({
    required this.id,
    required this.city,
    required this.state,
    required this.country,
    required this.isActive,
  });

  @override
  List<Object> get props => [
        id,
        city,
        state,
        country,
        isActive,
      ];
}