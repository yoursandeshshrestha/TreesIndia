import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../constants/app_colors.dart';
import '../../../../constants/app_spacing.dart';
import '../../../../components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/service_card/app/views/service_card_widget.dart';
import 'package:trees_india/pages/home_page/app/providers/home_page_providers.dart';

class PopularServicesWidget extends ConsumerWidget {
  final VoidCallback? onSeeAllTap;

  const PopularServicesWidget({
    super.key,
    this.onSeeAllTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homePageState = ref.watch(homePageNotifierProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              H4Bold(
                text: 'Most booked services',
                color: AppColors.brandNeutral900,
              ),
              GestureDetector(
                onTap: onSeeAllTap,
                child: const Text(
                  'See all',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF055c3a),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Service Cards
          SizedBox(
            height: 200,
            child: homePageState.isLoadingPopularServices
                ? const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFF055c3a),
                    ),
                  )
                : homePageState.popularServices.isEmpty
                    ? Center(
                        child: B2Regular(
                          text: 'No popular services available',
                          color: AppColors.brandNeutral600,
                        ),
                      )
                    : ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: homePageState.popularServices.length,
                        itemBuilder: (context, index) {
                          final service = homePageState.popularServices[index];
                          return Padding(
                            padding: EdgeInsets.only(
                              right: index <
                                      homePageState.popularServices.length - 1
                                  ? AppSpacing.sm
                                  : 0,
                            ),
                            child: ServiceCardWidget(
                              props: ServiceCardProps(
                                image: service.images?.isNotEmpty == true
                                    ? service.images!.first
                                    : 'assets/images/placeholder.svg',
                                title: service.name,
                                type: service.priceType == 'fixed'
                                    ? ServiceType.fixed
                                    : ServiceType.inquiry,
                                duration: service.duration ?? '2-3 hours',
                                price: service.price != null
                                    ? '₹${service.price}'
                                    : 'Inquiry',
                                rating: '4.79',
                                reviewCount: '116K',
                              ),
                              onTap: () {
                                context.push(
                                  '/service-detail/${service.id}',
                                  extra: {
                                    'service': service,
                                  },
                                );
                                // print('Service tapped: ${service.name}');
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
