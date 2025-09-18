import '../../domain/entities/subscription_entity.dart';

class SubscriptionModel {
  final int id;
  final int userId;
  final int planId;
  final SubscriptionPlanModel? plan;
  final String startDate;
  final String endDate;
  final String status;
  final String paymentMethod;
  final String paymentId;
  final double amount;
  final String createdAt;
  final String updatedAt;

  const SubscriptionModel({
    required this.id,
    required this.userId,
    required this.planId,
    this.plan,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.paymentMethod,
    required this.paymentId,
    required this.amount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionModel(
      id: json['ID'] ?? json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      planId: json['plan_id'] ?? 0,
      plan: json['plan'] != null ? SubscriptionPlanModel.fromJson(json['plan']) : null,
      startDate: json['start_date'] ?? '',
      endDate: json['end_date'] ?? '',
      status: json['status'] ?? '',
      paymentMethod: json['payment_method'] ?? '',
      paymentId: json['payment_id'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      createdAt: json['CreatedAt'] ?? json['created_at'] ?? '',
      updatedAt: json['UpdatedAt'] ?? json['updated_at'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'user_id': userId,
      'plan_id': planId,
      'plan': plan?.toJson(),
      'start_date': startDate,
      'end_date': endDate,
      'status': status,
      'payment_method': paymentMethod,
      'payment_id': paymentId,
      'amount': amount,
      'CreatedAt': createdAt,
      'UpdatedAt': updatedAt,
    };
  }

  SubscriptionEntity toEntity() {
    return SubscriptionEntity(
      id: id,
      userId: userId,
      planId: planId,
      plan: plan?.toEntity(),
      startDate: DateTime.parse(startDate),
      endDate: DateTime.parse(endDate),
      status: status,
      paymentMethod: paymentMethod,
      paymentId: paymentId,
      amount: amount,
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }
}

class SubscriptionPlanModel {
  final int id;
  final String name;
  final bool isActive;
  final String description;
  final SubscriptionFeaturesModel? features;
  final List<SubscriptionPricingModel> pricing;
  final String createdAt;
  final String updatedAt;

  const SubscriptionPlanModel({
    required this.id,
    required this.name,
    required this.isActive,
    required this.description,
    this.features,
    required this.pricing,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SubscriptionPlanModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlanModel(
      id: json['ID'] ?? json['id'] ?? 0,
      name: json['name'] ?? '',
      isActive: json['is_active'] ?? false,
      description: json['description'] ?? '',
      features: json['features'] != null
        ? SubscriptionFeaturesModel.fromJson(json['features'])
        : null,
      pricing: json['pricing'] != null
        ? (json['pricing'] as List)
            .map((p) => SubscriptionPricingModel.fromJson(p))
            .toList()
        : [],
      createdAt: json['CreatedAt'] ?? json['created_at'] ?? '',
      updatedAt: json['UpdatedAt'] ?? json['updated_at'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'name': name,
      'is_active': isActive,
      'description': description,
      'features': features?.toJson(),
      'pricing': pricing.map((p) => p.toJson()).toList(),
      'CreatedAt': createdAt,
      'UpdatedAt': updatedAt,
    };
  }

  SubscriptionPlanEntity toEntity() {
    return SubscriptionPlanEntity(
      id: id,
      name: name,
      isActive: isActive,
      description: description,
      features: features?.toEntity(),
      pricing: pricing.map((p) => p.toEntity()).toList(),
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }
}

class SubscriptionPricingModel {
  final String durationType;
  final int durationDays;
  final double price;

  const SubscriptionPricingModel({
    required this.durationType,
    required this.durationDays,
    required this.price,
  });

  factory SubscriptionPricingModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionPricingModel(
      durationType: json['duration_type'] ?? '',
      durationDays: json['duration_days'] ?? 0,
      price: (json['price'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'duration_type': durationType,
      'duration_days': durationDays,
      'price': price,
    };
  }

  SubscriptionPricingEntity toEntity() {
    return SubscriptionPricingEntity(
      durationType: durationType,
      durationDays: durationDays,
      price: price,
    );
  }
}

class SubscriptionFeaturesModel {
  final String description;

  const SubscriptionFeaturesModel({
    required this.description,
  });

  factory SubscriptionFeaturesModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionFeaturesModel(
      description: json['description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'description': description,
    };
  }

  SubscriptionFeaturesEntity toEntity() {
    return SubscriptionFeaturesEntity(
      description: description,
    );
  }
}