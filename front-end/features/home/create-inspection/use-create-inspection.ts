import { useCallback, useState } from 'react';
import type { CreateInspectionViewProps } from './create-inspection-view';
import { router } from 'expo-router';
import { useInspectionsStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { useActiveObservationStore } from '@/features/edit-observation/state';
import { authService } from '@/services/auth';
import { API_BASE_URL } from '@/services/api';

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

  async function createPropertyFromAddress(address: string) {
    const res = await fetch(`${API_BASE_URL}/api/properties/createProperty`, {
      method: 'POST',
      headers: {
        ...(await authService.authHeaders()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_line1: address,
        address_line2: '',
        unit: '',
        city: '',
        region: '',
        postal_code: '',
        country: '',
        year_built: 0,
      }),
    });

    if (!res.ok) {
      console.error('Property create error:', await res.text());
      alert('Failed to create property');
      return null;
    }

    return res.json();
  }

  async function createInspection(propertyId: string) {
    const user = await authService.getUser();
    if (!user || !user.id) {
      throw new Error('User is not logged in – cannot create inspection.');
    }

    const res = await fetch(`${API_BASE_URL}/api/inspections/createInspection`, {
      method: 'POST',
      headers: {
        ...(await authService.authHeaders()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspector_id: user.id,
        property_id: propertyId,
        status: 'draft',
        scheduled_for: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.error('Inspection create error:', await res.text());
      alert('Failed to create inspection');
      return null;
    }

    return res.json();
  }

  const onCreate = useCallback(async () => {
    if (!client || !address) return;

    const createdProperty = await createPropertyFromAddress(address);
    const propertyId = createdProperty.property[0].id;

    const createdInspection = await createInspection(propertyId);
    const inspectionId = createdInspection.id;

    useInspectionsStore.getState().createInspection({
      id: inspectionId,
      client,
      address,
      createdAt: Date.now(),
    });

    clearObservation();

    router.push(`/active-inspection/${inspectionId}`);
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
