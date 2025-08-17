import 'package:trees_india/commons/presenters/providers/api_config_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../utils/services/dio_client.dart';
import 'notification_service_provider.dart';

final dioClientProvider = Provider<DioClient>((ref) {
  final notificationService = ref.read(notificationServiceProvider);
  final apiConfig = ref.read(apiConfigProvider);

  return DioClient(
    ref,
    notificationService,
    apiConfig,
  );
});
