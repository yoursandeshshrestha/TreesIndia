import { useAppSelector } from '../store/hooks';

export function useSubscriptionStatus() {
  const { hasActiveSubscription, subscriptionExpiryDate, user } = useAppSelector(
    (state) => state.auth
  );

  const isAdmin = user?.user_type === 'admin';
  // Check both Redux state and user object for subscription status
  const userHasActiveSub =
    user?.has_active_subscription === true || user?.subscription === 'active';
  const canAccessPremiumContent = hasActiveSubscription || isAdmin || userHasActiveSub;

  return {
    hasActiveSubscription: hasActiveSubscription || userHasActiveSub,
    subscriptionExpiryDate,
    isAdmin,
    canAccessPremiumContent,
  };
}
