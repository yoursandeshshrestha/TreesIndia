import '../entities/address_entity.dart';

abstract class AddressRepository {
  Future<AddressListResponseEntity> getAddresses();
  Future<AddressEntity> createAddress(CreateAddressRequestEntity request);
  Future<AddressEntity> updateAddress(UpdateAddressRequestEntity request);
  Future<String> deleteAddress(int addressId);
}
