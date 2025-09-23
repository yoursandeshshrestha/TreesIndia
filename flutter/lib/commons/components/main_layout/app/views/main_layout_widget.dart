import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/bottom_navbar/app/views/bottom_navbar_widget.dart';
import 'package:trees_india/pages/profile_page/app/providers/profile_providers.dart';

class MainLayoutWidget extends ConsumerStatefulWidget {
  final Widget child;
  final int currentIndex;

  const MainLayoutWidget({
    super.key,
    required this.child,
    required this.currentIndex,
  });

  @override
  ConsumerState<MainLayoutWidget> createState() => _MainLayoutWidgetState();
}

class _MainLayoutWidgetState extends ConsumerState<MainLayoutWidget> {


  void _onNavItemTapped(int index) {
    if (index == widget.currentIndex) return;

    final profileState = ref.watch(profileProvider);
    final userType = profileState.userType;

    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        // Navigate based on user type
        if (userType == 'worker') {
          context.go('/myworks');
        } else if (userType == 'normal') {
          context.go('/bookings');
        }
        break;
      case 2:
        // Navigate to chats (placeholder)
        context.go('/chats');
        break;
      case 3:
        context.go('/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavBarWidget(
        currentIndex: widget.currentIndex,
        onTap: _onNavItemTapped,
      ),
    );
  }
}
