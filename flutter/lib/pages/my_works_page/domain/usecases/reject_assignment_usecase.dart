import '../repositories/my_works_repository.dart';

class RejectAssignmentUsecase {
  final MyWorksRepository repository;

  RejectAssignmentUsecase({required this.repository});

  Future<void> call({
    required int assignmentId,
    required String reason,
    String notes = '',
  }) async {
    return await repository.rejectAssignment(
      assignmentId: assignmentId,
      reason: reason,
      notes: notes,
    );
  }
}