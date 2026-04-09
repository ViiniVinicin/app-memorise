import { Palette as P } from '@/constants/palette';
import { Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface InputFieldProps extends TextInputProps {
  label: string;
  leftIcon?: IoniconName;
  /** Renders eye-toggle and treats field as password */
  password?: boolean;
  /** Override input background (default: white) */
  bgColor?: string;
}

export function InputField({
  label,
  leftIcon,
  password = false,
  bgColor = P.white,
  style,
  ...props
}: InputFieldProps) {
  const [hidden, setHidden] = useState(password);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.row, { backgroundColor: bgColor }]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={P.textMuted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, style]}
          secureTextEntry={hidden}
          placeholderTextColor={P.textMuted}
          autoCapitalize="none"
          {...props}
        />

        {password && (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={P.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: P.dark,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: P.stroke,
    height: 52,
    paddingHorizontal: 14,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: P.dark,
    height: '100%',
  },
});