import '../../../profile_page/app/views/menu_pages/my_vendor_profiles/domain/entities/vendor_entity.dart';
import '../entities/vendor_filters_entity.dart';

abstract class VendorRepository {
  Future<List<VendorEntity>> getVendors(VendorFiltersEntity filters);
  Future<VendorEntity> getVendorDetails(String vendorId);
}