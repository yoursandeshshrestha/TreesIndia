import 'package:trees_india/commons/components/walkthrough/domain/entities/walkthrough_manager_entity.dart';

abstract class WalkthroughRepository {
  Future<bool> isWalkthroughCompleted(String pageKey);
  Future<void> completeWalkthroughForPage(String pageKey);
  Future<WalkthroughManagerEntity> getWalkthroughManagerEntity(String pageKey);
}
