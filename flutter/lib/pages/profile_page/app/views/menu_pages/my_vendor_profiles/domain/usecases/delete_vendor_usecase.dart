import '../repositories/vendor_repository.dart';

class DeleteVendorUseCase {
  final VendorRepository repository;

  DeleteVendorUseCase(this.repository);

  Future<void> call(int vendorId) async {
    return await repository.deleteVendor(vendorId);
  }
}