import '../entities/assignment_response_entity.dart';
import '../../app/viewmodels/my_works_state.dart';

abstract class MyWorksRepository {
  Future<AssignmentResponseEntity> getAssignments({
    AssignmentTab tab = AssignmentTab.all,
    int page = 1,
    int limit = 10,
  });

  Future<void> acceptAssignment({
    required int assignmentId,
    String notes = 'Assignment accepted via mobile app',
  });

  Future<void> rejectAssignment({
    required int assignmentId,
    required String reason,
    String notes = '',
  });

  Future<void> startWork({
    required int assignmentId,
    String notes = 'Work started via mobile app',
  });

  Future<void> completeWork({
    required int assignmentId,
    String notes = 'Work completed via mobile app',
  });
}