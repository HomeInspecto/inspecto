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
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  function goToLogObservation() { bottomSheetRef?.current?.snapToIndex(2); }

  return (
    <View
      style={{ flex: 1, backgroundColor: COLORS.pageBackground, position: 'relative', }}
    >
      <PhotoEditor />
      <View
        style={{
          position: 'absolute',
          bottom: 94,
          left: 0,
          right: 0,
          backgroundColor: COLORS.pageBackground,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        <FilmStrip />
      </View>
      <AddFieldNote goToLogObservation={goToLogObservation} />

      <Sheet ref={bottomSheetRef} initialIndex={-1}>
        <LogObservation />
      </Sheet>
    </View>
  );
}
