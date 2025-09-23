import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/services/phone_service.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/worker_entity.dart';
import '../../viewmodels/worker_state.dart';

class WorkerGridWidget extends StatefulWidget {
  final List<WorkerEntity> workers;
  final WorkerStatus status;
  final bool hasReachedMax;
  final String? errorMessage;
  final VoidCallback onLoadMore;
  final VoidCallback onRefresh;

  const WorkerGridWidget({
    super.key,
    required this.workers,
    required this.status,
    required this.hasReachedMax,
    this.errorMessage,
    required this.onLoadMore,
    required this.onRefresh,
  });

  @override
  State<WorkerGridWidget> createState() => _WorkerGridWidgetState();
}

class _WorkerGridWidgetState extends State<WorkerGridWidget> {
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
        widget.status != WorkerStatus.loadingMore) {
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
    if (widget.status == WorkerStatus.loading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (widget.status == WorkerStatus.failure) {
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
                text: widget.errorMessage ?? 'Failed to load workers',
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

    if (widget.workers.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.person_outline,
                size: 64,
                color: AppColors.brandNeutral400,
              ),
              const SizedBox(height: AppSpacing.md),
              H4Bold(
                text: 'No workers found',
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
        itemCount: widget.workers.length +
            (widget.status == WorkerStatus.loadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= widget.workers.length) {
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
              bottom: index == widget.workers.length - 1 ? 0 : AppSpacing.lg,
            ),
            child: _WorkerCard(
              worker: widget.workers[index],
              onTap: () {
                // Navigate to worker details page using GoRouter
                context.push('/workers/${widget.workers[index].id}');
              },
            ),
          );
        },
      ),
    );
  }
}

class _WorkerCard extends ConsumerWidget {
  final WorkerEntity worker;
  final VoidCallback? onTap;

  const _WorkerCard({required this.worker, this.onTap});

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
            // Header with profile picture and worker type
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                children: [
                  // Profile Picture
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.brandNeutral100,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: worker.profilePicture.isNotEmpty
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(24),
                            child: Image.network(
                              worker.profilePicture,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return _buildDefaultAvatar();
                              },
                            ),
                          )
                        : _buildDefaultAvatar(),
                  ),

                  const SizedBox(width: AppSpacing.sm),

                  // Worker name and type
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        H4Bold(
                          text: worker.name,
                          color: AppColors.brandNeutral900,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            worker.workerType == 'treesindia_worker'
                                ? SvgPicture.asset(
                                    'assets/logo/logo.svg',
                                    width: 14,
                                    height: 14,
                                  )
                                : const Icon(
                                    Icons.person_outline,
                                    size: 14,
                                    color: AppColors.brandNeutral500,
                                  ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: B3Regular(
                                text: worker.workerTypeDisplay,
                                color: AppColors.brandNeutral600,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Skills section
            if (worker.skills.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    B3Medium(
                      text: 'Key Skills',
                      color: AppColors.brandNeutral900,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    _buildSkillsChips(),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
            ],

            // Contact info and location
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Phone
                  if (worker.phone.isNotEmpty)
                    Row(
                      children: [
                        const Icon(
                          Icons.phone_outlined,
                          size: 16,
                          color: AppColors.brandNeutral500,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: B3Regular(
                            text: PhoneService.formatPhoneNumber(worker.phone),
                            color: AppColors.brandNeutral700,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),

                  const SizedBox(height: 4),

                  // Location
                  if (worker.cityState.isNotEmpty)
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 16,
                          color: AppColors.brandNeutral500,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: B3Regular(
                            text: worker.cityState,
                            color: AppColors.brandNeutral700,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),

                  const SizedBox(height: 4),

                  // Experience
                  Row(
                    children: [
                      const Icon(
                        Icons.work_outline,
                        size: 16,
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: B3Regular(
                          text: worker.experienceDisplay,
                          color: AppColors.brandNeutral700,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
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

  Widget _buildSkillsChips() {
    const maxVisibleChips = 3;
    final skills = worker.skills;
    final visibleSkills = skills.take(maxVisibleChips).toList();
    final remainingCount = skills.length - maxVisibleChips;

    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: [
        // Show first 3 skills as chips
        ...visibleSkills.map((skill) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.brandPrimary50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.brandPrimary200),
              ),
              child: Text(
                skill,
                style: const TextStyle(
                  color: AppColors.brandPrimary700,
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                ),
              ),
            )),
        // Show "+X more" if there are more than 3 skills
        if (remainingCount > 0)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral100,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.brandNeutral300),
            ),
            child: Text(
              '+$remainingCount more',
              style: const TextStyle(
                color: AppColors.brandNeutral600,
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final currentUserId = authState.token?.userId;
    final shouldShowChatButton =
        currentUserId != null && currentUserId != worker.userId.toString();

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          if (shouldShowChatButton) ...[
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  // TODO: Implement chat action
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Chat with ${worker.name}')),
                  );
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
              onPressed: () {
                // Navigate to worker details page
                context.push('/workers/${worker.id}');
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.brandNeutral700,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                side: const BorderSide(color: AppColors.brandNeutral300),
              ),
              icon: const Icon(Icons.person_outline, size: 18),
              label:
                  B3Medium(text: 'Profile', color: AppColors.brandNeutral700),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDefaultAvatar() {
    return const Center(
      child: Icon(
        Icons.person,
        color: AppColors.brandNeutral400,
        size: 24,
      ),
    );
  }
}
