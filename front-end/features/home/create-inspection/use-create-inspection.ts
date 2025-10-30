import { useCallback, useState } from 'react';
import type { CreateInspectionViewProps } from './create-inspection-view';
import { router } from 'expo-router';
import { useInspectionsStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { useActiveObservationStore } from '@/features/edit-observation/state';

export function useCreateInspection(): CreateInspectionViewProps {
  const [client, setClient] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const clearObservation = useActiveObservationStore(useShallow(s => s.clearObservation));

  const onClientChange = useCallback((value: string) => {
    setClient(value);
  }, []);

  const onAddressChange = useCallback((value: string) => {
    setAddress(value);
  }, []);

  const onCreate = useCallback(() => {
    if (!client || !address) return;

    const id = Math.random().toString(36).slice(2);
    useInspectionsStore.getState().createInspection({
      id,
      client,
      address,
      createdAt: Date.now(),
    });

    clearObservation();

    router.push(`/active-inspection/${id}`);
  }, [client, address]);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.push('/');
  }

  return {
    client,
    address,
    onClientChange,
    onAddressChange,
    onCreate,
    goBack,
  };
}
