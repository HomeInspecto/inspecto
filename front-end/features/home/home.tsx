import { Pressable, StyleSheet } from 'react-native';
import Text from '@/components/views/text/text';
import { View } from 'react-native';
import { COLORS } from '@/constants/colors';
import TextInput from '@/components/views/text-input/text-input';
import { router } from 'expo-router';
import { InspectionsList } from './inspections-list/inspections-list';
import Button from '@/components/views/button/button';
import IconButton from '@/components/views/icon-button/icon-button';

export default function Home() {
  function handleGotoInspection() {
    // go to the inspections list screen
    router.push('/active-inspection/123id');
    // or replace history: router.replace("/inspections");
  }

  function handleGotoCreateInspection() {
    // go to the inspections list screen
    router.push('/create-inspection');
    // or replace history: router.replace("/inspections");
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        gap: 24,
        backgroundColor: COLORS.pageBackground,
      }}
    >
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

        <TextInput
          value={''}
          placeholder="Enter your email"
          leftIcon="mail-outline"
          rightIcon="close"
        />
      </View>

      <View>
        <Pressable onPress={handleGotoInspection}>
          <Text variant="title1" weight="emphasized">
            Inspection 1
          </Text>
        </Pressable>
      </View>

      <InspectionsList />

      <IconButton icon="TODO-add-plus-button" onPress={handleGotoCreateInspection} />
    </View>
  );
}
