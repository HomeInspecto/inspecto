import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { COLORS } from '@/constants/colors';
import Input from '@/components/ui/input';
import { router } from 'expo-router';

function handleGotoInspection() {}

export default function HomeScreen() {
  function handleGotoInspection() {
    // go to the inspections list screen
    router.push('/active-inspection/123id');
    // or replace history: router.replace("/inspections");
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        gap: 24,
        backgroundColor: '#424245',
      }}
    >
      <View
        style={{
          gap: 16,
        }}
      >
        <View>
          <Text
            variant="footnote"
            weight="emphasized"
            style={{ color: COLORS.label.onDark.secondary }}
          >
            Tuesday, OCT 21
          </Text>
          <Text variant="title1" weight="emphasized" style={{ color: COLORS.label.onDark.primary }}>
            Lockwood Inc.
          </Text>
        </View>

        <Input
          value={''}
          placeholder="Enter your email"
          leftIcon="mail-outline"
          rightIcon="close"
        />
      </View>

      <View>
        <Pressable onPress={handleGotoInspection}>
          <Text variant="title1" weight="emphasized" style={{ color: COLORS.label.onDark.primary }}>
            Inspection 1
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
