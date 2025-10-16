import '../entities/promotion_banner_entity.dart';

abstract class PromotionBannerRepository {
  Future<List<PromotionBannerEntity>> getPromotionBanners();
}
