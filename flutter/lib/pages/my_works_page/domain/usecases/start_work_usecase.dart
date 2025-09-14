import '../repositories/my_works_repository.dart';

class StartWorkUsecase {
  final MyWorksRepository repository;

  StartWorkUsecase({required this.repository});

  Future<void> call({
    required int assignmentId,
    String notes = 'Work started via mobile app',
  }) async {
    return await repository.startWork(
      assignmentId: assignmentId,
      notes: notes,
    );
  }
}