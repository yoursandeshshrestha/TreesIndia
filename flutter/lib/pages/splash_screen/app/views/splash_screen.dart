import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  late PageController _pageController;
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  int _currentPage = 0;

  final List<OnboardingData> _onboardingData = [
    OnboardingData(
      image: 'assets/images/cleaner.png',
      title: 'Home Services',
      subtitle: 'Trusted professionals for every corner of your home',
    ),
    OnboardingData(
      image: 'assets/images/construction.png',
      title: 'Construction Services',
      subtitle: 'Turn your vision into reality with expert builders',
    ),
    OnboardingData(
      image: 'assets/images/marketplace.png',
      title: 'Marketplace',
      subtitle: 'Discover properties and connect with skilled workers',
    ),
  ];

  @override
  void initState() {
    super.initState();
    debugPrint('🎨 SplashScreen: initState called');

    _pageController = PageController();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));

    _fadeController.forward();
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentPage = index;
    });
  }

  void _onNextPressed() {
    if (_currentPage < _onboardingData.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      context.push('/login');
    }
  }

  void _onSkipPressed() {
    context.push('/login');
  }

  @override
  void dispose() {
    _pageController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    debugPrint('🎨 SplashScreen: build called');
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: TextButton(
                  onPressed: _onSkipPressed,
                  child: B1Regular(
                    text: 'Skip',
                    color: AppColors.brandNeutral900,
                  ),
                ),
              ),
            ),

            // Page content
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                itemCount: _onboardingData.length,
                itemBuilder: (context, index) {
                  return _buildOnboardingPage(
                    _onboardingData[index],
                    screenHeight,
                    screenWidth,
                  );
                },
              ),
            ),

            // Bottom section
            Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Pagination dots
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_onboardingData.length, (index) {
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _currentPage == index
                              ? AppColors.brandPrimary600 // Green
                              : const Color(0xFFE0E0E0), // Light gray
                        ),
                      );
                    }),
                  ),

                  const SizedBox(height: 32),

                  // Action button
                  SizedBox(
                    width: double.infinity,
                    child: SolidButtonWidget(
                      label: _currentPage == _onboardingData.length - 1
                          ? 'Get Started'
                          : 'Next',
                      onPressed: _onNextPressed,
                      backgroundColor: AppColors.brandPrimary600, // Green
                      labelColor: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Sign in link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      B4Regular(
                        text: 'Already have an account? ',
                        color: AppColors.brandNeutral600,
                      ),
                      GestureDetector(
                        onTap: _onSkipPressed,
                        child: B4Bold(
                          text: 'Sign In',
                          color: AppColors.brandPrimary600, // Green
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
    );
  }

  Widget _buildOnboardingPage(
    OnboardingData data,
    double screenHeight,
    double screenWidth,
  ) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          children: [
            // Image section (65% of screen)
            Expanded(
              flex: 65,
              child: Center(
                child: Image.asset(
                  data.image,
                  width: screenWidth * 0.8,
                  height: screenHeight * 0.4,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 150,
                      height: 150,
                      decoration: BoxDecoration(
                        color: AppColors.brandPrimary600, // Green
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Icon(
                        _getIconForService(data.title),
                        size: 80,
                        color: Colors.white,
                      ),
                    );
                  },
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Text section (35% of screen)
            Expanded(
              flex: 35,
              child: Column(
                children: [
                  // Main title
                  H1Bold(
                    text: data.title,
                    textAlign: TextAlign.center,
                    color: AppColors.brandNeutral900,
                  ),

                  const SizedBox(height: 16),

                  // Subtitle
                  B1Regular(
                    text: data.subtitle,
                    textAlign: TextAlign.center,
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForService(String service) {
    switch (service) {
      case 'Home Services':
        return Icons.home;
      case 'Construction Services':
        return Icons.construction;
      case 'Marketplace':
        return Icons.store;
      default:
        return Icons.home;
    }
  }
}

class OnboardingData {
  final String image;
  final String title;
  final String subtitle;

  OnboardingData({
    required this.image,
    required this.title,
    required this.subtitle,
  });
}
