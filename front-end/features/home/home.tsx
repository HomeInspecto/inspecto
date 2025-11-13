import { Pressable, StyleSheet } from 'react-native';
import Text from '@/components/views/text/text';
import { View } from 'react-native';
import { COLORS } from '@/constants/colors';
import TextInput from '@/components/views/text-input/text-input';
import { router } from 'expo-router';
import { InspectionsList } from './inspections-list/inspections-list';
import IconButton from '@/components/views/icon-button/icon-button';
import Button from '@/components/views/button/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  function handleGotoCreateInspection() {
    router.push('/create-inspection');
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        paddingTop: 80,
        gap: 24,
        backgroundColor: COLORS.pageBackground,
      }}
    >
      <View
        style={{
          gap: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="footnote" weight="emphasized">
              Tuesday, OCT 21
            </Text>
            <Text variant="title1" weight="emphasized">
              Lockwood Inc.
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {user && (
              <Text variant="caption2" style={{ opacity: 0.7 }}>
                {user.email || user.name}
              </Text>
            )}
            <Pressable onPress={handleLogout}>
              <Text variant="caption2" style={{ color: COLORS.material.primary.fill }}>
                Logout
              </Text>
            </Pressable>
          </View>
        </View>

        <TextInput value={''} placeholder="Search" leftIcon="search" />
      </View>
      <InspectionsList />
      <View style={{ width: '100%', justifyContent: 'center', flexDirection: 'row' }}>
        <IconButton icon="plus" size="lg" onPress={handleGotoCreateInspection} />
      </View>

      {__DEV__ && (
        <Pressable onPress={() => router.push('/storybook')}>
          <Text variant="body">storybook (dev)</Text>
        </Pressable>
      )}
    </View>
  );
}
