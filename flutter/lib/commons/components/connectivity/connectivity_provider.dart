import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_viewmodel.dart';
import 'package:trees_india/commons/utils/services/connectivity_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final connectivityNotifierProvider =
    StateNotifierProvider<ConnectivityNotifier, bool>(
  (ref) => ConnectivityNotifier(
    ref.read(connectivityServiceProvider), // Inject the ConnectivityService
  ),
);

// Connectivity providers
final connectivityProvider = Provider<Connectivity>((ref) => Connectivity());

final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  return ConnectivityService(connectivity: ref.read(connectivityProvider));
});
