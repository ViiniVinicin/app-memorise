import { Palette as P } from "@/constants/palette";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  color,
  size,
  focused,
  activeIcon,
  inactiveIcon,
}: {
  color: string;
  size: number;
  focused: boolean;
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
}) {
  return (
    <Ionicons
      name={focused ? activeIcon : inactiveIcon}
      size={size}
      color={color}
    />
  );
}

export default function TabLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: P.dark,
        tabBarInactiveTintColor: P.secondaryMuted,
        tabBarStyle: {
          backgroundColor: P.background,
          borderTopColor: P.stroke,
          height: 82,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.medium,
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              color={color}
              size={size}
              focused={focused}
              activeIcon="home"
              inactiveIcon="home-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Biblioteca",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              color={color}
              size={size}
              focused={focused}
              activeIcon="library"
              inactiveIcon="library-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: "Status",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              color={color}
              size={size}
              focused={focused}
              activeIcon="stats-chart"
              inactiveIcon="stats-chart-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              color={color}
              size={size}
              focused={focused}
              activeIcon="person-circle"
              inactiveIcon="person-circle-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}
