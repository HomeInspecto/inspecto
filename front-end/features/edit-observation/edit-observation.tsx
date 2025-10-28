import { COLORS } from '@/constants/colors';
import { AddObservationNote } from '@/features/add-observation-note/add-observation-note';
import PhotoEditor from '@/features/photo-editor/photo-editor';
import { View } from 'react-native';
import { FilmStrip } from '../photo-editor/film-strip';

export default function EditObservation() {
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
      <AddObservationNote />
    </View>
  );
}
