import { View, ScrollView } from 'react-native';
import Text from '@/components/views/text/text';
import type { Observation } from '@/features/edit-observation/state';
import IconButton from '@/components/views/icon-button/icon-button';
import { COLORS } from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ObservationDetailsViewProps {
  inspectionId: string;
  observationId: string;
  observation?: Observation;
  onGoBack: () => void;
}

export function ObservationDetailsView({
  inspectionId,
  observationId,
  observation,
  onGoBack,
}: ObservationDetailsViewProps) {
  if (!observation) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{
          flex: 1,
          backgroundColor: COLORS.pageBackground,
          padding: 16,
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <Text variant="title3" weight="emphasized">
          Observation not found
        </Text>
        <Text variant="body" color="on-dark-secondary">
          Inspection ID: {inspectionId || 'Unknown'}
        </Text>
        <Text variant="body" color="on-dark-secondary">
          Observation ID: {observationId || 'Unknown'}
        </Text>
        <IconButton icon="chevron.left" size="sm" onPress={onGoBack} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: COLORS.pageBackground }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <IconButton icon="chevron.left" size="sm" onPress={onGoBack} />
        <Text variant="headline" weight="emphasized">
          Observation details
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
          gap: 24,
        }}
      >
        <View style={{ gap: 8 }}>
          <Text variant="title1" weight="emphasized">
            {observation.name || observationId}
          </Text>
          <Text variant="body" color="on-dark-secondary">
            Inspection: {inspectionId || 'Unknown'}
          </Text>
        </View>

        {observation.severity ? (
          <View style={{ gap: 4 }}>
            <Text variant="headline" weight="emphasized">
              Severity
            </Text>
            <Text variant="body">{observation.severity}</Text>
          </View>
        ) : null}

        {observation.section ? (
          <View style={{ gap: 4 }}>
            <Text variant="headline" weight="emphasized">
              Section
            </Text>
            <Text variant="body">{observation.section}</Text>
          </View>
        ) : null}

        {observation.description ? (
          <View style={{ gap: 4 }}>
            <Text variant="headline" weight="emphasized">
              Description
            </Text>
            <Text variant="body">{observation.description}</Text>
          </View>
        ) : null}

        {observation.implications ? (
          <View style={{ gap: 4 }}>
            <Text variant="headline" weight="emphasized">
              Implications
            </Text>
            <Text variant="body">{observation.implications}</Text>
          </View>
        ) : null}

        {observation.recommendation ? (
          <View style={{ gap: 4 }}>
            <Text variant="headline" weight="emphasized">
              Recommendation
            </Text>
            <Text variant="body">{observation.recommendation}</Text>
          </View>
        ) : null}

        {observation.fieldNote ? (
          <View style={{ gap: 4 }}>
            <Text variant="headline" weight="emphasized">
              Field Note
            </Text>
            <Text variant="body">{observation.fieldNote}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

