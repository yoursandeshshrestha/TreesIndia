import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/components/main_layout/app/views/main_layout_widget.dart';
import '../providers/bookings_providers.dart';
import '../viewmodels/bookings_state.dart';
import 'widgets/booking_card_widget.dart';

class BookingsListingPage extends ConsumerStatefulWidget {
  const BookingsListingPage({super.key});

  @override
  ConsumerState<BookingsListingPage> createState() =>
      _BookingsListingPageState();
}

class _BookingsListingPageState extends ConsumerState<BookingsListingPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(bookingsNotifierProvider.notifier).getBookings();
    });

    _scrollController.addListener(() {
      if (_scrollController.position.pixels ==
          _scrollController.position.maxScrollExtent) {
        ref.read(bookingsNotifierProvider.notifier).loadMoreBookings();
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookingsState = ref.watch(bookingsNotifierProvider);

    return MainLayoutWidget(
      currentIndex: 1,
      child: Scaffold(
        backgroundColor: AppColors.brandNeutral50,
        appBar: AppBar(
          title: H3Bold(
            text: 'My Bookings',
            color: AppColors.brandNeutral800,
          ),
          backgroundColor: AppColors.brandNeutral50,
          elevation: 0,
          automaticallyImplyLeading: false,
          actions: [
            IconButton(
              icon: bookingsState.isRefreshing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.brandPrimary500,
                      ),
                    )
                  : const Icon(Icons.refresh, color: AppColors.brandNeutral800),
              onPressed: bookingsState.isRefreshing
                  ? null
                  : () => ref.read(bookingsNotifierProvider.notifier).refresh(),
            ),
          ],
        ),
        body: _buildBody(bookingsState),
      ),
    );
  }

  Widget _buildBody(BookingsState state) {
    if (state.status == BookingsStatus.loading && state.bookings.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppColors.brandPrimary500,
        ),
      );
    }

    if (state.status == BookingsStatus.failure && state.bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.stateRed500,
            ),
            const SizedBox(height: AppSpacing.md),
            H4Bold(
              text: 'Error loading bookings',
              color: AppColors.brandNeutral800,
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Medium(
              text: state.errorMessage.isNotEmpty
                  ? state.errorMessage
                  : 'Something went wrong. Please try again.',
              color: AppColors.brandNeutral600,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.md),
            ElevatedButton(
              onPressed: () =>
                  ref.read(bookingsNotifierProvider.notifier).getBookings(),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (state.bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.bookmark_border,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            const SizedBox(height: AppSpacing.md),
            H4Bold(
              text: 'No bookings yet',
              color: AppColors.brandNeutral800,
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Medium(
              text: 'Your service bookings will appear here',
              color: AppColors.brandNeutral600,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.read(bookingsNotifierProvider.notifier).refresh();
      },
      color: AppColors.brandPrimary500,
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(AppSpacing.md),
        itemCount: state.bookings.length + (state.isLoadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == state.bookings.length) {
            return const Padding(
              padding: EdgeInsets.all(AppSpacing.md),
              child: Center(
                child: CircularProgressIndicator(
                  color: AppColors.brandPrimary500,
                ),
              ),
            );
          }

          final booking = state.bookings[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: BookingCardWidget(booking: booking),
          );
        },
      ),
    );
  }
}
