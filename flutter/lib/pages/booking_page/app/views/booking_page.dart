import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/pages/booking_page/app/providers/booking_providers.dart';

import '../../../services_page/domain/entities/service_detail_entity.dart';
import 'widgets/fixed_price_booking_widget.dart';
import 'widgets/inquiry_booking_widget.dart';

class BookingPage extends ConsumerStatefulWidget {
  final ServiceDetailEntity service;

  const BookingPage({
    super.key,
    required this.service,
  });

  @override
  ConsumerState<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends ConsumerState<BookingPage> {
  @override
  void initState() {
    super.initState();
    // Booking config is already loaded in service detail page
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(bookingNotifierProvider.notifier).loadBookingConfig();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isConnected = ref.watch(connectivityNotifierProvider);
    if (!isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(notificationServiceProvider).showOfflineMessage(
              context,
              onRetry: () => debugPrint('Retrying…'),
            );
      });
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: widget.service.priceType == 'fixed'
            ? FixedPriceBookingWidget(service: widget.service)
            : InquiryBookingWidget(service: widget.service),
      ),
    );
  }
}
