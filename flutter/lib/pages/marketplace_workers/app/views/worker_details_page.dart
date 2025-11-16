import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/services/phone_service.dart';
import 'package:trees_india/pages/chats_page/app/providers/conversation_usecase_providers.dart';

import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../domain/entities/worker_entity.dart';
import '../providers/worker_providers.dart';
import '../viewmodels/worker_details_state.dart';

class WorkerDetailsPage extends ConsumerWidget {
  final String workerId;

  const WorkerDetailsPage({super.key, required this.workerId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final workerDetailsState = ref.watch(workerDetailsNotifierProvider);


    ref.listen<WorkerDetailsState>(workerDetailsNotifierProvider,
        (previous, next) {
      if (next.status == WorkerDetailsStatus.failure &&
          next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    // Fetch worker details when the page loads or when workerId changes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Always fetch worker details for the requested workerId
      // Check if we're showing a different worker or no worker at all
      final currentWorkerId = workerDetailsState.worker?.id.toString();
      if (currentWorkerId != workerId ||
          workerDetailsState.status == WorkerDetailsStatus.initial) {
        ref
            .read(workerDetailsNotifierProvider.notifier)
            .getWorkerDetails(workerId);
      }
    });

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        ref.invalidate(workerDetailsNotifierProvider);
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: H3Bold(
            text: 'Worker Details',
            color: AppColors.brandNeutral900,
          ),
          leading: IconButton(
            icon:
                const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: _buildBody(context, ref, workerDetailsState),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    WidgetRef ref,
    WorkerDetailsState state,
  ) {
    switch (state.status) {
      case WorkerDetailsStatus.loading:
        return const Center(child: CircularProgressIndicator());

      case WorkerDetailsStatus.failure:
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
                  text: state.errorMessage ?? 'Failed to load worker details',
                  color: AppColors.brandNeutral600,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.lg),
                ElevatedButton(
                  onPressed: () {
                    ref
                        .read(workerDetailsNotifierProvider.notifier)
                        .getWorkerDetails(workerId);
                  },
                  child: const Text('Try Again'),
                ),
              ],
            ),
          ),
        );

      case WorkerDetailsStatus.success:
        if (state.worker == null) {
          return const Center(
            child: Text('Worker not found'),
          );
        }
        return _buildWorkerDetails(context, ref, state.worker!);

      case WorkerDetailsStatus.initial:
      return const SizedBox.shrink();
    }
  }

  Widget _buildWorkerDetails(
    BuildContext context,
    WidgetRef ref,
    WorkerEntity worker,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Section
          _buildHeaderSection(worker),
          const SizedBox(height: AppSpacing.xl),

          // Contact Information
          _buildContactSection(worker),
          const SizedBox(height: AppSpacing.xl),

          // Skills Section
          if (worker.skills.isNotEmpty) ...[
            _buildSkillsSection(worker),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Experience Section
          _buildExperienceSection(worker),
          const SizedBox(height: AppSpacing.xl),

          // Action Buttons
          _buildActionButtons(context, ref, worker),
        ],
      ),
    );
  }

  Widget _buildHeaderSection(WorkerEntity worker) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
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
        children: [
          // Profile Picture
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral100,
              borderRadius: BorderRadius.circular(40),
            ),
            child: worker.profilePicture.isNotEmpty
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(40),
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

          const SizedBox(height: AppSpacing.md),

          // Name
          H2Bold(
            text: worker.name,
            color: AppColors.brandNeutral900,
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: AppSpacing.xs),

          // Worker Type

          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                  color: worker.workerType == 'treesindia_worker'
                      ? AppColors.stateGreen600
                      : AppColors.brandNeutral700),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                worker.workerType == 'treesindia_worker'
                    ? Image.asset(
                        'assets/logo/logo.png',
                        width: 16,
                        height: 16,
                      )
                    : const Icon(
                        Icons.person_outline,
                        size: 16,
                        color: AppColors.brandNeutral500,
                      ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  worker.workerTypeDisplay,
                  style: TextStyle(
                    color: worker.workerType == 'treesindia_worker'
                        ? AppColors.stateGreen600
                        : AppColors.brandNeutral700,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.sm),

          // Location
          if (worker.cityState.isNotEmpty)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.location_on_outlined,
                  size: 16,
                  color: AppColors.brandNeutral500,
                ),
                const SizedBox(width: 4),
                B2Regular(
                  text: worker.cityState,
                  color: AppColors.brandNeutral600,
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildContactSection(WorkerEntity worker) {
    return _buildSection(
      title: 'Contact Information',
      child: Column(
        children: [
          if (worker.phone.isNotEmpty)
            _buildContactItem(
              icon: Icons.phone_outlined,
              label: 'Phone',
              value: PhoneService.formatPhoneNumber(worker.phone),
            ),
          if (worker.alternativeNumber.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            _buildContactItem(
              icon: Icons.phone_outlined,
              label: 'Alternative Phone',
              value: PhoneService.formatPhoneNumber(worker.alternativeNumber),
            ),
          ],
          if (worker.email.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            _buildContactItem(
              icon: Icons.email_outlined,
              label: 'Email',
              value: worker.email,
            ),
          ],
          if (worker.fullAddress.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            _buildContactItem(
              icon: Icons.location_on_outlined,
              label: 'Address',
              value: worker.fullAddress,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSkillsSection(WorkerEntity worker) {
    return _buildSection(
      title: 'Skills',
      child: Wrap(
        spacing: AppSpacing.sm,
        runSpacing: AppSpacing.sm,
        children: worker.skills
            .map((skill) => Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.brandPrimary200),
                  ),
                  child: B3Medium(
                    text: skill,
                    color: AppColors.brandPrimary700,
                  ),
                ))
            .toList(),
      ),
    );
  }

  Widget _buildExperienceSection(WorkerEntity worker) {
    return _buildSection(
      title: 'Experience',
      child: Column(
        children: [
          _buildInfoItem(
            icon: Icons.work_outline,
            label: 'Experience',
            value: worker.experienceDisplay,
          ),
          const SizedBox(height: AppSpacing.md),
          _buildInfoItem(
            icon: Icons.star_outline,
            label: 'Rating',
            value: worker.rating > 0
                ? '${worker.rating.toStringAsFixed(1)} ⭐'
                : 'No ratings yet',
          ),
          const SizedBox(height: AppSpacing.md),
          _buildInfoItem(
            icon: Icons.assignment_outlined,
            label: 'Total Jobs',
            value: '${worker.totalJobs}',
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
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
          H4Bold(
            text: title,
            color: AppColors.brandNeutral900,
          ),
          const SizedBox(height: AppSpacing.md),
          child,
        ],
      ),
    );
  }

  Widget _buildContactItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: AppColors.brandNeutral500,
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              B3Medium(
                text: label,
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: 2),
              B3Regular(
                text: value,
                color: AppColors.brandNeutral600,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: AppColors.brandNeutral500,
        ),
        const SizedBox(width: AppSpacing.sm),
        B3Medium(
          text: '$label: ',
          color: AppColors.brandNeutral900,
        ),
        Expanded(
          child: B3Regular(
            text: value,
            color: AppColors.brandNeutral600,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(
    BuildContext context,
    WidgetRef ref,
    WorkerEntity worker,
  ) {
    final authState = ref.watch(authProvider);
    final currentUserId = authState.token?.userId;
    final shouldShowChatButton =
        currentUserId != null && currentUserId != worker.userId.toString();

    return Row(
      children: [
        if (shouldShowChatButton) ...[
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () async {
                await _createConversationAndNavigate(context, ref, worker);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.stateGreen600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              icon: const Icon(Icons.chat_bubble_outline, size: 20),
              label: B2Medium(text: 'Chat', color: Colors.white),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
        ],
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () async {
              if (worker.phone.isNotEmpty) {
                final bool callInitiated = await PhoneService.makePhoneCall(
                  worker.phone,
                );

                if (context.mounted) {
                  String message;
                  Color backgroundColor;

                  if (callInitiated) {
                    message = 'Calling ${worker.name}...';
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
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              side: const BorderSide(color: AppColors.brandNeutral300),
            ),
            icon: const Icon(Icons.phone_outlined, size: 20),
            label: B2Medium(text: 'Call', color: AppColors.brandNeutral700),
          ),
        ),
      ],
    );
  }

  Widget _buildDefaultAvatar() {
    return const Center(
      child: Icon(
        Icons.person,
        color: AppColors.brandNeutral400,
        size: 40,
      ),
    );
  }

  Future<void> _createConversationAndNavigate(
    BuildContext context,
    WidgetRef ref,
    WorkerEntity worker,
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
        user2: worker.userId,
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
