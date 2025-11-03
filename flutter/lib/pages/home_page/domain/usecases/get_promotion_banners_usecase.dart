import '../entities/promotion_banner_entity.dart';
import '../repositories/promotion_banner_repository.dart';

class GetPromotionBannersUseCase {
  final PromotionBannerRepository repository;

  const GetPromotionBannersUseCase(this.repository);

  Future<List<PromotionBannerEntity>> call() async {
    return await repository.getPromotionBanners();
  }
}
