import '../entities/address_entity.dart';
import '../repositories/address_repository.dart';

class CreateAddressUseCase {
  final AddressRepository repository;

  const CreateAddressUseCase(this.repository);

  Future<AddressEntity> call(CreateAddressRequestEntity request) async {
    return await repository.createAddress(request);
  }
}