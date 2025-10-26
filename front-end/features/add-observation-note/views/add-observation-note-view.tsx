import Text from '@/components/views/text';
import { View } from 'react-native';
import type { AddObservationProps } from '../add-observation-note';

export const AddObservationNoteView = ({
  note,
  onMicStart,
  onMicStop,
  onNextPress,
}: AddObservationProps) => (
  <View style={{ gap: 16 }}>
    <Text>What did you observe?</Text>

    <Text>Text area input placeholder</Text>
  </View>
);
