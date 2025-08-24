import '../models/service_model.dart';
import '../../domain/entities/service_entity.dart';

abstract class ServiceRemoteDataSource {
  Future<List<ServiceModel>> getServices();
  Future<List<ServiceModel>> getServicesByCategory(ServiceCategory category);
  Future<ServiceModel?> getServiceById(String id);
}

class ServiceRemoteDataSourceImpl implements ServiceRemoteDataSource {
  static final List<ServiceModel> _dummyServices = [
    // Home Services
    ServiceModel(
      id: '1',
      name: 'Painter',
      description: 'Professional painting services for your home',
      iconUrl: 'lib/image/worker.png',
      category: ServiceCategory.homeServices,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
      updatedAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    ServiceModel(
      id: '2',
      name: 'Cleaner',
      description: 'Deep cleaning services for residential properties',
      iconUrl: 'lib/image/cleaner.png',
      category: ServiceCategory.homeServices,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 25)),
      updatedAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
    ServiceModel(
      id: '3',
      name: 'Electrician',
      description: 'Electrical repair and installation services',
      iconUrl: 'lib/image/worker.png',
      category: ServiceCategory.homeServices,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 20)),
      updatedAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    ServiceModel(
      id: '4',
      name: 'Plumber',
      description: 'Water supply and drainage solutions',
      iconUrl: 'lib/image/worker.png',
      category: ServiceCategory.homeServices,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 18)),
      updatedAt: DateTime.now().subtract(const Duration(days: 3)),
    ),

    // Construction Services
    ServiceModel(
      id: '5',
      name: 'Architect',
      description: 'Building design and architectural planning',
      iconUrl: 'lib/image/Architect-Worker-Transparent.png',
      category: ServiceCategory.constructionServices,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 35)),
      updatedAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
    ServiceModel(
      id: '6',
      name: 'Construction',
      description: 'Complete construction and renovation services',
      iconUrl: 'lib/image/construction.png',
      category: ServiceCategory.constructionServices,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 40)),
      updatedAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    ServiceModel(
      id: '7',
      name: 'Borehole',
      description: 'Water well drilling and borehole installation',
      iconUrl: 'lib/image/construction.png',
      category: ServiceCategory.constructionServices,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 28)),
      updatedAt: DateTime.now().subtract(const Duration(days: 4)),
    ),
    ServiceModel(
      id: '8',
      name: 'Mason',
      description: 'Masonry work and stone construction',
      iconUrl: 'lib/image/construction.png',
      category: ServiceCategory.constructionServices,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 22)),
      updatedAt: DateTime.now().subtract(const Duration(days: 2)),
    ),

    // Marketplace

    ServiceModel(
      id: '10',
      name: 'Property Rental',
      description: 'Rent construction equipment and machinery',
      iconUrl: 'lib/image/marketplace.png',
      category: ServiceCategory.rentalAndProperties,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 12)),
      updatedAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
    ServiceModel(
      id: '11',
      name: 'Property Buy and Sell',
      description: 'Buy and sell properties',
      iconUrl: 'lib/image/marketplace.png',
      category: ServiceCategory.rentalAndProperties,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 10)),
      updatedAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
  ];

  @override
  Future<List<ServiceModel>> getServices() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    return _dummyServices.where((service) => service.isActive).toList();
  }

  @override
  Future<List<ServiceModel>> getServicesByCategory(
      ServiceCategory category) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    return _dummyServices
        .where((service) => service.category == category && service.isActive)
        .toList();
  }

  @override
  Future<ServiceModel?> getServiceById(String id) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 200));
    try {
      return _dummyServices.firstWhere(
        (service) => service.id == id && service.isActive,
      );
    } catch (e) {
      return null;
    }
  }
}
