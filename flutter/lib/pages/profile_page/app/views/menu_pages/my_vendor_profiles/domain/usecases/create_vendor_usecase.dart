import '../entities/vendor_entity.dart';
import '../entities/vendor_form_entity.dart';
import '../repositories/vendor_repository.dart';

class CreateVendorUseCase {
  final VendorRepository repository;

  CreateVendorUseCase(this.repository);

Future<VendorEntity> call(VendorFormEntity vendorForm) async {
    return await repository.createVendor(vendorForm);
  }
}