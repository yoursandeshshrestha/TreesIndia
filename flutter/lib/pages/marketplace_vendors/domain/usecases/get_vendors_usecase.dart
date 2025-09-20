import '../../../profile_page/app/views/menu_pages/my_vendor_profiles/domain/entities/vendor_entity.dart';
import '../entities/vendor_filters_entity.dart';
import '../repositories/vendor_repository.dart';

class GetVendorsUsecase {
  final VendorRepository vendorRepository;

  GetVendorsUsecase({required this.vendorRepository});

  Future<List<VendorEntity>> call(VendorFiltersEntity filters) async {
    return await vendorRepository.getVendors(filters);
  }
}