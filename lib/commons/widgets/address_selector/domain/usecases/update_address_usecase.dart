import '../entities/address_entity.dart';
import '../repositories/address_repository.dart';

class UpdateAddressUseCase {
  final AddressRepository repository;

  const UpdateAddressUseCase(this.repository);

  Future<AddressEntity> call(UpdateAddressRequestEntity request) async {
    return await repository.updateAddress(request);
  }
}