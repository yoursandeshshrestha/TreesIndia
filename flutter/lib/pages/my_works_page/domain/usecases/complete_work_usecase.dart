import '../repositories/my_works_repository.dart';

class CompleteWorkUsecase {
  final MyWorksRepository repository;

  CompleteWorkUsecase({required this.repository});

  Future<void> call({
    required int assignmentId,
    String notes = 'Work completed via mobile app',
  }) async {
    return await repository.completeWork(
      assignmentId: assignmentId,
      notes: notes,
    );
  }
}