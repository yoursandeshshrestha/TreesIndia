import '../../domain/entities/vendor_entity.dart';
import '../../domain/entities/vendor_form_entity.dart';
import '../../domain/repositories/vendor_repository.dart';
import '../datasources/vendor_remote_datasource.dart';
import '../models/vendor_form_model.dart';

class VendorRepositoryImpl implements VendorRepository {
  final VendorRemoteDataSource remoteDataSource;

  VendorRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<List<VendorEntity>> getUserVendors({int page = 1, int limit = 20}) async {
    final response = await remoteDataSource.getUserVendors(page: page, limit: limit);
    return response.data.map((model) => model.toEntity()).toList();
  }

  @override
  Future<VendorEntity> createVendor(VendorFormEntity vendorForm) async {
    final vendorFormModel = VendorFormModel.fromEntity(vendorForm);

    final response = await remoteDataSource.createVendor(vendorFormModel);
    return response.data.toEntity();
  }

  @override
  Future<void> deleteVendor(int vendorId) async {
    await remoteDataSource.deleteVendor(vendorId);
  }
}