import 'package:equatable/equatable.dart';

enum ServiceCategory { homeServices, constructionServices, rentalAndProperties }

class ServiceEntity extends Equatable {
  final String id;
  final String name;
  final String description;
  final String iconUrl;
  final ServiceCategory category;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const ServiceEntity({
    required this.id,
    required this.name,
    required this.description,
    required this.iconUrl,
    required this.category,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  @override
  List<Object> get props => [
        id,
        name,
        description,
        iconUrl,
        category,
        isActive,
        createdAt,
        updatedAt,
      ];
}
