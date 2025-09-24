import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/commons/theming/text_styles.dart';
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

class _BookingsListingPageState extends ConsumerState<BookingsListingPage>
    with TickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(bookingsNotifierProvider.notifier).getBookings(
            tab: BookingTab.all,
            page: 1,
          );
    });

    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        final tab = _getTabFromIndex(_tabController.index);
        ref.read(bookingsNotifierProvider.notifier).switchTab(tab);
      }
    });

    _scrollController.addListener(() {
      if (_scrollController.position.pixels ==
          _scrollController.position.maxScrollExtent) {
        ref.read(bookingsNotifierProvider.notifier).loadMoreBookings();
      }
    });
  }

  BookingTab _getTabFromIndex(int index) {
    switch (index) {
      case 0:
        return BookingTab.all;
      case 1:
        return BookingTab.upcoming;
      case 2:
        return BookingTab.completed;
      case 3:
        return BookingTab.cancelled;
      default:
        return BookingTab.all;
    }
  }

  int _getIndexFromTab(BookingTab tab) {
    switch (tab) {
      case BookingTab.all:
        return 0;
      case BookingTab.upcoming:
        return 1;
      case BookingTab.completed:
        return 2;
      case BookingTab.cancelled:
        return 3;
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookingsState = ref.watch(bookingsNotifierProvider);
    final isConnected = ref.watch(connectivityNotifierProvider);
    if (!isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(notificationServiceProvider).showOfflineMessage(
              context,
              onRetry: () => debugPrint('Retrying…'),
            );
      });
    }

    // Update tab controller if needed
    if (_tabController.index != _getIndexFromTab(bookingsState.currentTab)) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _tabController.animateTo(_getIndexFromTab(bookingsState.currentTab));
      });
    }

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
                        color: Color(0xFF055c3a),
                      ),
                    )
                  : const Icon(Icons.refresh, color: AppColors.brandNeutral800),
              onPressed: bookingsState.isRefreshing
                  ? null
                  : () => ref.read(bookingsNotifierProvider.notifier).refresh(),
            ),
          ],
          bottom: TabBar(
            controller: _tabController,
            labelColor: const Color(0xFF055c3a),
            labelStyle: TextStyles.b4Medium(),
            unselectedLabelColor: AppColors.brandNeutral600,
            unselectedLabelStyle: TextStyles.b4Regular(),
            indicatorColor: const Color(0xFF055c3a),
            dividerColor: AppColors.brandNeutral300,
            indicatorSize: TabBarIndicatorSize.tab,
            tabs: const [
              Tab(text: 'All'),
              Tab(text: 'Upcoming'),
              Tab(text: 'Completed'),
              Tab(text: 'Cancelled'),
            ],
          ),
        ),
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildTabContent(bookingsState, BookingTab.all),
            _buildTabContent(bookingsState, BookingTab.upcoming),
            _buildTabContent(bookingsState, BookingTab.completed),
            _buildTabContent(bookingsState, BookingTab.cancelled),
          ],
        ),
      ),
    );
  }

  Widget _buildTabContent(BookingsState state, BookingTab tab) {
    // Check if this tab is currently active
    if (state.currentTab != tab) {
      return const SizedBox.shrink();
    }

    final bookings = state.currentBookings;

    if (state.status == BookingsStatus.loading && bookings.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(
          color: Color(0xFF055c3a),
        ),
      );
    }

    if (state.status == BookingsStatus.failure && bookings.isEmpty) {
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
              onPressed: () => ref
                  .read(bookingsNotifierProvider.notifier)
                  .getBookings(tab: tab),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (bookings.isEmpty) {
      String emptyMessage;
      String emptySubMessage;

      switch (tab) {
        case BookingTab.all:
          emptyMessage = 'No bookings yet';
          emptySubMessage = 'Your service bookings will appear here';
          break;
        case BookingTab.upcoming:
          emptyMessage = 'No upcoming bookings';
          emptySubMessage = 'You don\'t have any upcoming service bookings';
          break;
        case BookingTab.completed:
          emptyMessage = 'No completed bookings';
          emptySubMessage = 'Your completed service bookings will appear here';
          break;
        case BookingTab.cancelled:
          emptyMessage = 'No cancelled bookings';
          emptySubMessage = 'Your cancelled service bookings will appear here';
          break;
      }

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
              text: emptyMessage,
              color: AppColors.brandNeutral800,
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Medium(
              text: emptySubMessage,
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
      color: const Color(0xFF055c3a),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(AppSpacing.md),
        itemCount: bookings.length + (state.isLoadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == bookings.length) {
            return const Padding(
              padding: EdgeInsets.all(AppSpacing.md),
              child: Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF055c3a),
                ),
              ),
            );
          }

          final booking = bookings[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: BookingCardWidget(booking: booking),
          );
        },
      ),
    );
  }
}
