import 'subcategory_model.dart';

class SubcategoryResponseModel {
  final bool success;
  final String message;
  final List<SubcategoryModel> data;
  final DateTime timestamp;

  const SubcategoryResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory SubcategoryResponseModel.fromJson(Map<String, dynamic> json) {
    return SubcategoryResponseModel(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: (json['data'] as List<dynamic>)
          .map((item) => SubcategoryModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data.map((subcategory) => subcategory.toJson()).toList(),
      'timestamp': timestamp.toIso8601String(),
    };
  }
}