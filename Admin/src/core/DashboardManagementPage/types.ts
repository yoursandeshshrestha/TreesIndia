// Dashboard types and interfaces

export interface DashboardOverview {
  overview_stats: OverviewStats;
  user_analytics: UserAnalytics;
  booking_analytics: BookingAnalytics;
  marketplace_analytics: MarketplaceAnalytics;
  financial_analytics: FinancialAnalytics;
  communication_analytics: CommunicationAnalytics;
  system_health: SystemHealth;
  monthly_trends: MonthlyTrends;
}

export interface OverviewStats {
  total_users: number;
  total_bookings: number;
  total_revenue: number;
  active_services: number;
  total_properties: number;
  total_projects: number;
  total_vendors: number;
  total_workers: number;
  total_brokers: number;
  active_subscriptions: number;
}

export interface UserTypesDistribution {
  admin: number;
  normal: number;
  worker: number;
}

export interface UserAnalytics {
  user_growth: MonthlyData[];
  user_types_distribution: UserTypesDistribution;
  recent_users: User[];
  active_users: number;
  new_users_this_month: number;
  user_retention_rate: number;
}

export interface BookingAnalytics {
  booking_trends: MonthlyData[];
  status_breakdown: Record<string, number>;
  recent_bookings: Booking[];
  urgent_alerts: UrgentAlert[];
  completion_rate: number;
  average_booking_value: number;
  bookings_this_month: number;
}

export interface MarketplaceAnalytics {
  property_analytics: PropertyAnalytics;
  project_analytics: ProjectAnalytics;
  vendor_analytics: VendorAnalytics;
}

export interface PropertyAnalytics {
  total_properties: number;
  active_listings: number;
  properties_this_month: number;
  average_property_price?: number;
  property_trends: MonthlyData[];
}

export interface ProjectAnalytics {
  total_projects: number;
  active_projects: number;
  completed_projects?: number;
  projects_this_month: number;
  project_trends: MonthlyData[];
}

export interface VendorAnalytics {
  total_vendors: number;
  active_vendors: number;
  vendors_this_month: number;
  average_vendor_rating?: number;
  vendor_trends: MonthlyData[];
}

export interface FinancialAnalytics {
  revenue_trends: MonthlyData[];
  payment_analytics: PaymentAnalytics;
  subscription_analytics: SubscriptionAnalytics;
  revenue_this_month: number;
  revenue_growth: number;
}

export interface PaymentAnalytics {
  total_transactions: number;
  successful_payments: number;
  failed_payments: number;
  payment_success_rate: number;
  payment_method_breakdown: Record<string, number>;
  payment_trends: MonthlyData[];
}

export interface SubscriptionAnalytics {
  active_subscriptions: number;
  new_subscriptions: number;
  subscription_revenue: number;
  churn_rate: number;
  subscription_trends: MonthlyData[];
}

export interface CommunicationAnalytics {
  chat_analytics: ChatAnalytics;
  notification_analytics: NotificationAnalytics;
}

export interface ChatAnalytics {
  total_chats: number;
  active_chats: number;
  average_response_time: number;
  chat_trends: MonthlyData[];
}

export interface NotificationAnalytics {
  total_notifications: number;
  delivered_notifications: number;
  delivery_rate: number;
  notification_trends: MonthlyData[];
}

export interface SystemHealth {
  system_status: string;
  active_sessions: number;
  api_response_time: string;
  database_status: string;
  uptime: string;
  error_rate: number;
}

export interface MonthlyTrends {
  users: MonthlyData[];
  bookings: MonthlyData[];
  revenue: MonthlyData[];
  services: MonthlyData[];
  properties: MonthlyData[];
  projects: MonthlyData[];
  vendors: MonthlyData[];
  payments: MonthlyData[];
  subscriptions: MonthlyData[];
  chats: MonthlyData[];
  notifications: MonthlyData[];
}

export interface MonthlyData {
  month: string; // Format: "2024-01"
  value: number;
  amount?: number; // For revenue data
  label?: string; // For display purposes
}

export interface ServicePerformance {
  service_id: number;
  service_name: string;
  total_bookings: number;
  revenue: number;
  rating: number;
  completion_rate: number;
}

export interface CategoryPerformance {
  category_id: number;
  category_name: string;
  total_services: number;
  total_bookings: number;
  revenue: number;
  growth: number;
}

export interface ServiceAreaData {
  area_name: string;
  total_bookings: number;
  active_workers: number;
  coverage: number;
}

export interface UrgentAlert {
  id: number;
  type: string; // "booking", "payment", "system"
  title: string;
  message: string;
  priority: string; // "high", "medium", "low"
  created_at: string;
  action_url?: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  phone: string;
  user_type: string;
  created_at: string;
}

export interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  service_id: number;
  status: string;
  created_at: string;
}

// Dashboard Stats (simplified version)
export interface DashboardStats {
  overview_stats: OverviewStats;
  monthly_trends: MonthlyTrends;
}

// Dashboard Alerts
export interface DashboardAlerts {
  urgent_alerts: UrgentAlert[];
  system_alerts: SystemAlert[];
  pending_actions: PendingAction[];
}

export interface SystemAlert {
  id: number;
  type: string;
  severity: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

export interface PendingAction {
  id: number;
  type: string;
  title: string;
  description: string;
  priority: string;
  created_at: string;
  action_url: string;
}

// API Response types
export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: DashboardOverview;
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

export interface DashboardAlertsResponse {
  success: boolean;
  message: string;
  data: DashboardAlerts;
}
