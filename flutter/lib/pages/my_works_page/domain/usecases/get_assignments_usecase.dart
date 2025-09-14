import '../entities/assignment_response_entity.dart';
import '../repositories/my_works_repository.dart';
import '../../app/viewmodels/my_works_state.dart';

class GetAssignmentsUsecase {
  final MyWorksRepository repository;

  GetAssignmentsUsecase({required this.repository});

  Future<AssignmentResponseEntity> call({
    AssignmentTab tab = AssignmentTab.all,
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.getAssignments(
      tab: tab,
      page: page,
      limit: limit,
    );
  }
}