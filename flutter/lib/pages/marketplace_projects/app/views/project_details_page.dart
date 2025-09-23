import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/services/phone_service.dart';
import 'package:trees_india/pages/chats_page/app/providers/conversation_usecase_providers.dart';

import '../../domain/entities/project_entity.dart';
import '../providers/project_providers.dart';
import '../viewmodels/project_details_state.dart';
import 'widgets/project_image_carousel.dart';

class ProjectDetailsPage extends ConsumerStatefulWidget {
  final String projectId;
  const ProjectDetailsPage({super.key, required this.projectId});

  @override
  ConsumerState<ProjectDetailsPage> createState() => _ProjectDetailsPageState();
}

class _ProjectDetailsPageState extends ConsumerState<ProjectDetailsPage> {
  @override
  void initState() {
    super.initState();
    // Load project details only once when the widget is first created
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadProjectDetailsIfNeeded();
    });
  }

  void _loadProjectDetailsIfNeeded() {
    final projectDetailsState = ref.read(projectDetailsNotifierProvider);
    final currentId = projectDetailsState.project?.id.toString();

    // Only load if:
    // 1. We don't have any project data yet (initial state)
    // 2. The current project ID doesn't match the requested one
    // 3. The current state is failure (to allow retry)
    // Don't load if we're already loading or already have the correct project data
    final shouldLoad =
        (projectDetailsState.status == ProjectDetailsStatus.initial) ||
            (currentId != widget.projectId &&
                projectDetailsState.status != ProjectDetailsStatus.loading) ||
            (projectDetailsState.status == ProjectDetailsStatus.failure);

    if (shouldLoad) {
      ref
          .read(projectDetailsNotifierProvider.notifier)
          .loadProjectDetails(widget.projectId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final projectDetailsState = ref.watch(projectDetailsNotifierProvider);

    ref.listen<ProjectDetailsState>(projectDetailsNotifierProvider,
        (previous, next) {
      if (next.status == ProjectDetailsStatus.failure &&
          next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: H3Bold(
          text: projectDetailsState.project?.title ?? 'Project Details',
          color: AppColors.brandNeutral900,
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _buildBody(projectDetailsState, ref),
    );
  }

  Widget _buildBody(ProjectDetailsState state, WidgetRef ref) {
    switch (state.status) {
      case ProjectDetailsStatus.loading:
        return const Center(
          child: CircularProgressIndicator(
            color: AppColors.brandPrimary500,
          ),
        );
      case ProjectDetailsStatus.success:
        return state.project != null
            ? _buildProjectDetailsBody(state.project!, ref)
            : const Center(child: Text('No project data available'));
      case ProjectDetailsStatus.failure:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.error,
              ),
              const SizedBox(height: AppSpacing.lg),
              H3Bold(
                text: 'Error Loading Project',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),
              B2Regular(
                text: state.errorMessage ?? 'Unknown error occurred',
                color: AppColors.brandNeutral600,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildProjectDetailsBody(ProjectEntity project, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Address
                  _buildHeaderSection(project),

                  const SizedBox(height: AppSpacing.lg),

                  // Image Carousel
                  _buildImageCarousel(project),

                  const SizedBox(height: AppSpacing.lg),

                  // Project Information Section
                  _buildProjectInfoSection(project),

                  const SizedBox(height: AppSpacing.lg),

                  // Project Details
                  _buildProjectDetails(project),

                  const SizedBox(height: AppSpacing.lg),

                  // Location Card
                  _buildLocationCard(project),

                  const SizedBox(height: AppSpacing.lg),

                  // Description (if available)
                  if (project.description.isNotEmpty)
                    _buildDescriptionSection(project),

                  const SizedBox(height: AppSpacing.lg),

                  // Contact Section
                  _buildContactSection(project),

                  const SizedBox(height: AppSpacing.lg),

                  // Additional Information
                  _buildAdditionalInformationSection(project),

                  const SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderSection(ProjectEntity project) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H1Medium(
          text: project.title,
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        if (project.address.isNotEmpty)
          Row(
            children: [
              const Icon(
                Icons.location_on,
                size: 16,
                color: AppColors.brandNeutral500,
              ),
              const SizedBox(width: AppSpacing.xs),
              Expanded(
                child: Text(
                  project.address,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.brandNeutral600,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildImageCarousel(ProjectEntity project) {
    if (project.images.isEmpty) {
      return Container(
        height: 250,
        width: double.infinity,
        decoration: BoxDecoration(
          color: AppColors.brandNeutral100,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.apartment_outlined,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            SizedBox(height: AppSpacing.md),
            Text(
              'No Images Available',
              style: TextStyle(
                color: AppColors.brandNeutral500,
                fontSize: 16,
              ),
            ),
          ],
        ),
      );
    }

    return ProjectImageCarousel(images: project.images);
  }

  Widget _buildProjectInfoSection(ProjectEntity project) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Row(
            children: [
              Icon(
                Icons.info_outline,
                size: 20,
                color: _getProjectTypeColor(project.projectType),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Project Information',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.brandNeutral900,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Project Type and Status
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    B3Medium(
                      text: 'Project Type',
                      color: AppColors.brandNeutral600,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: _getProjectTypeColor(project.projectType)
                            .withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: _getProjectTypeColor(project.projectType)
                              .withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        project.formattedProjectType,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: _getProjectTypeColor(project.projectType),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    B3Medium(
                      text: 'Status',
                      color: AppColors.brandNeutral600,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(project.status).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color:
                              _getStatusColor(project.status).withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        project.formattedStatus,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: _getStatusColor(project.status),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Duration
          _buildProjectInfoRow(
              'Estimated Duration:', project.formattedDuration),
        ],
      ),
    );
  }

  Widget _buildProjectInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 4,
            decoration: const BoxDecoration(
              color: AppColors.brandNeutral400,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            '$label $value',
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.brandNeutral700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProjectDetails(ProjectEntity project) {
    final details = [
      _DetailItem('Project Type', project.formattedProjectType,
          Icons.business_outlined),
      _DetailItem('Status', project.formattedStatus, Icons.schedule_outlined),
      _DetailItem('Duration', project.formattedDuration, Icons.timer_outlined),
      _DetailItem(
          'Location', project.formattedLocation, Icons.location_on_outlined),
      if (project.pincode.isNotEmpty)
        _DetailItem('Pincode', project.pincode, Icons.pin_drop_outlined),
      if (project.uploadedByAdmin)
        _DetailItem(
            'Verified Project', 'Admin Verified', Icons.verified_outlined),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Project Details',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.brandNeutral900,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        ...details.map((detail) => _buildDetailRow(detail)),
      ],
    );
  }

  Widget _buildDetailRow(_DetailItem detail) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              detail.icon,
              size: 20,
              color: AppColors.brandNeutral600,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  detail.label,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.brandNeutral500,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs / 2),
                Text(
                  detail.value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.brandNeutral800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationCard(ProjectEntity project) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          const Row(
            children: [
              Icon(
                Icons.location_on_outlined,
                size: 20,
                color: AppColors.stateGreen600,
              ),
              SizedBox(width: AppSpacing.sm),
              Text(
                'Location',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.brandNeutral900,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Location Information
          if (project.address.isNotEmpty)
            _buildLocationInfoRow('Address:', project.address),

          if (project.city.isNotEmpty)
            _buildLocationInfoRow('City:', project.city),

          if (project.state.isNotEmpty)
            _buildLocationInfoRow('State:', project.state),

          if (project.pincode.isNotEmpty)
            _buildLocationInfoRow('Pincode:', project.pincode),
        ],
      ),
    );
  }

  Widget _buildLocationInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.brandNeutral600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDescriptionSection(ProjectEntity project) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Description',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.brandNeutral900,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.brandNeutral50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.brandNeutral200),
          ),
          child: Text(
            project.description,
            style: const TextStyle(
              fontSize: 15,
              color: AppColors.brandNeutral700,
              height: 1.5,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildContactSection(ProjectEntity project) {
    final authState = ref.watch(authProvider);
    final currentUserId = authState.token?.userId;
    final shouldShowChatButton =
        currentUserId != null && currentUserId != project.userId.toString();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          const Row(
            children: [
              Icon(
                Icons.person_outline,
                size: 20,
                color: AppColors.brandNeutral700,
              ),
              SizedBox(width: AppSpacing.sm),
              Text(
                'Contact',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.brandNeutral900,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Contact Person Name
          if (project.contactPersonName.isNotEmpty) ...[
            Text(
              'Contact Person: ${project.contactPersonName}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: AppColors.brandNeutral800,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
          ],

          // Posted By
          if (project.userDisplayName.isNotEmpty) ...[
            Text(
              'Posted by: ${project.userDisplayName}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: AppColors.brandNeutral800,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],

          // Call Button
          if (project.contactPersonPhone.isNotEmpty)
            SizedBox(
              width: double.infinity,
              child: Builder(
                builder: (context) => ElevatedButton.icon(
                  onPressed: () async {
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
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.stateGreen600,
                    foregroundColor: AppColors.white,
                    padding:
                        const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  icon: const Icon(Icons.phone, size: 18),
                  label: Text(
                    'Call ${project.contactPersonPhone}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          if (shouldShowChatButton) ...[
            const SizedBox(height: AppSpacing.sm),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await _createConversationAndNavigate(context, ref, project);
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.stateGreen600,
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                icon: const Icon(Icons.chat_bubble_outline, size: 18),
                label: const Text(
                  'Send Message',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAdditionalInformationSection(ProjectEntity project) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Additional Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.brandNeutral900,
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Project ID
          _buildAdditionalInfoRow('Project ID:', '#${project.id}'),

          // Posted On
          _buildAdditionalInfoRow(
            'Posted on:',
            project.formattedCreatedAt,
          ),

          // Project Type
          _buildAdditionalInfoRow(
            'Type:',
            project.formattedProjectType,
          ),

          // Status
          _buildAdditionalInfoRow(
            'Status:',
            project.formattedStatus,
            statusColor: _getStatusColor(project.status),
          ),

          // Uploaded by Admin
          if (project.uploadedByAdmin)
            _buildAdditionalInfoRow(
              'Verification:',
              'Admin Verified',
              statusColor: AppColors.stateGreen600,
            ),
        ],
      ),
    );
  }

  Widget _buildAdditionalInfoRow(String label, String value,
      {Color? statusColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.brandNeutral600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: statusColor ?? AppColors.brandNeutral800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getProjectTypeColor(String projectType) {
    switch (projectType.toLowerCase()) {
      case 'residential':
        return AppColors.stateGreen600;
      case 'commercial':
        return AppColors.accentIndigo600;
      case 'infrastructure':
        return AppColors.brandPrimary600;
      default:
        return AppColors.brandNeutral600;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'starting_soon':
        return AppColors.accentIndigo600;
      case 'on_going':
        return AppColors.stateGreen600;
      case 'completed':
        return AppColors.brandNeutral600;
      case 'on_hold':
        return AppColors.stateYellow600;
      case 'cancelled':
        return AppColors.stateRed600;
      default:
        return AppColors.brandNeutral600;
    }
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

class _DetailItem {
  final String label;
  final String value;
  final IconData icon;

  _DetailItem(this.label, this.value, this.icon);
}
