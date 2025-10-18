import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Photo {
  id: string;
  uri: string;
  timestamp: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoPress?: (photo: Photo) => void;
  onDeletePhoto?: (photoId: string) => void;
}

export default function PhotoGallery({ photos, onPhotoPress, onDeletePhoto }: PhotoGalleryProps) {
  const renderPhoto = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => onPhotoPress?.(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDeletePhoto?.(item.id)}
      >
        <IconSymbol name="trash" size={16} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="camera" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No photos yet</Text>
        <Text style={styles.emptySubtext}>Take some photos to get started</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      renderItem={renderPhoto}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.galleryContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  galleryContainer: {
    padding: 10,
  },
  photoContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
