import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/LoadingState';
import { useAuthContext } from '@/store/authContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return <LoadingState />;
  if (isAuthenticated) return <Redirect href="/(app)" />;
  return <Redirect href="/(auth)/login" />;
}
