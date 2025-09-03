import 'package:trees_india/pages/home_page/data/datasources/home_page_remote_datasource.dart';
import 'package:trees_india/pages/home_page/domain/repositories/home_page_repository.dart';

class HomePageRepositoryImpl extends HomePageRepository {
  final HomePageRemoteDatasource _remoteDatasource;

  HomePageRepositoryImpl(this._remoteDatasource);

  // TODO: Implement repository methods
  // Example:
  // @override
  // Future<HomePageData> getHomePageData() async {
  //   return await _remoteDatasource.fetchHomePageData();
  // }
}
