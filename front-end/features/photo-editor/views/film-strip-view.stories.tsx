import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { FilmStripView } from './film-strip-view';

const SAMPLE_URI =
  'https://www.shutterstock.com/image-photo/outdoor-photo-picture-worn-out-600nw-2656214201.jpg';

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
}

const makePhotos = (count: number): Photo[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: `photo-${i + 1}`,
    uri: SAMPLE_URI,
    timestamp: Date.now() - i * 1000,
  }));

const meta: Meta<typeof FilmStripView> = {
  title: 'Features / Photo Editor / Film Strip View',
  component: FilmStripView,
  decorators: [
    Story => (
      <View style={{ maxWidth: 400, borderWidth: 2, borderColor: 'blue' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilmStripView>;

// Active index stories
export const ActiveAtZero: Story = {
  render: () => <FilmStripView photos={makePhotos(3)} activePhotoIndex={0} />,
};

export const ActiveInMiddle: Story = {
  render: () => {
    const photos = makePhotos(3);
    return <FilmStripView photos={photos} activePhotoIndex={Math.floor(photos.length / 2)} />;
  },
};

export const ActiveAtEnd: Story = {
  render: () => {
    const photos = makePhotos(3);
    return <FilmStripView photos={photos} activePhotoIndex={photos.length - 1} />;
  },
};

// Count variations
export const OnePhoto: Story = {
  render: () => <FilmStripView photos={makePhotos(1)} activePhotoIndex={0} />,
};

export const TenPhotos: Story = {
  render: () => <FilmStripView photos={makePhotos(10)} activePhotoIndex={5} />,
};
