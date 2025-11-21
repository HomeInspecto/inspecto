import { View, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '@/components/views/text/text';
import TextInput from '@/components/views/text-input/text-input';
import Button from '@/components/views/button/button';
import type { Severity } from '@/features/edit-observation/state';
import { RadioGroup } from '@/components/views/radio-group/radio-group';
import IconButton from '@/components/views/icon-button/icon-button';
import { COLORS } from '@/constants/colors';

export interface LogObservationProps {
  onLog: () => void;
  onGoBack?: () => void;
  isStandalone?: boolean;
  name: string;
  description: string;
  implication: string;
  recommendation: string;

  section: string;
  severity: Severity;
  sectionOptions: { name: string; value: string }[];


  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setImplication: (value: string) => void;
  setRecommendation: (value: string) => void;

  setSection: (value: LogObservationProps['section']) => void;
  setSeverity: (value: LogObservationProps['severity']) => void;
}



export const LogObservationView = ({
  onLog,
  onGoBack,
  isStandalone,
  name,
  description,
  implication,
  recommendation,
  section,
  severity,
  setName,
  setDescription,
  setImplication,
  setRecommendation,
  setSection,
  setSeverity,
  sectionOptions,
}: LogObservationProps) => {
  const content = (
    <View style={{ gap: 20 }}>
      <Text variant="title3" style={{ textAlign: 'center' }}>
        Edit observation
      </Text>

      <View style={{ gap: 12 }}>
        <Text variant="headline">Observation name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Observation name" />
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="headline">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue or observation"
          multiline
        />
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="headline">Implication</Text>
        <TextInput
          value={implication}
          onChangeText={setImplication}
          placeholder="What are the potential impacts?"
          multiline
        />
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="headline">Recommendation</Text>
        <TextInput
          value={recommendation}
          onChangeText={setRecommendation}
          placeholder="Recommended action or next steps"
          multiline
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text variant="headline">Section</Text>
        {/* TODO: Replace with RadioGroup */}
        <RadioGroup
          value={section ?? ''}
          onValueChange={setSection}
          options={sectionOptions}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text variant="headline">Severity</Text>
        <RadioGroup
          value={severity ?? ''} // handle null/undefined nicely
          onValueChange={value => setSeverity(value as Severity)}
          options={[
            { name: 'Critical', value: 'critical' },
            { name: 'Medium', value: 'medium' },
            { name: 'Low', value: 'low' },
          ]}
        />
      </View>


      <Button icon="plus" text="Log observation" onPress={onLog} disabled={isStandalone}></Button>
    </View>
  );

  if (onGoBack) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: COLORS.pageBackground }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <IconButton icon="chevron.left" size="sm" onPress={onGoBack} />
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {content}
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }

  return content;
};
