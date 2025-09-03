import '../repositories/address_repository.dart';

class DeleteAddressUseCase {
  final AddressRepository repository;

  const DeleteAddressUseCase(this.repository);

  Future<void> call(int addressId) async {
    return await repository.deleteAddress(addressId);
  }
}