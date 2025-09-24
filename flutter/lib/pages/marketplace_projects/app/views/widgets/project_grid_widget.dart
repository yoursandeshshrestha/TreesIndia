import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/services/phone_service.dart';
import 'package:trees_india/pages/chats_page/app/providers/conversation_usecase_providers.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/project_entity.dart';
import '../../viewmodels/project_state.dart';
import '../project_details_page.dart';

class ProjectGridWidget extends StatefulWidget {
  final List<ProjectEntity> projects;
  final ProjectStatus status;
  final bool hasReachedMax;
  final String? errorMessage;
  final VoidCallback onLoadMore;
  final VoidCallback onRefresh;

  const ProjectGridWidget({
    super.key,
    required this.projects,
    required this.status,
    required this.hasReachedMax,
    this.errorMessage,
    required this.onLoadMore,
    required this.onRefresh,
  });

  @override
  State<ProjectGridWidget> createState() => _ProjectGridWidgetState();
}

class _ProjectGridWidgetState extends State<ProjectGridWidget> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom &&
        !widget.hasReachedMax &&
        widget.status != ProjectStatus.loadingMore) {
      widget.onLoadMore();
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.status == ProjectStatus.loading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (widget.status == ProjectStatus.failure) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.stateRed600,
              ),
              const SizedBox(height: AppSpacing.md),
              H4Bold(
                text: 'Something went wrong',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),
              B2Regular(
                text: widget.errorMessage ?? 'Failed to load projects',
                color: AppColors.brandNeutral600,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.lg),
              ElevatedButton(
                onPressed: widget.onRefresh,
                child: const Text('Try Again'),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.projects.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.apartment_outlined,
                size: 64,
                color: AppColors.brandNeutral400,
              ),
              const SizedBox(height: AppSpacing.md),
              H4Bold(
                text: 'No projects found',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),
              B2Regular(
                text: 'Try adjusting your filters to see more results',
                color: AppColors.brandNeutral600,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => widget.onRefresh(),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(AppSpacing.lg),
        itemCount: widget.projects.length +
            (widget.status == ProjectStatus.loadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= widget.projects.length) {
            // Loading indicator
            return const Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }

          return Padding(
            padding: EdgeInsets.only(
              bottom: index == widget.projects.length - 1 ? 0 : AppSpacing.lg,
            ),
            child: _ProjectCard(
              project: widget.projects[index],
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => ProjectDetailsPage(
                      projectId: widget.projects[index].id.toString(),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _ProjectCard extends ConsumerWidget {
  final ProjectEntity project;
  final VoidCallback? onTap;

  const _ProjectCard({required this.project, this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.brandNeutral200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              offset: const Offset(0, 2),
              blurRadius: 8,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Project image
            if (project.images.isNotEmpty) ...[
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12),
                  ),
                  image: DecorationImage(
                    image: NetworkImage(project.images.first),
                    fit: BoxFit.cover,
                    onError: (exception, stackTrace) {},
                  ),
                ),
                child: Stack(
                  children: [
                    // Status badge
                    Positioned(
                      top: AppSpacing.sm,
                      right: AppSpacing.sm,
                      child: _buildStatusBadge(),
                    ),
                  ],
                ),
              ),
            ] else ...[
              Container(
                height: 200,
                width: double.infinity,
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12),
                  ),
                  color: AppColors.brandNeutral100,
                ),
                child: Stack(
                  children: [
                    const Center(
                      child: Icon(
                        Icons.apartment_outlined,
                        size: 48,
                        color: AppColors.brandNeutral400,
                      ),
                    ),
                    // Status badge
                    Positioned(
                      top: AppSpacing.sm,
                      right: AppSpacing.sm,
                      child: _buildStatusBadge(),
                    ),
                  ],
                ),
              ),
            ],

            // Project info
            Padding(
              padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md, AppSpacing.md, AppSpacing.md, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and project type
                  Row(
                    children: [
                      Expanded(
                        child: H4Bold(
                          text: project.title,
                          color: AppColors.brandNeutral900,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      _buildProjectTypeBadge(),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.sm),

                  // Description
                  B3Regular(
                    text: project.description,
                    color: AppColors.brandNeutral600,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: AppSpacing.md),

                  // Location and duration
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 16,
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: B3Regular(
                          text: project.formattedLocation,
                          color: AppColors.brandNeutral700,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      const Icon(
                        Icons.schedule_outlined,
                        size: 16,
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(width: 4),
                      B3Regular(
                        text: project.formattedDuration,
                        color: AppColors.brandNeutral700,
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.sm),

                  // Posted by
                  B3Regular(
                    text: 'Posted on ${project.formattedCreatedAt}',
                    color: AppColors.brandNeutral500,
                  ),
                ],
              ),
            ),

            // Action buttons
            _buildActionButtons(context, ref),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge() {
    Color backgroundColor;
    Color textColor;

    switch (project.status.toLowerCase()) {
      case 'starting_soon':
        backgroundColor = AppColors.accentIndigo50;
        textColor = AppColors.accentIndigo700;
        break;
      case 'on_going':
        backgroundColor = AppColors.stateGreen50;
        textColor = AppColors.stateGreen700;
        break;
      case 'completed':
        backgroundColor = AppColors.brandNeutral100;
        textColor = AppColors.brandNeutral700;
        break;
      case 'on_hold':
        backgroundColor = AppColors.stateYellow50;
        textColor = AppColors.stateYellow700;
        break;
      case 'cancelled':
        backgroundColor = AppColors.stateRed50;
        textColor = AppColors.stateRed700;
        break;
      default:
        backgroundColor = AppColors.brandNeutral100;
        textColor = AppColors.brandNeutral700;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: textColor.withValues(alpha: 0.2)),
      ),
      child: Text(
        project.formattedStatus,
        style: TextStyle(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildProjectTypeBadge() {
    Color backgroundColor;
    Color textColor;

    switch (project.projectType.toLowerCase()) {
      case 'residential':
        backgroundColor = AppColors.stateGreen50;
        textColor = AppColors.stateGreen700;
        break;
      case 'commercial':
        backgroundColor = AppColors.accentIndigo50;
        textColor = AppColors.accentIndigo700;
        break;
      case 'infrastructure':
        backgroundColor = AppColors.brandPrimary50;
        textColor = AppColors.brandPrimary700;
        break;
      default:
        backgroundColor = AppColors.brandNeutral100;
        textColor = AppColors.brandNeutral700;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: textColor.withValues(alpha: 0.2)),
      ),
      child: Text(
        project.formattedProjectType,
        style: TextStyle(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final currentUserId = authState.token?.userId;
    final shouldShowChatButton =
        currentUserId != null && currentUserId != project.userId.toString();

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          if (shouldShowChatButton) ...[
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () async {
                  await _createConversationAndNavigate(context, ref, project);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.stateGreen600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                icon: const Icon(Icons.chat_bubble_outline, size: 18),
                label: B3Medium(text: 'Chat', color: Colors.white),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
          ],
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () async {
                if (project.contactPersonPhone.isNotEmpty) {
                  final bool callInitiated = await PhoneService.makePhoneCall(
                    project.contactPersonPhone,
                  );

                  if (context.mounted) {
                    String message;
                    Color backgroundColor;

                    if (callInitiated) {
                      message = 'Calling ${project.contactPersonName}...';
                      backgroundColor = Colors.green;
                    } else {
                      message =
                          'Unable to make phone call. This feature requires a real device with phone capability.';
                      backgroundColor = Colors.orange;
                    }

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(message),
                        backgroundColor: backgroundColor,
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  }
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Phone number not available'),
                      backgroundColor: Colors.orange,
                    ),
                  );
                }
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.brandNeutral700,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                side: const BorderSide(color: AppColors.brandNeutral300),
              ),
              icon: const Icon(Icons.phone_outlined, size: 18),
              label: B3Medium(text: 'Call', color: AppColors.brandNeutral700),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _createConversationAndNavigate(
    BuildContext context,
    WidgetRef ref,
    ProjectEntity project,
  ) async {
    try {
      // Show loading indicator
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Creating conversation...'),
          duration: Duration(seconds: 1),
        ),
      );

      // Get current user ID from auth state
      final authState = ref.read(authProvider);
      final currentUserId = authState.token?.userId;

      if (currentUserId == null) {
        throw Exception('User not logged in');
      }

      // Create conversation using the use case
      final createConversationUseCase =
          ref.read(createConversationUseCaseProvider);
      final conversation = await createConversationUseCase.execute(
        user1: int.parse(currentUserId),
        user2: project.userId,
      );

      // Navigate to chat room page with the conversation ID
      if (context.mounted) {
        context.push('/conversations/${conversation.id}');
      }
    } catch (e) {
      // Show error message
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create conversation: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }
}
