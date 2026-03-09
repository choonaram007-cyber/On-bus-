import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import type { BusRoute } from "@/lib/firebase";

function RouteCard({
  id,
  route,
  stationName,
  busCount,
}: {
  id: string;
  route: BusRoute;
  stationName: (s: string) => string;
  busCount: number;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() =>
        router.push({
          pathname: "/bus-results",
          params: { fromId: route.fromStation, toId: route.toStation },
        })
      }
      activeOpacity={0.75}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
        <View style={[styles.busCountTag, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
          <Ionicons name="bus" size={12} color={colors.primary} />
          <Text style={[styles.busCountText, { color: colors.primary }]}>{busCount} बसें</Text>
        </View>
      </View>

      <View style={styles.stationRow}>
        <View style={styles.stationInfo}>
          <View style={[styles.dotOrange, { backgroundColor: colors.primary }]} />
          <Text style={[styles.stationName, { color: colors.text }]}>{stationName(route.fromStation)}</Text>
        </View>
        <View style={styles.distanceLine}>
          <View style={[styles.dottedLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.distanceText, { color: colors.textMuted }]}>{route.totalDistance}</Text>
          <View style={[styles.dottedLine, { backgroundColor: colors.border }]} />
        </View>
        <View style={[styles.stationInfo, { justifyContent: "flex-end" }]}>
          <View style={[styles.dotGray, { backgroundColor: colors.textMuted }]} />
          <Text style={[styles.stationName, { color: colors.text, textAlign: "right" }]}>{stationName(route.toStation)}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.detailText, { color: colors.textMuted }]}>यात्रा: {route.forwardTravelTime}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="map-marker-path" size={14} color={colors.textMuted} />
          <Text style={[styles.detailText, { color: colors.textMuted }]}>{route.stops.length} स्टॉप</Text>
        </View>
      </View>

      <View style={[styles.stopsList, { backgroundColor: colors.surface2 }]}>
        {route.stops.map((stop, i) => (
          <View key={i} style={styles.stopItem}>
            <View style={[styles.stopDot, i === 0 || i === route.stops.length - 1 ? { backgroundColor: colors.primary } : { backgroundColor: colors.textMuted }]} />
            <Text style={[styles.stopName, { color: colors.textSecondary }]}>{stationName(stop.stationId)}</Text>
            <Text style={[styles.stopDist, { color: colors.textMuted }]}>{stop.distance}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function RoutesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { routes, stations, buses, isLoading } = useFirebase();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const stationName = (id: string) => stations[id]?.name ?? id;
  const routeEntries = Object.entries(routes);
  const getBusCount = (routeId: string) =>
    Object.values(buses).filter((b) => b.routeId === routeId).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>सभी मार्ग</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>{routeEntries.length} मार्ग उपलब्ध</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : routeEntries.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="map" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>कोई मार्ग नहीं मिला</Text>
        </View>
      ) : (
        <FlatList
          data={routeEntries}
          keyExtractor={([id]) => id}
          renderItem={({ item: [id, route] }) => (
            <RouteCard id={id} route={route} stationName={stationName} busCount={getBusCount(id)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routeName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    flex: 1,
  },
  busCountTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  busCountText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  stationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stationInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dotOrange: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGray: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  stationName: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  distanceLine: {
    alignItems: "center",
    gap: 3,
  },
  dottedLine: {
    width: 20,
    height: 1,
  },
  distanceText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  stopsList: {
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stopName: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  stopDist: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 80,
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
  },
});
