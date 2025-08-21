import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../utils/services/centralized_local_storage_service.dart';

final localStorageServiceProvider =
    Provider<CentralizedLocalStorageService>((ref) {
  return CentralizedLocalStorageService();
});
