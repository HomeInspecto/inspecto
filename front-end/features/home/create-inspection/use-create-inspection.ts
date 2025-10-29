import { useCallback, useState } from 'react';
import type { CreateInspectionViewProps } from './create-inspection-view';

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
    // placeholder: implement create logic here
    // e.g. validate and submit
    // console.log('create', { client, address });
  }, [client, address]);

  return {
    client,
    address,
    onClientChange,
    onAddressChange,
    onCreate,
  };
}
