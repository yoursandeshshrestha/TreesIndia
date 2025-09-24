import '../../../profile_page/app/views/menu_pages/my_vendor_profiles/domain/entities/vendor_entity.dart';
import '../../domain/entities/vendor_filters_entity.dart';
import '../../domain/repositories/vendor_repository.dart';
import '../datasources/vendor_remote_datasource.dart';

class VendorRepositoryImpl implements VendorRepository {
  final VendorRemoteDatasource vendorRemoteDatasource;

  VendorRepositoryImpl({
    required this.vendorRemoteDatasource,
  });

  @override
  Future<List<VendorEntity>> getVendors(VendorFiltersEntity filters) async {
    try {
      final response = await vendorRemoteDatasource.getVendors(filters);
      return response.data.map((vendor) => vendor.toEntity()).toList();
    } catch (e) {
      throw Exception('Failed to get vendors: $e');
    }
  }

  @override
  Future<VendorEntity> getVendorDetails(String vendorId) async {
    try {
      final vendor = await vendorRemoteDatasource.getVendorDetails(vendorId);
      return vendor.toEntity();
    } catch (e) {
      throw Exception('Failed to get vendor details: $e');
    }
  }
}