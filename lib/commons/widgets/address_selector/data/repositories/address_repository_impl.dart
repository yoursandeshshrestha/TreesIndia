import '../../domain/entities/address_entity.dart';
import '../../domain/repositories/address_repository.dart';
import '../datasources/address_remote_datasource.dart';
import '../models/address_model.dart';

class AddressRepositoryImpl implements AddressRepository {
  final AddressRemoteDataSource remoteDataSource;

  const AddressRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<AddressListResponseEntity> getAddresses() async {
    final model = await remoteDataSource.getAddresses();
    return model.toEntity();
  }

  @override
  Future<AddressEntity> createAddress(CreateAddressRequestEntity request) async {
    final requestModel = CreateAddressRequestModel.fromEntity(request);
    final model = await remoteDataSource.createAddress(requestModel);
    return model.toEntity();
  }

  @override
  Future<AddressEntity> updateAddress(UpdateAddressRequestEntity request) async {
    final requestModel = UpdateAddressRequestModel.fromEntity(request);
    final model = await remoteDataSource.updateAddress(requestModel);
    return model.toEntity();
  }

  @override
  Future<void> deleteAddress(int addressId) async {
    await remoteDataSource.deleteAddress(addressId);
  }
}