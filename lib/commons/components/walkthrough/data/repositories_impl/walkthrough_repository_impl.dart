import 'package:trees_india/commons/components/walkthrough/domain/entities/walkthrough_manager_entity.dart';
import 'package:trees_india/commons/components/walkthrough/domain/repositories/walkthrough_repository.dart';
import 'package:trees_india/commons/domain/repositories/centralized_data_repository.dart';
import 'package:trees_india/commons/utils/services/centralized_local_storage_service.dart';

class WalkthroughRepositoryImpl implements WalkthroughRepository {
  final CentralizedLocalStorageService _storageService;
  final CentralizedDataRepository _centralizedDataRepository;

  WalkthroughRepositoryImpl(
      this._storageService, this._centralizedDataRepository);

  // Key for storing the walkthrough statuses
  static const String walkthroughKeyPrefix = 'walkthrough_';

  // Generates the unique storage key for each page
  Future<String> _getWalkthroughKeyForPage(String pageKey) async {
    final userEmail = (await _centralizedDataRepository.getUserProfile()).email;
    return '$walkthroughKeyPrefix$userEmail$pageKey';
  }

  @override
  Future<bool> isWalkthroughCompleted(String pageKey) async {
    final key = await _getWalkthroughKeyForPage(pageKey);
    final storedData = await _storageService.getData(key) as bool?;
    return storedData ?? false; // Return false if no data is found
  }

  @override
  Future<void> completeWalkthroughForPage(String pageKey) async {
    final key = await _getWalkthroughKeyForPage(pageKey);
    await _storageService.saveData(
        key, true); // Store completion status as true
  }

  @override
  Future<WalkthroughManagerEntity> getWalkthroughManagerEntity(
      String pageKey) async {
    final isCompleted = await isWalkthroughCompleted(pageKey);
    return WalkthroughManagerEntity(pageKey: pageKey, isCompleted: isCompleted);
  }
}
