import { useCallback, useState } from 'react';
import type { CreateInspectionViewProps } from './create-inspection-view';
import { router } from 'expo-router';
import { useInspectionsStore } from '../state';

export function useCreateInspection(): CreateInspectionViewProps {
  const [client, setClient] = useState<string>('');
  const [address, setAddress] = useState<string>('');

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
