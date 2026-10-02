import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.backgroundElement,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <ThemedText type="small" style={{ color: selected ? theme.accentText : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type Option<T> = { value: T; label: string };

type SingleSelectProps<T> = {
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
};

export function SingleSelect<T extends string | number>({ options, value, onChange }: SingleSelectProps<T>) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => (
        <Chip
          key={String(option.value)}
          label={option.label}
          selected={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

type MultiSelectProps<T> = {
  options: Option<T>[];
  values: T[];
  onChange: (values: T[]) => void;
};

export function MultiSelect<T extends string>({ options, values, onChange }: MultiSelectProps<T>) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <Chip
            key={option.value}
            label={option.label}
            selected={selected}
            onPress={() =>
              onChange(selected ? values.filter((v) => v !== option.value) : [...values, option.value])
            }
          />
        );
      })}
    </View>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

export function TextField(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[
        styles.input,
        { backgroundColor: theme.backgroundElement, color: theme.text },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: Spacing.one + Spacing.half,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    fontSize: 16,
    paddingVertical: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two + Spacing.one,
  },
});
