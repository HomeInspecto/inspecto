import Text from '@/components/views/text/text';
import { View } from 'react-native';
import type { AddObservationProps } from '../add-observation-note';
import TextInput from '@/components/views/text-input/text-input';

export const AddObservationNoteView = ({
  note,
  onMicStart,
  onMicStop,
  onNextPress,
}: AddObservationProps) => (
  <TextInput value="" placeholder="Write a field note" numberOfLines={2} />
);
