import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
type MaterialIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

type SummaryStatCardProps = {
  icon: IoniconName | MaterialIconName;
  iconLibrary?: "ionicons" | "material";
  accent: string;
  label: string;
  value: string;
  change: string;
  iconColor?: string;
};

export function SummaryStatCard({
  icon,
  iconLibrary = "ionicons",
  accent,
  label,
  value,
  change,
  iconColor = P.dark,
}: SummaryStatCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            {iconLibrary === "material" ? (
              <MaterialCommunityIcons
                name={icon as MaterialIconName}
                size={20}
                color={iconColor}
              />
            ) : (
              <Ionicons name={icon as IoniconName} size={18} color={iconColor} />
            )}
          </View>
          <Text style={[styles.change, { color: accent }]}>{change}</Text>
        </View>

        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    minHeight: 108,
    borderRadius: 18,
    padding: 16,
    backgroundColor: P.background,
    borderWidth: 1.4,
    borderColor: P.cardBorder,
    shadowColor: P.black,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrap: {
    minHeight: 22,
    justifyContent: "center",
  },
  change: {
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    color: P.primary,
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: P.dark,
  },
});
