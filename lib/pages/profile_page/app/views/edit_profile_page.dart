import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/textfield/app/views/alphabetic_textfield_widget.dart';
import 'package:trees_india/commons/components/textfield/app/views/email_textfield_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/domain/entities/user_entity.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/pages/profile_page/app/providers/profile_providers.dart';

class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  String _selectedGender = 'male';
  final ImagePicker _picker = ImagePicker();
  bool _isInitialized = false;
  Key _nameFieldKey = UniqueKey();
  Key _emailFieldKey = UniqueKey();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeWithUserData();
    });
  }

  void _initializeWithUserData() {
    final profileState = ref.read(userProfileProvider);
    final user = profileState.user;
    if (user != null && !_isInitialized) {
      _nameController.text = user.name ?? '';
      _emailController.text = user.email ?? '';
      _selectedGender = user.gender ?? 'male';
      setState(() {
        _isInitialized = true;
        // Force text fields to rebuild with new keys
        _nameFieldKey = UniqueKey();
        _emailFieldKey = UniqueKey();
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 80,
      );

      if (image != null) {
        final File imageFile = File(image.path);
        final Uint8List imageBytes = await imageFile.readAsBytes();
        await ref
            .read(profileProvider.notifier)
            .uploadAvatar(imageBytes, image.name);
        // Refresh profile data after avatar upload
        await ref.read(userProfileProvider.notifier).refreshUserProfile();
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  void _updateProfile() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();

    if (name.isEmpty && email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please fill in all fields'),
        ),
      );
    }

    print(
        'Updating profile with name: $name, email: $email, gender: $_selectedGender');

    try {
      // Update profile using auth notifier
      await ref
          .read(profileProvider.notifier)
          .updateProfile(name, email, _selectedGender);

      // Refresh profile data after update
      await ref.read(userProfileProvider.notifier).refreshUserProfile();

      // Navigate back to profile page
      if (mounted) {
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update profile: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProfileState = ref.watch(userProfileProvider);
    final profileState = ref.watch(profileProvider);
    final user = userProfileState.user;

    // Re-initialize if user data changes and we haven't initialized yet
    if (user != null && !_isInitialized) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _initializeWithUserData();
      });
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: AppColors.brandPrimary600,
          ),
          onPressed: () => context.pop(),
        ),
        title: H2Bold(
          text: 'Edit Profile',
          color: AppColors.brandPrimary600,
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Avatar Section
              GestureDetector(
                onTap: profileState.isUploadingAvatar ? null : _pickImage,
                child: Stack(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.brandPrimary200,
                          width: 3,
                        ),
                      ),
                      child: ClipOval(
                        child: _buildAvatarImage(user),
                      ),
                    ),
                    if (profileState.isUploadingAvatar)
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.black.withOpacity(0.5),
                          ),
                          child: const Center(
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: AppColors.brandPrimary600,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // Full Name Field
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  B3Medium(
                    text: 'Full Name',
                    color: AppColors.brandNeutral400,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  AlphabeticTextfieldWidget(
                    key: _nameFieldKey,
                    initialText: _nameController.text,
                    hintText: '',
                    onTextChanged: (value) {
                      _nameController.text = value;
                    },
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              // Email Field
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  B3Medium(
                    text: 'Email Address',
                    color: AppColors.brandNeutral400,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  EmailTextFieldWidget(
                    key: _emailFieldKey,
                    initialText: _emailController.text,
                    hintText: '',
                    onTextChanged: (value) {
                      _emailController.text = value;
                    },
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              // Gender Selection
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  B3Medium(
                    text: 'Gender',
                    color: AppColors.brandNeutral400,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      Expanded(
                        child: RadioListTile<String>(
                          title: B3Regular(text: 'Male'),
                          value: 'male',
                          groupValue: _selectedGender,
                          onChanged: (value) {
                            setState(() {
                              _selectedGender = value!;
                            });
                          },
                          activeColor: AppColors.brandPrimary600,
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                      Expanded(
                        child: RadioListTile<String>(
                          title: B3Regular(text: 'Female'),
                          value: 'female',
                          groupValue: _selectedGender,
                          onChanged: (value) {
                            setState(() {
                              _selectedGender = value!;
                            });
                          },
                          activeColor: AppColors.brandPrimary600,
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              // Phone Number (Read-only)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  B3Medium(
                    text: 'Phone Number',
                    color: AppColors.brandNeutral400,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.brandNeutral100,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.brandNeutral300,
                        width: 1,
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: B2Regular(
                              text: user?.phone ?? '+91-8617662584',
                              color: AppColors.brandNeutral600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.xl * 2),

              // Update Button
              SizedBox(
                width: double.infinity,
                child: SolidButtonWidget(
                  label: 'Update Now',
                  backgroundColor: AppColors.accentPurple600,
                  isLoading: profileState.isUpdatingProfile,
                  onPressed: _updateProfile,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatarImage(UserEntity? user) {
    // Prioritize the latest avatar from profile state over auth state
    final avatarUrl = user?.userImage;

    if (avatarUrl != null && avatarUrl.isNotEmpty) {
      return Image.network(
        avatarUrl,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return _buildDefaultAvatar();
        },
      );
    } else {
      return _buildDefaultAvatar();
    }
  }

  Widget _buildDefaultAvatar() {
    return Container(
      color: AppColors.brandPrimary100,
      child: const Icon(
        Icons.person,
        size: 60,
        color: AppColors.brandPrimary600,
      ),
    );
  }
}
