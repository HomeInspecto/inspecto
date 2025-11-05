import { View, Pressable } from 'react-native';
import Text from '@/components/views/text/text';
import { COLORS } from '@/constants/colors';

interface RadioGroupProps<T extends string> {
  value: T | null;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
}

export function RadioGroup<T extends string>({ value, onChange, options }: RadioGroupProps<T>) {
  return (
    <View style={{ gap: 8 }}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: pressed ? '#3a3a3b' : '#2e2e2f',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: value === option.value ? '#007AFF' : 'transparent',
          })}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: value === option.value ? '#007AFF' : '#aaa',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {value === option.value && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#007AFF',
                }}
              />
            )}
          </View>
          <Text style={{ color: value === option.value ? '#fff' : '#aaa' }}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}