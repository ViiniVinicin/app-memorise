import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { DeckInsight } from "@/service/dashboard.service";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type DeckRowCardProps = {
  deck: DeckInsight;
  onPress?: () => void;
};

const SUPPORTED_ICONS: IoniconName[] = [
  "book-outline",
  "globe-outline",
  "code-slash-outline",
  "flask-outline",
  "leaf-outline",
  "calculator-outline",
  "language-outline",
  "bulb-outline",
  "school-outline",
];

function resolveDeckIcon(title: string, icon: string | null): IoniconName {
  if (icon && SUPPORTED_ICONS.includes(icon as IoniconName)) {
    return icon as IoniconName;
  }

  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("ingles") || normalizedTitle.includes("idioma")) {
    return "globe-outline";
  }

  if (
    normalizedTitle.includes("logica") ||
    normalizedTitle.includes("program") ||
    normalizedTitle.includes("codigo")
  ) {
    return "code-slash-outline";
  }

  if (
    normalizedTitle.includes("bio") ||
    normalizedTitle.includes("quim") ||
    normalizedTitle.includes("fis")
  ) {
    return "flask-outline";
  }

  if (normalizedTitle.includes("math") || normalizedTitle.includes("calc")) {
    return "calculator-outline";
  }

  return "book-outline";
}

function badgeStyles(tone: DeckInsight["badgeTone"]) {
  switch (tone) {
    case "success":
      return {
        backgroundColor: P.successBadgeBg,
        color: P.success,
      };
    case "info":
      return {
        backgroundColor: P.infoBadgeBg,
        color: P.info,
      };
    case "warning":
      return {
        backgroundColor: P.warningBadgeBg,
        color: P.warning,
      };
    default:
      return {
        backgroundColor: P.containerBg,
        color: P.dark,
      };
  }
}

export function DeckRowCard({ deck, onPress }: DeckRowCardProps) {
  const badge = badgeStyles(deck.badgeTone);
  const iconName = resolveDeckIcon(deck.title, deck.icon);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${deck.color}22` }]}>
          <Ionicons name={iconName} size={24} color={deck.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {deck.title}
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: badge.backgroundColor },
              ]}
            >
              <Text style={[styles.badgeText, { color: badge.color }]}>
                {deck.badgeLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.meta}>
            {deck.totalCards} cards • {deck.progress}% dominado
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${deck.progress}%`,
                  backgroundColor: deck.color,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: P.whiteCardStrong,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
  meta: {
    fontSize: 13,
    color: P.textMuted,
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: P.darkSubtle,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});
