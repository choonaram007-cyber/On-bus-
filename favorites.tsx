import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import type { Bus } from "@/lib/firebase";

function FavBusCard({
  id,
  bus,
  stationName,
  isFav,
  onToggle,
}: {
  id: string;
  bus: Bus;
  stationName: (s: string) => string;
  isFav: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const crowdColor =
    bus.crowd === "कम" ? colors.success : bus.crowd === "मध्यम" ? colors.warning : colors.error;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push({ pathname: "/bus-detail", params: { busId: id } })}
      activeOpacity={0.75}
    >
      <View style={styles.cardTop}>
        <View style={styles.leftInfo}>
          <View style={[styles.codeTag, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <Text style={[styles.codeText, { color: colors.primary }]}>{bus.busCode}</Text>
          </View>
          <View>
            <Text style={[styles.busName, { color: colors.text }]}>{bus.busName}</Text>
            <Text style={[styles.busNumber, { color: colors.textMuted }]}>{bus.busNumber}</Text>
          </View>
        </View>
        <View style={styles.rightActions}>
          <Text style={[styles.fareAmt, { color: colors.primary }]}>{bus.fare}</Text>
          <TouchableOpacity onPress={onToggle} style={styles.heartBtn}>
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#EF4444" : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.routeRow, { backgroundColor: colors.surface2 }]}>
        <Text style={[styles.routeStation, { color: colors.text }]} numberOfLines={1}>{stationName(bus.fromStation)}</Text>
        <View style={[styles.routeArrowBox, { backgroundColor: colors.primary + "22" }]}>
          <MaterialCommunityIcons name="bus-side" size={16} color={colors.primary} />
        </View>
        <Text style={[styles.routeStation, { color: colors.text, textAlign: "right" }]} numberOfLines={1}>{stationName(bus.toStation)}</Text>
      </View>

      <View style={styles.cardBottom}>
        <View style={[styles.typeTag, { backgroundColor: colors.surface2 }]}>
          <Ionicons name="bus" size={12} color={colors.textSecondary} />
          <Text style={[styles.typeTagText, { color: colors.textSecondary }]}>{bus.type}</Text>
        </View>
        <View style={[styles.crowdTag, { backgroundColor: crowdColor + "22" }]}>
          <View style={[styles.crowdDot, { backgroundColor: crowdColor }]} />
          <Text style={[styles.crowdText, { color: crowdColor }]}>{bus.crowd}</Text>
        </View>
        <View style={[styles.seatsTag, { backgroundColor: colors.surface2 }]}>
          <Ionicons name="person" size={12} color={colors.textMuted} />
          <Text style={[styles.seatsText, { color: colors.textMuted }]}>{bus.availableSeats} सीटें</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { buses, stations } = useFirebase();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const stationName = (id: string) => stations[id]?.name ?? id;

  const favBuses = favorites
    .filter((id) => buses[id])
    .map((id) => ({ id, bus: buses[id] }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>पसंदीदा</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>
          {favBuses.length > 0 ? `${favBuses.length} बसें सेव की हैं` : "कोई बस सेव नहीं"}
        </Text>
      </View>

      {favBuses.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart" size={56} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>कोई पसंदीदा नहीं</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            बस विवरण में दिल का बटन दबाकर बसें सेव करें
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/buses")}
          >
            <Text style={styles.browseBtnText}>बसें देखें</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favBuses}
          keyExtractor={({ id }) => id}
          renderItem={({ item: { id, bus } }) => (
            <FavBusCard
              id={id}
              bus={bus}
              stationName={stationName}
              isFav={isFavorite(id)}
              onToggle={() => toggleFavorite(id)}
            />
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
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  codeTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  codeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  busName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  busNumber: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  rightActions: {
    alignItems: "flex-end",
    gap: 4,
  },
  fareAmt: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  heartBtn: {
    padding: 2,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    padding: 10,
  },
  routeStation: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  routeArrowBox: {
    borderRadius: 6,
    padding: 4,
  },
  cardBottom: {
    flexDirection: "row",
    gap: 6,
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeTagText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  crowdTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  crowdDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  crowdText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  seatsTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seatsText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  browseBtn: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseBtnText: {
    color: "#09090B",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
