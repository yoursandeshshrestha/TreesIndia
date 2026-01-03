// Export all services from a single entry point
export * from './api/base';
export * from './api/auth.service';
export * from './api/user.service';
export * from './api/wallet.service';

// Export service instances for convenience
export { authService } from './api/auth.service';
export { userService } from './api/user.service';
export { walletService } from './api/wallet.service';
export { addressService, type Address, type CreateAddressRequest, type UpdateAddressRequest } from './api/address.service';
export { locationSearchService, type LocationPrediction } from './api/location-search.service';
export { userLocationService, type UserLocation, type CreateLocationRequest, type UpdateLocationRequest } from './api/user-location.service';
export { subscriptionService, type SubscriptionPlan, type PricingOption, type UserSubscription, type SubscriptionHistory } from './api/subscription.service';
export { workerApplicationService, type WorkerApplicationRequest, type WorkerApplicationResponse, type UserApplicationResponse } from './api/workerApplication.service';
export { brokerApplicationService, type BrokerApplicationRequest, type BrokerApplicationResponse } from './api/brokerApplication.service';
export { propertyService, type Property, type PropertyListResponse, type PropertyResponse } from './api/property.service';
export { serviceService, type Service, type SearchResponse, type SearchSuggestionsResponse, type SearchSuggestion } from './api/service.service';
export { bannerService, type PromotionBanner } from './api/banner.service';
export { categoryService, type Category } from './api/category.service';
export { homepageIconService, type HomepageCategoryIcon } from './api/homepage-icon.service';
export { projectService, type Project, type ProjectListResponse, type ProjectResponse, type ContactInfo } from './api/project.service';

// Legacy API client for backward compatibility
// TODO: Remove this once all imports are updated
import { authService } from './api/auth.service';
import { userService } from './api/user.service';

export class APIClient {
  // Auth methods
  requestOTP = authService.requestOTP.bind(authService);
  verifyOTP = authService.verifyOTP.bind(authService);
  logout = authService.logout.bind(authService);
  refreshToken = authService.refreshToken.bind(authService);
  getCurrentUser = authService.getCurrentUser.bind(authService);
  isAuthenticated = authService.isAuthenticated.bind(authService);

  // User methods
  getUserProfile = userService.getUserProfile.bind(userService);
  updateProfile = userService.updateProfile.bind(userService);
  uploadAvatar = userService.uploadAvatar.bind(userService);

  private static instance: APIClient;

  private constructor() {}

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }
}

export const apiClient = APIClient.getInstance();

