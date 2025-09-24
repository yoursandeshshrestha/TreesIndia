import '../entities/vendor_entity.dart';
import '../repositories/vendor_repository.dart';

class GetUserVendorsUseCase {
  final VendorRepository repository;

  GetUserVendorsUseCase(this.repository);

  Future<List<VendorEntity>> call({int page = 1, int limit = 20}) async {
    return await repository.getUserVendors(page: page, limit: limit);
  }
}