import { InputField } from "@/components/ui/input-field";
import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CreateDeckModalProps = {
  visible: boolean;
  deckTitle: string;
  isSubmitting: boolean;
  onChangeTitle: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function CreateDeckModal({
  visible,
  deckTitle,
  isSubmitting,
  onChangeTitle,
  onClose,
  onSubmit,
}: CreateDeckModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="add-circle-outline" size={20} color={P.primary} />
            </View>

            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={P.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Criar novo deck</Text>
          <Text style={styles.subtitle}>
            Escolha um nome e o app prepara o deck para voce continuar.
          </Text>

          <InputField
            label="Titulo"
            placeholder="Ex.: Ingles avancado"
            value={deckTitle}
            onChangeText={onChangeTitle}
            autoCapitalize="sentences"
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isSubmitting ? styles.disabledButton : null,
              ]}
              onPress={onSubmit}
              activeOpacity={0.85}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Criando..." : "Criar deck"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: P.darkOverlay,
  },
  card: {
    backgroundColor: P.background,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: P.stroke,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: P.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: P.textMuted,
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: P.stroke,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: P.white,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
    color: P.dark,
  },
  primaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: P.dark,
  },
  primaryButtonText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: P.white,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
