import { Pressable, StyleSheet } from 'react-native';
import Text from '@/components/views/text/text';
import { View } from 'react-native';
import { COLORS } from '@/constants/colors';
import TextInput from '@/components/views/text-input/text-input';
import { router } from 'expo-router';
import { InspectionsList } from './inspections-list/inspections-list';
import IconButton from '@/components/views/icon-button/icon-button';
import Button from '@/components/views/button/button';
import { useAuthStore } from '@/store/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function Home() {
  const { logout } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [showDropdown, setShowDropdown] = useState(false);

  function handleGotoCreateInspection() {
    router.push('/create-inspection');
  }

  function handleProfilePress() {
    setShowDropdown(!showDropdown);
  }

  async function handleSignOut() {
    setShowDropdown(false);
    await logout();
    router.replace('/');
  }

  function handleOverlayPress() {
    setShowDropdown(false);
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
      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onPress={handleOverlayPress}
        />
      )}

      {/* Header with Profile Avatar */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 20,
          left: 0,
          right: 0,
          height: 40,
          paddingHorizontal: 16,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          zIndex: 1000,
          pointerEvents: 'box-none',
        }}
      >
        <View pointerEvents="auto" style={{ position: 'relative' }}>
          <IconButton
            icon="person.fill"
            size="md"
            onPress={handleProfilePress}
            accessibilityLabel="Profile menu"
          />
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <View
              style={{
                position: 'absolute',
                top: 58, // Below the button (50px button height + 8px gap)
                right: 0,
                minWidth: 150,
                backgroundColor: COLORS.material.secondary.fill,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.material.secondary.stroke,
                paddingVertical: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => ({
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text variant="callout" style={{ color: COLORS.label.onDark.primary }}>
                  Sign Out
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <View
        style={{
          gap: 16,
        }}
      >
        <View>
          <Text variant="footnote" weight="emphasized">
            Tuesday, OCT 21
          </Text>
          <Text variant="title1" weight="emphasized">
            Lockwood Inc.
          </Text>
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
