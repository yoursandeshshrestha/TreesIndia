import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/constants/app_colors.dart';
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      body: SafeArea(
        child: widget.service.priceType == 'fixed'
            ? FixedPriceBookingWidget(service: widget.service)
            : InquiryBookingWidget(service: widget.service),
      ),
    );
  }
}