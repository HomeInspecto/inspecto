import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Text from '../text/text';
import { COLORS } from '@/constants/colors';
import { Icon } from '../icon/icon';

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: {
    name: string;
    value: string;
  }[];
}

export function RadioGroup({ value, onValueChange, options }: RadioGroupProps) {
  const [selected, setSelected] = useState(value);

  return (
    <View
      style={{
        width: '100%',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        backgroundColor: COLORS.material.secondary.fill,
        borderColor: COLORS.material.secondary.stroke,
        borderWidth: 1,
      }}
    >
      {options.map(option => {
        const isSelected = selected === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => {
              setSelected(option.value);
              onValueChange(option.value);
            }}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text
              variant="body"
              weight="regular"
              color={isSelected ? 'on-dark-primary' : 'on-dark-secondary'}
            >
              {option.name}
            </Text>

            <View
              style={{
                borderRadius: '100%',
                width: 32,
                height: 32,
                backgroundColor: isSelected ? COLORS.material.primary.fill : 'transparent',
                borderColor: isSelected
                  ? COLORS.material.primary.fill
                  : COLORS.label.onDark.tertiary,
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {isSelected && (
                <Icon name={'checkmark'} size={16} color={COLORS.label.onLight.primary} />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
