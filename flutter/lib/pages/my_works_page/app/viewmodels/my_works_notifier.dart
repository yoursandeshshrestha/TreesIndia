import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/foundation.dart';
import '../../domain/entities/assignment_entity.dart';
import '../../domain/usecases/get_assignments_usecase.dart';
import '../../domain/usecases/accept_assignment_usecase.dart';
import '../../domain/usecases/reject_assignment_usecase.dart';
import '../../domain/usecases/start_work_usecase.dart';
import '../../domain/usecases/complete_work_usecase.dart';
import 'my_works_state.dart';

class MyWorksNotifier extends StateNotifier<MyWorksState> {
  final GetAssignmentsUsecase _getAssignmentsUsecase;
  final AcceptAssignmentUsecase _acceptAssignmentUsecase;
  final RejectAssignmentUsecase _rejectAssignmentUsecase;
  final StartWorkUsecase _startWorkUsecase;
  final CompleteWorkUsecase _completeWorkUsecase;
  Timer? _autoRefreshTimer;

  MyWorksNotifier({
    required GetAssignmentsUsecase getAssignmentsUsecase,
    required AcceptAssignmentUsecase acceptAssignmentUsecase,
    required RejectAssignmentUsecase rejectAssignmentUsecase,
    required StartWorkUsecase startWorkUsecase,
    required CompleteWorkUsecase completeWorkUsecase,
  })  : _getAssignmentsUsecase = getAssignmentsUsecase,
        _acceptAssignmentUsecase = acceptAssignmentUsecase,
        _rejectAssignmentUsecase = rejectAssignmentUsecase,
        _startWorkUsecase = startWorkUsecase,
        _completeWorkUsecase = completeWorkUsecase,
        super(const MyWorksState()) {
    _startAutoRefresh();
  }

  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (state.currentAssignments.isNotEmpty) {
        getAssignments(tab: state.currentTab, refresh: true);
      }
    });
  }

  /// Get assignments for a specific tab
  Future<void> getAssignments({
    AssignmentTab tab = AssignmentTab.all,
    int? page,
    bool refresh = false,
  }) async {
    try {
      final currentPage = page ?? state.currentTabPage;
      final isFirstPage = currentPage == 1;

      if (isFirstPage) {
        state = state.copyWith(
          status: MyWorksStatus.loading,
          isRefreshing: refresh,
          errorMessage: '',
        );
      } else {
        state = state.copyWith(isLoadingMore: true);
      }

      final response = await _getAssignmentsUsecase(
        tab: tab,
        page: currentPage,
        limit: 10,
      );

      final assignments = response.assignments;
      final hasMore = response.pagination.page < response.pagination.totalPages;

      _updateAssignmentsForTab(
        tab: tab,
        assignments: assignments,
        currentPage: currentPage,
        hasMore: hasMore,
        isFirstPage: isFirstPage,
      );

      state = state.copyWith(
        status: MyWorksStatus.success,
        isLoadingMore: false,
        isRefreshing: false,
      );
    } catch (e) {
      debugPrint('Error getting assignments: $e');
      state = state.copyWith(
        status: MyWorksStatus.failure,
        errorMessage: e.toString(),
        isLoadingMore: false,
        isRefreshing: false,
      );
    }
  }

  /// Switch to a different tab and load its data if needed
  Future<void> switchTab(AssignmentTab tab) async {
    if (state.currentTab == tab) return;

    state = state.copyWith(currentTab: tab);

    // Load data for the new tab if it's empty
    if (state.currentAssignments.isEmpty) {
      await getAssignments(tab: tab, page: 1);
    }
  }

  /// Load more assignments for the current tab
  Future<void> loadMoreAssignments() async {
    if (!state.currentTabHasMore || state.isLoadingMore) return;

    final nextPage = state.currentTabPage + 1;
    await getAssignments(tab: state.currentTab, page: nextPage);
  }

  /// Refresh assignments for the current tab
  Future<void> refresh() async {
    await getAssignments(tab: state.currentTab, page: 1, refresh: true);
  }

  /// Accept an assignment
  Future<void> acceptAssignment(int assignmentId, {String? notes}) async {
    try {
      state = state.copyWith(isAccepting: true);

      await _acceptAssignmentUsecase(
        assignmentId: assignmentId,
        notes: notes ?? 'Assignment accepted via mobile app',
      );

      // Refresh the current tab to show updated status
      await refresh();
    } catch (e) {
      debugPrint('Error accepting assignment: $e');
      state = state.copyWith(errorMessage: 'Failed to accept assignment: $e');
    } finally {
      state = state.copyWith(isAccepting: false);
    }
  }

  /// Reject an assignment
  Future<void> rejectAssignment(int assignmentId, String reason,
      {String? notes}) async {
    try {
      state = state.copyWith(isRejecting: true);

      await _rejectAssignmentUsecase(
        assignmentId: assignmentId,
        reason: reason,
        notes: notes ?? '',
      );

      // Refresh the current tab to show updated status
      await refresh();
    } catch (e) {
      debugPrint('Error rejecting assignment: $e');
      state = state.copyWith(errorMessage: 'Failed to reject assignment: $e');
    } finally {
      state = state.copyWith(isRejecting: false);
    }
  }

  /// Start work on an assignment
  Future<void> startWork(int assignmentId, {String? notes}) async {
    try {
      state = state.copyWith(isStarting: true);

      await _startWorkUsecase(
        assignmentId: assignmentId,
        notes: notes ?? 'Work started via mobile app',
      );

      // Refresh the current tab to show updated status
      await refresh();
    } catch (e) {
      debugPrint('Error starting work: $e');
      state = state.copyWith(errorMessage: 'Failed to start work: $e');
    } finally {
      state = state.copyWith(isStarting: false);
    }
  }

  /// Complete work on an assignment
  Future<void> completeWork(int assignmentId, {String? notes}) async {
    try {
      state = state.copyWith(isCompleting: true);

      await _completeWorkUsecase(
        assignmentId: assignmentId,
        notes: notes ?? 'Work completed via mobile app',
      );

      // Refresh the current tab to show updated status
      await refresh();
    } catch (e) {
      debugPrint('Error completing work: $e');
      state = state.copyWith(errorMessage: 'Failed to complete work: $e');
    } finally {
      state = state.copyWith(isCompleting: false);
    }
  }

  /// Update assignments for a specific tab
  void _updateAssignmentsForTab({
    required AssignmentTab tab,
    required List<AssignmentEntity> assignments,
    required int currentPage,
    required bool hasMore,
    required bool isFirstPage,
  }) {
    switch (tab) {
      case AssignmentTab.all:
        state = state.copyWith(
          allAssignments: isFirstPage
              ? assignments
              : [...state.allAssignments, ...assignments],
          allCurrentPage: currentPage,
          allHasMore: hasMore,
        );
        break;
      case AssignmentTab.assigned:
        state = state.copyWith(
          assignedAssignments: isFirstPage
              ? assignments
              : [...state.assignedAssignments, ...assignments],
          assignedCurrentPage: currentPage,
          assignedHasMore: hasMore,
        );
        break;
      case AssignmentTab.accepted:
        state = state.copyWith(
          acceptedAssignments: isFirstPage
              ? assignments
              : [...state.acceptedAssignments, ...assignments],
          acceptedCurrentPage: currentPage,
          acceptedHasMore: hasMore,
        );
        break;
      case AssignmentTab.inProgress:
        state = state.copyWith(
          inProgressAssignments: isFirstPage
              ? assignments
              : [...state.inProgressAssignments, ...assignments],
          inProgressCurrentPage: currentPage,
          inProgressHasMore: hasMore,
        );
        break;
      case AssignmentTab.completed:
        state = state.copyWith(
          completedAssignments: isFirstPage
              ? assignments
              : [...state.completedAssignments, ...assignments],
          completedCurrentPage: currentPage,
          completedHasMore: hasMore,
        );
        break;
    }
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }
}
