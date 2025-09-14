import '../../domain/entities/assignment_response_entity.dart';
import '../../domain/repositories/my_works_repository.dart';
import '../datasources/my_works_datasource.dart';
import '../../app/viewmodels/my_works_state.dart';

class MyWorksRepositoryImpl implements MyWorksRepository {
  final MyWorksDataSource dataSource;

  MyWorksRepositoryImpl({required this.dataSource});

  @override
  Future<AssignmentResponseEntity> getAssignments({
    AssignmentTab tab = AssignmentTab.all,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await dataSource.getAssignments(
        tab: tab,
        page: page,
        limit: limit,
      );
      return response.toEntity();
    } catch (e) {
      throw Exception('Failed to get assignments: $e');
    }
  }

  @override
  Future<void> acceptAssignment({
    required int assignmentId,
    String notes = 'Assignment accepted via mobile app',
  }) async {
    try {
      await dataSource.acceptAssignment(
        assignmentId: assignmentId,
        notes: notes,
      );
    } catch (e) {
      throw Exception('Failed to accept assignment: $e');
    }
  }

  @override
  Future<void> rejectAssignment({
    required int assignmentId,
    required String reason,
    String notes = '',
  }) async {
    try {
      await dataSource.rejectAssignment(
        assignmentId: assignmentId,
        reason: reason,
        notes: notes,
      );
    } catch (e) {
      throw Exception('Failed to reject assignment: $e');
    }
  }

  @override
  Future<void> startWork({
    required int assignmentId,
    String notes = 'Work started via mobile app',
  }) async {
    try {
      await dataSource.startWork(
        assignmentId: assignmentId,
        notes: notes,
      );
    } catch (e) {
      throw Exception('Failed to start work: $e');
    }
  }

  @override
  Future<void> completeWork({
    required int assignmentId,
    String notes = 'Work completed via mobile app',
  }) async {
    try {
      await dataSource.completeWork(
        assignmentId: assignmentId,
        notes: notes,
      );
    } catch (e) {
      throw Exception('Failed to complete work: $e');
    }
  }
}