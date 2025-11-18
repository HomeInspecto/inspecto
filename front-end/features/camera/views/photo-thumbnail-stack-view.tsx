import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import IconButton from '@/components/views/icon-button/icon-button';
import type { Photo } from '@/features/edit-observation/state';

export interface PhotoThumbnailStackViewProps {
  photos: Photo[];
  onPress: () => void;
}

export default function PhotoThumbnailStackView({ photos, onPress }: PhotoThumbnailStackViewProps) {
  if (photos.length === 0) return null;

  const thumbnailWidth = 90;
  const thumbnailHeight = 120;
  const stackOffset = 4;
  const borderRadius = 8;

  const photosToShow = Math.min(photos.length - 1, 3);

  return (
    <Pressable onPress={onPress} style={{ position: 'relative', width: thumbnailWidth, height: thumbnailHeight }}>
      {photos.length > 1 && photos.slice(-photosToShow - 1, -1).map((photo, index) => {
        const reverseIndex = photosToShow - 1 - index;
        const offset = (reverseIndex + 1) * stackOffset;
        const scale = 1 - (reverseIndex + 1) * 0.05;
        const scaledWidth = thumbnailWidth * scale;
        const scaledHeight = thumbnailHeight * scale;
        const leftOffset = (thumbnailWidth - scaledWidth) / 2;
        return (
          <View
            key={photo.id}
            style={{
              position: 'absolute',
              top: -offset,
              left: leftOffset,
              width: scaledWidth,
              height: scaledHeight,
              borderRadius: borderRadius,
              overflow: 'hidden',
              borderWidth: 0.5,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </View>
        );
      })}
      <View
        style={{
          width: thumbnailWidth,
          height: thumbnailHeight,
          borderRadius: borderRadius,
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          position: 'relative',
        }}
      >
        <Image
          source={{ uri: photos[photos.length - 1].uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        <View
          style={{ position: 'absolute', top: (thumbnailHeight - 40) / 2, left: (thumbnailWidth - 40) / 2, pointerEvents: 'none', }}
        >
          <IconButton size="sm" icon="square.and.pencil" color="primary" />
        </View>
      </View>
    </Pressable>
  );
}

