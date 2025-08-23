import '../../domain/entities/service_entity.dart';

class ServiceModel extends ServiceEntity {
  const ServiceModel({
    required super.id,
    required super.name,
    required super.description,
    required super.iconUrl,
    required super.category,
    required super.isActive,
    required super.createdAt,
    required super.updatedAt,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      iconUrl: json['iconUrl'] as String,
      category: ServiceCategory.values.firstWhere(
        (e) => e.toString().split('.').last == json['category'],
        orElse: () => ServiceCategory.homeServices,
      ),
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'iconUrl': iconUrl,
      'category': category.toString().split('.').last,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  ServiceEntity toEntity() {
    return ServiceEntity(
      id: id,
      name: name,
      description: description,
      iconUrl: iconUrl,
      category: category,
      isActive: isActive,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory ServiceModel.fromEntity(ServiceEntity entity) {
    return ServiceModel(
      id: entity.id,
      name: entity.name,
      description: entity.description,
      iconUrl: entity.iconUrl,
      category: entity.category,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }
}