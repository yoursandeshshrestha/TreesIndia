import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';

class AnimatedProgressBar extends StatelessWidget {
  final double progress; // Accept the progress percentage as a parameter

  const AnimatedProgressBar({
    super.key,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 4.0, // Customize the height if needed
      decoration: BoxDecoration(
        color: const Color(0xFFFFFFFF),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFFD9D9D9),
            ),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LayoutBuilder(
              builder: (context, constraints) {
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.easeInOut,
                  width:
                      constraints.maxWidth * progress, // Progress from 0 to 1
                  color: AppColors.accentIndigo500,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
