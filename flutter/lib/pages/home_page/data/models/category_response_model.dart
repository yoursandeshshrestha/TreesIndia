import 'category_model.dart';

class CategoryResponseModel {
  final bool success;
  final String message;
  final List<CategoryModel> data;
  final DateTime timestamp;

  const CategoryResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory CategoryResponseModel.fromJson(Map<String, dynamic> json) {
    return CategoryResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: (json['data'] as List<dynamic>?)
              ?.map((item) =>
                  CategoryModel.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data.map((category) => category.toJson()).toList(),
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
