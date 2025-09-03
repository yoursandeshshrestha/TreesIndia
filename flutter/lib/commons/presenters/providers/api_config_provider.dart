import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/api_config.dart';

final apiConfigProvider = Provider<ApiConfig>((ref) {
  return ApiConfig(); // You can still use static members in ApiConfig
});
