import '../entities/address_entity.dart';
import '../repositories/address_repository.dart';

class GetAddressesUseCase {
  final AddressRepository repository;

  const GetAddressesUseCase(this.repository);

  Future<AddressListResponseEntity> call() async {
    return await repository.getAddresses();
  }
}