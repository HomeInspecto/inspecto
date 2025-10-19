import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Dimensions } from 'react-native';
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
  lastGalleryVisit?: number;
}

export default function PhotoGallery({ photos, onPhotoPress, onDeletePhoto, lastGalleryVisit = 0 }: PhotoGalleryProps) {
  // Calculate responsive grid based on screen size and platform
  const screenWidth = Dimensions.get('window').width;
  const getNumColumns = () => {
    if (Platform.OS === 'web') {
      // Web: More columns for larger screens
      if (screenWidth >= 1200) return 6; // Large desktop
      if (screenWidth >= 900) return 5;  // Desktop
      if (screenWidth >= 768) return 4;  // Tablet
      return 3; // Mobile web
    }
    // Mobile: Keep 2 columns for better touch interaction
    return 2;
  };

  const numColumns = getNumColumns();
  const marginBetween = 8; // Margin between thumbnails
  const containerPadding = 20; // Total horizontal padding
  const totalMarginSpace = (numColumns - 1) * marginBetween;
  const itemWidth = (screenWidth - containerPadding - totalMarginSpace) / numColumns;

  const renderPhoto = ({ item }: { item: Photo }) => {
        try {
          const isNew = item.timestamp > lastGalleryVisit;
          
          return (
        <TouchableOpacity
          style={[
            styles.photoContainer,
            { 
              width: itemWidth,
              marginRight: marginBetween,
              marginBottom: marginBetween
            },
            isNew && styles.newPhotoContainer
          ]}
          onPress={() => onPhotoPress?.(item)}
        >
          <Image 
            source={{ uri: item.uri }} 
            style={styles.photo}
            onError={(error) => {
              // Silently handle image load errors
            }}
          />
          {isNew && (
            <View style={styles.newPhotoBadge}>
              <Text style={styles.newPhotoText}>NEW</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeletePhoto?.(item.id)}
          >
            <IconSymbol name="trash" size={Platform.OS === 'web' ? 12 : 16} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      );
        } catch {
          return null;
        }
  };

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
      numColumns={numColumns}
      contentContainerStyle={styles.galleryContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  galleryContainer: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoContainer: {
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
    borderRadius: Platform.OS === 'web' ? 12 : 15,
    width: Platform.OS === 'web' ? 24 : 30,
    height: Platform.OS === 'web' ? 24 : 30,
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
  newPhotoContainer: {
    borderWidth: 4,
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    shadowColor: '#00FF00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  newPhotoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  newPhotoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
