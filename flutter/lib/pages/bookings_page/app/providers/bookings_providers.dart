import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/presenters/providers/dio_provider.dart';
import '../../../../commons/presenters/providers/error_handler_provider.dart';
import '../../data/datasources/bookings_datasource.dart';
import '../../data/repositories/bookings_repository_impl.dart';
import '../../domain/repositories/bookings_repository.dart';
import '../../domain/usecases/get_bookings_usecase.dart';
import '../../domain/usecases/cancel_booking_usecase.dart';
import '../viewmodels/bookings_notifier.dart';
import '../viewmodels/bookings_state.dart';

final bookingsDatasourceProvider = Provider<BookingsDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return BookingsDatasource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

final bookingsRepositoryProvider = Provider<BookingsRepository>((ref) {
  final datasource = ref.read(bookingsDatasourceProvider);

  return BookingsRepositoryImpl(datasource: datasource);
});

final getBookingsUseCaseProvider = Provider<GetBookingsUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return GetBookingsUseCase(repository: repository);
});

final cancelBookingUseCaseProvider = Provider<CancelBookingUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return CancelBookingUseCase(repository: repository);
});

final bookingsNotifierProvider =
    StateNotifierProvider<BookingsNotifier, BookingsState>((ref) {
  final getBookingsUseCase = ref.read(getBookingsUseCaseProvider);
  final cancelBookingUseCase = ref.read(cancelBookingUseCaseProvider);

  return BookingsNotifier(
    getBookingsUseCase: getBookingsUseCase,
    cancelBookingUseCase: cancelBookingUseCase,
  );
});
