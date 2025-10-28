import type { Photo } from '@/features/edit-observation/state';
import { Image } from 'expo-image';
import { View } from 'react-native';

interface FilmStripViewProps {
  photos: Photo[];
  activeIndex: number;
}

export function FilmStripView({ photos, activeIndex }: FilmStripViewProps) {
  const before = photos.slice(0, activeIndex);
  const after = photos.slice(activeIndex + 1);

  const activePhoto = photos[activeIndex];

  const activeWidth = 70;
  const width = 53;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            right: 16,
            transform: [{ translateX: -activeWidth }], // move right by photo width
            flexDirection: 'row',
            gap: 6,
          }}
        >
          {before.map(photo => (
            <Image
              style={{
                width: width,
                height: activeWidth,
                borderRadius: 6,
              }}
              source={{ uri: photo.uri }}
              contentFit="cover"
            />
          ))}
        </View>

        <Image
          key={activePhoto.id}
          style={{
            width: activeWidth,
            height: activeWidth,
            borderRadius: 6,
          }}
          source={{ uri: activePhoto.uri }}
          contentFit="cover"
        />

        <View
          style={{
            position: 'absolute',
            left: 16,
            transform: [{ translateX: activeWidth }], // move right by photo width
            flexDirection: 'row',
            gap: 6,
          }}
        >
          {after.map(photo => (
            <Image
              style={{
                width: width,
                height: activeWidth,
                borderRadius: 6,
              }}
              source={{ uri: photo.uri }}
              contentFit="cover"
            />
          ))}
        </View>
      </View>
    </View>
  );
}
