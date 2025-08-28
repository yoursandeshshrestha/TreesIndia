import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/bottom_navbar/app/views/bottom_navbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/info_snackbar_widget.dart';

class MainLayoutWidget extends StatefulWidget {
  final Widget child;
  final int currentIndex;

  const MainLayoutWidget({
    super.key,
    required this.child,
    required this.currentIndex,
  });

  @override
  State<MainLayoutWidget> createState() => _MainLayoutWidgetState();
}

class _MainLayoutWidgetState extends State<MainLayoutWidget> {
  void _onNavItemTapped(int index) {
    if (index == widget.currentIndex) return;

    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        // Navigate to bookings (placeholder)
        context.go('/bookings');
        break;
      case 2:
        // Navigate to rewards (placeholder)
        ScaffoldMessenger.of(context).showSnackBar(
          const InfoSnackbarWidget(
            message: 'Rewards page coming soon!',
          ).createSnackBar(),
        );
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
