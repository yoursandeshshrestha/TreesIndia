import '../../domain/entities/promotion_banner_entity.dart';
import '../../domain/repositories/promotion_banner_repository.dart';
import '../datasources/promotion_banner_remote_datasource.dart';

class PromotionBannerRepositoryImpl implements PromotionBannerRepository {
  final PromotionBannerRemoteDataSource remoteDataSource;

  const PromotionBannerRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<PromotionBannerEntity>> getPromotionBanners() async {
    final bannerModels = await remoteDataSource.getPromotionBanners();
    return bannerModels.map((model) => model.toEntity()).toList();
  }
}
