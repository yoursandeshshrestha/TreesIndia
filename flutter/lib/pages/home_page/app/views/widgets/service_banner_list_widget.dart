import 'package:flutter/material.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import 'service_banner_widget.dart';

class ServiceBannerListWidget extends StatefulWidget {
  const ServiceBannerListWidget({super.key, required this.banners});

  final List<ServiceBannerWidget> banners;

  @override
  State<ServiceBannerListWidget> createState() =>
      _ServiceBannerListWidgetState();
}

class _ServiceBannerListWidgetState extends State<ServiceBannerListWidget> {
  late ScrollController _scrollController;
  double _scrollProgress = 0.0;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.hasClients) {
      final maxScrollExtent = _scrollController.position.maxScrollExtent;
      final currentScroll = _scrollController.offset;

      if (maxScrollExtent > 0) {
        setState(() {
          _scrollProgress = (currentScroll / maxScrollExtent).clamp(0.0, 1.0);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 176,
          child: ListView(
            controller: _scrollController,
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.only(left: AppSpacing.lg),
            children: widget.banners,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        _buildScrollIndicator(),
      ],
    );
  }

  Widget _buildScrollIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(widget.banners.length, (index) {
        final progress = _scrollProgress * (widget.banners.length - 1);
        final currentIndex = progress.floor();
        final nextIndex = currentIndex + 1;
        final fraction = progress - currentIndex;

        bool isActive = false;
        double opacity = 0.3;

        if (index == currentIndex) {
          isActive = true;
          opacity = 1.0 - (fraction * 0.7);
        } else if (index == nextIndex && fraction > 0) {
          isActive = true;
          opacity = 0.3 + (fraction * 0.7);
        }

        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 3),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: isActive ? 24 : 8,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral900.withValues(alpha: opacity),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        );
      }),
    );
  }
}
