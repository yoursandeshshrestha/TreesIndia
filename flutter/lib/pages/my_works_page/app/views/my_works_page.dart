import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/commons/theming/text_styles.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/components/main_layout/app/views/main_layout_widget.dart';
import '../providers/my_works_providers.dart';
import '../viewmodels/my_works_state.dart';
import '../viewmodels/my_works_notifier.dart';
import 'widgets/assignment_card_widget.dart';

class MyWorksPage extends ConsumerStatefulWidget {
  const MyWorksPage({super.key});

  @override
  ConsumerState<MyWorksPage> createState() => _MyWorksPageState();
}

class _MyWorksPageState extends ConsumerState<MyWorksPage>
    with TickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  late TabController _tabController;
  late MyWorksNotifier _notifier;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _notifier = ref.read(myWorksNotifierProvider.notifier);
      _notifier.getAssignments(
        tab: AssignmentTab.all,
        page: 1,
      );
      _notifier.startAutoRefresh();
    });

    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        final tab = _getTabFromIndex(_tabController.index);
        ref.read(myWorksNotifierProvider.notifier).switchTab(tab);
      }
    });

    _scrollController.addListener(() {
      if (_scrollController.position.pixels ==
          _scrollController.position.maxScrollExtent) {
        ref.read(myWorksNotifierProvider.notifier).loadMoreAssignments();
      }
    });
  }

  AssignmentTab _getTabFromIndex(int index) {
    switch (index) {
      case 0:
        return AssignmentTab.all;
      case 1:
        return AssignmentTab.assigned;
      case 2:
        return AssignmentTab.accepted;
      case 3:
        return AssignmentTab.inProgress;
      case 4:
        return AssignmentTab.completed;
      default:
        return AssignmentTab.all;
    }
  }

  int _getIndexFromTab(AssignmentTab tab) {
    switch (tab) {
      case AssignmentTab.all:
        return 0;
      case AssignmentTab.assigned:
        return 1;
      case AssignmentTab.accepted:
        return 2;
      case AssignmentTab.inProgress:
        return 3;
      case AssignmentTab.completed:
        return 4;
    }
  }

  @override
  void dispose() {
    _notifier.stopAutoRefresh();
    _scrollController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final myWorksState = ref.watch(myWorksNotifierProvider);
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
    if (_tabController.index != _getIndexFromTab(myWorksState.currentTab)) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _tabController.animateTo(_getIndexFromTab(myWorksState.currentTab));
      });
    }

    return MainLayoutWidget(
      currentIndex: 1,
      child: Scaffold(
        backgroundColor: AppColors.brandNeutral50,
        appBar: AppBar(
          title: H3Bold(
            text: 'My Work',
            color: AppColors.brandNeutral800,
          ),
          backgroundColor: AppColors.brandNeutral50,
          elevation: 0,
          automaticallyImplyLeading: false,
          actions: [
            IconButton(
              icon: myWorksState.isRefreshing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Color(0xFF055c3a),
                      ),
                    )
                  : const Icon(Icons.refresh, color: AppColors.brandNeutral800),
              onPressed: myWorksState.isRefreshing
                  ? null
                  : () => ref.read(myWorksNotifierProvider.notifier).refresh(),
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
            isScrollable: true,
            tabs: const [
              Tab(text: 'All'),
              Tab(text: 'Assigned'),
              Tab(text: 'Accepted'),
              Tab(text: 'In Progress'),
              Tab(text: 'Completed'),
            ],
          ),
        ),
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildTabContent(myWorksState, AssignmentTab.all),
            _buildTabContent(myWorksState, AssignmentTab.assigned),
            _buildTabContent(myWorksState, AssignmentTab.accepted),
            _buildTabContent(myWorksState, AssignmentTab.inProgress),
            _buildTabContent(myWorksState, AssignmentTab.completed),
          ],
        ),
      ),
    );
  }

  Widget _buildTabContent(MyWorksState state, AssignmentTab tab) {
    // Check if this tab is currently active
    if (state.currentTab != tab) {
      return const SizedBox.shrink();
    }

    final assignments = state.currentAssignments;

    if (state.status == MyWorksStatus.loading && assignments.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(
          color: Color(0xFF055c3a),
        ),
      );
    }

    if (state.status == MyWorksStatus.failure && assignments.isEmpty) {
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
              text: 'Error loading assignments',
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
                  .read(myWorksNotifierProvider.notifier)
                  .getAssignments(tab: tab),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (assignments.isEmpty) {
      String emptyMessage;
      String emptySubMessage;

      switch (tab) {
        case AssignmentTab.all:
          emptyMessage = 'No assignments yet';
          emptySubMessage = 'Your work assignments will appear here';
          break;
        case AssignmentTab.assigned:
          emptyMessage = 'No assigned work';
          emptySubMessage = 'New assignments will appear here';
          break;
        case AssignmentTab.accepted:
          emptyMessage = 'No accepted work';
          emptySubMessage = 'Accepted assignments will appear here';
          break;
        case AssignmentTab.inProgress:
          emptyMessage = 'No work in progress';
          emptySubMessage = 'Active assignments will appear here';
          break;
        case AssignmentTab.completed:
          emptyMessage = 'No completed work';
          emptySubMessage = 'Completed assignments will appear here';
          break;
      }

      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.work_outline,
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
        ref.read(myWorksNotifierProvider.notifier).refresh();
      },
      color: const Color(0xFF055c3a),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(AppSpacing.md),
        itemCount: assignments.length + (state.isLoadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == assignments.length) {
            return const Padding(
              padding: EdgeInsets.all(AppSpacing.md),
              child: Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF055c3a),
                ),
              ),
            );
          }

          final assignment = assignments[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: AssignmentCardWidget(assignment: assignment),
          );
        },
      ),
    );
  }
}
