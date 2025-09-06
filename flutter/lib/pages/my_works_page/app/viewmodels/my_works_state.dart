import 'package:equatable/equatable.dart';
import '../../domain/entities/assignment_entity.dart';

enum MyWorksStatus { initial, loading, success, failure }

enum AssignmentTab { all, assigned, accepted, inProgress, completed }

class MyWorksState extends Equatable {
  final MyWorksStatus status;
  final AssignmentTab currentTab;

  // Separate assignment lists for each tab
  final List<AssignmentEntity> allAssignments;
  final List<AssignmentEntity> assignedAssignments;
  final List<AssignmentEntity> acceptedAssignments;
  final List<AssignmentEntity> inProgressAssignments;
  final List<AssignmentEntity> completedAssignments;

  // Pagination for each tab
  final int allCurrentPage;
  final int assignedCurrentPage;
  final int acceptedCurrentPage;
  final int inProgressCurrentPage;
  final int completedCurrentPage;

  final bool allHasMore;
  final bool assignedHasMore;
  final bool acceptedHasMore;
  final bool inProgressHasMore;
  final bool completedHasMore;

  final bool isLoadingMore;
  final bool isRefreshing;
  final bool isAccepting;
  final bool isRejecting;
  final bool isStarting;
  final bool isCompleting;
  final String errorMessage;

  const MyWorksState({
    this.status = MyWorksStatus.initial,
    this.currentTab = AssignmentTab.all,
    this.allAssignments = const [],
    this.assignedAssignments = const [],
    this.acceptedAssignments = const [],
    this.inProgressAssignments = const [],
    this.completedAssignments = const [],
    this.allCurrentPage = 1,
    this.assignedCurrentPage = 1,
    this.acceptedCurrentPage = 1,
    this.inProgressCurrentPage = 1,
    this.completedCurrentPage = 1,
    this.allHasMore = true,
    this.assignedHasMore = true,
    this.acceptedHasMore = true,
    this.inProgressHasMore = true,
    this.completedHasMore = true,
    this.isLoadingMore = false,
    this.isRefreshing = false,
    this.isAccepting = false,
    this.isRejecting = false,
    this.isStarting = false,
    this.isCompleting = false,
    this.errorMessage = '',
  });

  // Getter for current tab's assignments
  List<AssignmentEntity> get currentAssignments {
    switch (currentTab) {
      case AssignmentTab.all:
        return allAssignments;
      case AssignmentTab.assigned:
        return assignedAssignments;
      case AssignmentTab.accepted:
        return acceptedAssignments;
      case AssignmentTab.inProgress:
        return inProgressAssignments;
      case AssignmentTab.completed:
        return completedAssignments;
    }
  }

  // Getter for current tab's page
  int get currentTabPage {
    switch (currentTab) {
      case AssignmentTab.all:
        return allCurrentPage;
      case AssignmentTab.assigned:
        return assignedCurrentPage;
      case AssignmentTab.accepted:
        return acceptedCurrentPage;
      case AssignmentTab.inProgress:
        return inProgressCurrentPage;
      case AssignmentTab.completed:
        return completedCurrentPage;
    }
  }

  // Getter for current tab's hasMore
  bool get currentTabHasMore {
    switch (currentTab) {
      case AssignmentTab.all:
        return allHasMore;
      case AssignmentTab.assigned:
        return assignedHasMore;
      case AssignmentTab.accepted:
        return acceptedHasMore;
      case AssignmentTab.inProgress:
        return inProgressHasMore;
      case AssignmentTab.completed:
        return completedHasMore;
    }
  }

  MyWorksState copyWith({
    MyWorksStatus? status,
    AssignmentTab? currentTab,
    List<AssignmentEntity>? allAssignments,
    List<AssignmentEntity>? assignedAssignments,
    List<AssignmentEntity>? acceptedAssignments,
    List<AssignmentEntity>? inProgressAssignments,
    List<AssignmentEntity>? completedAssignments,
    int? allCurrentPage,
    int? assignedCurrentPage,
    int? acceptedCurrentPage,
    int? inProgressCurrentPage,
    int? completedCurrentPage,
    bool? allHasMore,
    bool? assignedHasMore,
    bool? acceptedHasMore,
    bool? inProgressHasMore,
    bool? completedHasMore,
    bool? isLoadingMore,
    bool? isRefreshing,
    bool? isAccepting,
    bool? isRejecting,
    bool? isStarting,
    bool? isCompleting,
    String? errorMessage,
  }) {
    return MyWorksState(
      status: status ?? this.status,
      currentTab: currentTab ?? this.currentTab,
      allAssignments: allAssignments ?? this.allAssignments,
      assignedAssignments: assignedAssignments ?? this.assignedAssignments,
      acceptedAssignments: acceptedAssignments ?? this.acceptedAssignments,
      inProgressAssignments: inProgressAssignments ?? this.inProgressAssignments,
      completedAssignments: completedAssignments ?? this.completedAssignments,
      allCurrentPage: allCurrentPage ?? this.allCurrentPage,
      assignedCurrentPage: assignedCurrentPage ?? this.assignedCurrentPage,
      acceptedCurrentPage: acceptedCurrentPage ?? this.acceptedCurrentPage,
      inProgressCurrentPage: inProgressCurrentPage ?? this.inProgressCurrentPage,
      completedCurrentPage: completedCurrentPage ?? this.completedCurrentPage,
      allHasMore: allHasMore ?? this.allHasMore,
      assignedHasMore: assignedHasMore ?? this.assignedHasMore,
      acceptedHasMore: acceptedHasMore ?? this.acceptedHasMore,
      inProgressHasMore: inProgressHasMore ?? this.inProgressHasMore,
      completedHasMore: completedHasMore ?? this.completedHasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isAccepting: isAccepting ?? this.isAccepting,
      isRejecting: isRejecting ?? this.isRejecting,
      isStarting: isStarting ?? this.isStarting,
      isCompleting: isCompleting ?? this.isCompleting,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        currentTab,
        allAssignments,
        assignedAssignments,
        acceptedAssignments,
        inProgressAssignments,
        completedAssignments,
        allCurrentPage,
        assignedCurrentPage,
        acceptedCurrentPage,
        inProgressCurrentPage,
        completedCurrentPage,
        allHasMore,
        assignedHasMore,
        acceptedHasMore,
        inProgressHasMore,
        completedHasMore,
        isLoadingMore,
        isRefreshing,
        isAccepting,
        isRejecting,
        isStarting,
        isCompleting,
        errorMessage,
      ];
}