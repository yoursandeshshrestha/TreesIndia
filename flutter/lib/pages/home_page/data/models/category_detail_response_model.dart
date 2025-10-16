import 'category_detail_model.dart';

class CategoryDetailResponseModel {
  final bool success;
  final String message;
  final CategoryDetailModel data;
  final String timestamp;

  CategoryDetailResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory CategoryDetailResponseModel.fromJson(Map<String, dynamic> json) {
    return CategoryDetailResponseModel(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: CategoryDetailModel.fromJson(json['data'] as Map<String, dynamic>),
      timestamp: json['timestamp'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data.toJson(),
      'timestamp': timestamp,
    };
  }
}
