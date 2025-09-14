import '../repositories/my_works_repository.dart';

class AcceptAssignmentUsecase {
  final MyWorksRepository repository;

  AcceptAssignmentUsecase({required this.repository});

  Future<void> call({
    required int assignmentId,
    String notes = 'Assignment accepted via mobile app',
  }) async {
    return await repository.acceptAssignment(
      assignmentId: assignmentId,
      notes: notes,
    );
  }
}