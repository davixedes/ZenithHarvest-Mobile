import { Redirect, Stack } from 'expo-router';

import { LoadingState } from '@/components/LoadingState';
import { useAuthContext } from '@/store/authContext';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return <LoadingState />;
  if (isAuthenticated) return <Redirect href="/(app)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
