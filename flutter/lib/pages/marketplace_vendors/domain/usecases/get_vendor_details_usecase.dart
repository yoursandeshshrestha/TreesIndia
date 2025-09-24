import '../../../profile_page/app/views/menu_pages/my_vendor_profiles/domain/entities/vendor_entity.dart';
import '../repositories/vendor_repository.dart';

class GetVendorDetailsUsecase {
  final VendorRepository vendorRepository;

  GetVendorDetailsUsecase({
    required this.vendorRepository,
  });

  Future<VendorEntity> call(String vendorId) async {
    if (vendorId.isEmpty) {
      throw Exception('Vendor ID cannot be empty');
    }

    try {
      return await vendorRepository.getVendorDetails(vendorId);
    } catch (e) {
      throw Exception('Failed to get vendor details: $e');
    }
  }
}