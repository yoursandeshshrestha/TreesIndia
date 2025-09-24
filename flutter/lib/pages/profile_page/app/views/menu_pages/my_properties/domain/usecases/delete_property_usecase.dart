import '../repositories/property_repository.dart';

class DeletePropertyUseCase {
  final PropertyRepository repository;

  DeletePropertyUseCase(this.repository);

  Future<void> execute(int propertyId) async {
    await repository.deleteProperty(propertyId);
  }
}