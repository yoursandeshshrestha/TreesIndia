import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/datasources/location_tracking_datasource.dart';
import 'package:trees_india/commons/data/repositories/location_tracking_repository_impl.dart';
import 'package:trees_india/commons/domain/repositories/location_tracking_repository.dart';
import 'package:trees_india/commons/domain/usecases/get_tracking_status_usecase.dart';
import 'package:trees_india/commons/services/location_tracking_websocket_service.dart';
import 'package:trees_india/commons/presenters/viewmodels/location_tracking_viewmodel/location_tracking_notifier.dart';
import 'package:trees_india/commons/presenters/viewmodels/location_tracking_viewmodel/location_tracking_state.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';

// Data source provider
final locationTrackingDatasourceProvider = Provider<LocationTrackingDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  
  return LocationTrackingDatasourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository provider
final locationTrackingRepositoryProvider = Provider<LocationTrackingRepository>((ref) {
  final datasource = ref.read(locationTrackingDatasourceProvider);
  
  return LocationTrackingRepositoryImpl(
    locationTrackingDatasource: datasource,
  );
});

// Use case providers (only keeping the one that's still needed)
final getTrackingStatusUsecaseProvider = Provider<GetTrackingStatusUsecase>((ref) {
  final repository = ref.read(locationTrackingRepositoryProvider);
  return GetTrackingStatusUsecase(repository);
});

// WebSocket service provider
final locationTrackingWebSocketServiceProvider = Provider<LocationTrackingWebSocketService>((ref) {
  return LocationTrackingWebSocketService();
});

// Notifier provider (simplified to use only WebSocket service and remaining use case)
final locationTrackingNotifierProvider = StateNotifierProvider<LocationTrackingNotifier, LocationTrackingStateModel>((ref) {
  final getTrackingStatusUsecase = ref.read(getTrackingStatusUsecaseProvider);
  final webSocketService = ref.read(locationTrackingWebSocketServiceProvider);

  return LocationTrackingNotifier(
    getTrackingStatusUsecase: getTrackingStatusUsecase,
    webSocketService: webSocketService,
  );
});