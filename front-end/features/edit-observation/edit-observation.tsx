import { COLORS } from '@/constants/colors';
import { AddFieldNote } from '@/features/add-field-note/add-field-note';
import PhotoEditor from '@/features/photo-editor/photo-editor';
import { View } from 'react-native';
import { FilmStrip } from '../photo-editor/film-strip';
import { useRef } from 'react';
import type { BottomSheetRef } from '@/components/views/bottom-sheet/bottom-sheet';
import { LogObservation } from '../log-observation/log-observation';
import Sheet from '@/components/views/bottom-sheet/bottom-sheet';

export default function EditObservation() {
  const ref = useRef<BottomSheetRef>(null);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: COLORS.pageBackground,
        position: 'relative',
      }}
    >
      <View style={{ aspectRatio: '3 / 4' }}>
        <PhotoEditor />
      </View>

      <View
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          backgroundColor: '#2e2e2f',
          paddingBottom: 108, // hard coded value on text input height. not sure what the better way to do this is
        }}
      >
        <FilmStrip />
      </View>
      <AddFieldNote bottomSheetRef={ref} />

      <Sheet ref={ref} initialIndex={-1}>
        <LogObservation />
      </Sheet>
    </View>
  );
}
