import '../entities/vendor_entity.dart';
import '../entities/vendor_form_entity.dart';

abstract class VendorRepository {
  /// Get user's vendor profiles with pagination
  Future<List<VendorEntity>> getUserVendors({int page = 1, int limit = 20});

  /// Create a new vendor profile
  Future<VendorEntity> createVendor(VendorFormEntity vendorForm);

  /// Delete a vendor profile by ID
  Future<void> deleteVendor(int vendorId);
}