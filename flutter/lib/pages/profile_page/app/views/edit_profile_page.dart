import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/textfield/app/views/alphabetic_textfield_widget.dart';
import 'package:trees_india/commons/components/textfield/app/views/email_textfield_widget.dart';
import 'package:trees_india/commons/components/textfield/app/views/numeric_textfield_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/domain/entities/user_entity.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/pages/profile_page/app/providers/profile_providers.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';

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
  String? _emailError;

  // Main brand color used throughout the app
  static const Color mainColor = Color(0xFF055c3a);

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

    if (name.isEmpty || email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const ErrorSnackbarWidget(
          message: 'Please fill in all required fields',
        ).createSnackBar(),
      );
      return;
    }

    if (kDebugMode) {
      print(
          'Updating profile with name: $name, email: $email, gender: $_selectedGender');
    }

    // Clear previous inline error
    setState(() {
      _emailError = null;
    });

    // Trigger update
    await ref
        .read(profileProvider.notifier)
        .updateProfile(name, email, _selectedGender);

    // Read the latest state
    final latestProfileState = ref.read(profileProvider);

    // If there is an error (e.g., Email already exists), stay on page and show inline + snackbar
    if (latestProfileState.errorMessage != null &&
        latestProfileState.errorMessage!.isNotEmpty) {
      final message = latestProfileState.errorMessage!;
      if (mounted) {
        setState(() {
          _emailError = message;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          ErrorSnackbarWidget(message: message).createSnackBar(),
        );
      }
      return;
    }

    // Success path
    await ref.read(userProfileProvider.notifier).refreshUserProfile();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SuccessSnackbarWidget(
          message: 'Profile updated successfully!',
        ).createSnackBar(),
      );
      context.pop();
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
      backgroundColor: AppColors.white,
      appBar: const CustomAppBar(
        title: 'Edit Profile',
        backgroundColor: AppColors.white,
        iconColor: AppColors.brandNeutral800,
        titleColor: AppColors.brandNeutral800,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Avatar Section with improved styling
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
                          color: mainColor.withOpacity(0.2),
                          width: 3,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: mainColor.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
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
                            color: Colors.black.withOpacity(0.6),
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
                        decoration: BoxDecoration(
                          color: mainColor,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: mainColor.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
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
              const SizedBox(height: AppSpacing.xl),

              // Profile Information Section
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Full Name Field
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B3Medium(
                        text: 'Full Name *',
                        color: AppColors.brandNeutral700,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      AlphabeticTextfieldWidget(
                        key: _nameFieldKey,
                        initialText: _nameController.text,
                        hintText: 'Enter your full name',
                        onTextChanged: (value) {
                          _nameController.text = value;
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Email Field
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B3Medium(
                        text: 'Email Address *',
                        color: AppColors.brandNeutral700,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      EmailTextFieldWidget(
                        key: _emailFieldKey,
                        initialText: _emailController.text,
                        hintText: 'Enter your email address',
                        onTextChanged: (value) {
                          _emailController.text = value;
                          if (_emailError != null) {
                            setState(() {
                              _emailError = null;
                            });
                          }
                        },
                      ),
                      if (_emailError != null) ...[
                        const SizedBox(height: 6),
                        Text(
                          _emailError!,
                          style: const TextStyle(
                            color: AppColors.stateRed600,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Gender Selection with tabs
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B3Medium(
                        text: 'Gender',
                        color: AppColors.brandNeutral700,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: 12,
                        runSpacing: 8,
                        children: [
                          _buildGenderTab('male', 'Male'),
                          _buildGenderTab('female', 'Female'),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Phone Number Field
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B3Medium(
                        text: 'Phone Number',
                        color: AppColors.brandNeutral700,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      NumericTextfieldWidget(
                        hintText: 'Phone number',
                        onTextChanged: (value) {
                          // Phone number is read-only
                        },
                        initialText: user?.phone ?? '+91-8617662584',
                        readOnly: true,
                        enabled: false,
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.xl * 2),

              // Update Button with improved styling
              SizedBox(
                width: double.infinity,
                child: SolidButtonWidget(
                  label: 'Update Profile',
                  backgroundColor: mainColor,
                  isLoading: profileState.isUpdatingProfile,
                  onPressed: _updateProfile,
                ),
              ),

              const SizedBox(height: 5),

              // Help text
              Center(
                child: B4Regular(
                  text: 'Tap the camera icon to change your profile picture',
                  color: AppColors.brandNeutral400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGenderTab(String value, String label) {
    final isSelected = _selectedGender == value;

    return InkWell(
      onTap: () {
        setState(() {
          _selectedGender = value;
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? mainColor.withOpacity(0.1)
              : AppColors.brandNeutral50,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? mainColor : AppColors.brandNeutral200,
          ),
        ),
        child: B3Medium(
          text: label,
          color: isSelected ? mainColor : AppColors.brandNeutral600,
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
      color: mainColor.withOpacity(0.1),
      child: const Icon(
        Icons.person,
        size: 60,
        color: mainColor,
      ),
    );
  }
}
