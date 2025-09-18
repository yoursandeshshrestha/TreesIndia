import 'package:intl/intl.dart';

class SubscriptionEntity {
  final int id;
  final int userId;
  final int planId;
  final SubscriptionPlanEntity? plan;
  final DateTime startDate;
  final DateTime endDate;
  final String status;
  final String paymentMethod;
  final String paymentId;
  final double amount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const SubscriptionEntity({
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

  bool get isActive {
    final now = DateTime.now();
    return status == 'active' && now.isBefore(endDate);
  }

  int get daysRemaining {
    if (!isActive) return 0;
    final now = DateTime.now();
    return endDate.difference(now).inDays;
  }

  String get displayAmount {
    return '₹${amount.toStringAsFixed(0)}';
  }

  String get displayStartDate {
    return DateFormat('MMMM d, yyyy').format(startDate);
  }

  String get displayEndDate {
    return DateFormat('MMMM d, yyyy').format(endDate);
  }

  String get displayStatus {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  // Convert UTC times to IST (+5:30)
  DateTime get startDateIST {
    return startDate.add(const Duration(hours: 5, minutes: 30));
  }

  DateTime get endDateIST {
    return endDate.add(const Duration(hours: 5, minutes: 30));
  }

  String get displayStartDateIST {
    final istDate = startDateIST;
    return DateFormat('MMMM d, yyyy').format(istDate);
  }

  String get displayEndDateIST {
    final istDate = endDateIST;
    return DateFormat('MMMM d, yyyy').format(istDate);
  }
}

class SubscriptionPlanEntity {
  final int id;
  final String name;
  final bool isActive;
  final String description;
  final SubscriptionFeaturesEntity? features;
  final List<SubscriptionPricingEntity> pricing;
  final DateTime createdAt;
  final DateTime updatedAt;

  const SubscriptionPlanEntity({
    required this.id,
    required this.name,
    required this.isActive,
    required this.description,
    this.features,
    required this.pricing,
    required this.createdAt,
    required this.updatedAt,
  });

  SubscriptionPricingEntity? getPricingByDuration(String durationType) {
    try {
      return pricing.firstWhere(
        (p) => p.durationType == durationType,
      );
    } catch (e) {
      return null;
    }
  }

  double? getMonthlyPrice() {
    return getPricingByDuration('monthly')?.price;
  }

  double? getYearlyPrice() {
    return getPricingByDuration('yearly')?.price;
  }

  String get displayMonthlyPrice {
    final price = getMonthlyPrice();
    return price != null ? '₹${price.toStringAsFixed(0)}' : 'N/A';
  }

  String get displayYearlyPrice {
    final price = getYearlyPrice();
    return price != null ? '₹${price.toStringAsFixed(0)}' : 'N/A';
  }

  List<String> get featuresList {
    if (features?.description == null) return [];
    return features!.description.split('\n')
        .where((feature) => feature.trim().isNotEmpty)
        .toList();
  }
}

class SubscriptionPricingEntity {
  final String durationType;
  final int durationDays;
  final double price;

  const SubscriptionPricingEntity({
    required this.durationType,
    required this.durationDays,
    required this.price,
  });

  String get displayDuration {
    switch (durationType.toLowerCase()) {
      case 'monthly':
        return 'month';
      case 'yearly':
        return 'year';
      default:
        return durationType;
    }
  }

  String get displayPrice {
    return '₹${price.toStringAsFixed(0)}';
  }
}

class SubscriptionFeaturesEntity {
  final String description;

  const SubscriptionFeaturesEntity({
    required this.description,
  });
}