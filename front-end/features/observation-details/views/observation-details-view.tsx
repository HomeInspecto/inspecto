import { View, ScrollView } from 'react-native';
import Text from '@/components/views/text/text';
import type { Observation } from '@/features/edit-observation/state';
import IconButton from '@/components/views/icon-button/icon-button';
import { COLORS } from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/views/icon/icon';

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
          paddingBottom: 40,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <IconButton icon="chevron.left" size="sm" onPress={onGoBack} />
        <Text variant="headline" weight="emphasized">
          inspection details
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
        </View>

        {observation.severity ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon
              name={
                observation.severity === 'critical'
                  ? 'exclamationmark.triangle.fill'
                  : observation.severity === 'medium'
                    ? 'exclamationmark.circle.fill'
                    : 'checkmark.circle.fill'
              }
              size={18}
              color={
                observation.severity === 'critical'
                  ? COLORS.severity.critical
                  : observation.severity === 'medium'
                    ? COLORS.severity.medium
                    : COLORS.severity.low
              }
            />
            <Text variant="body" weight="emphasized">
              {observation.severity}
            </Text>
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

