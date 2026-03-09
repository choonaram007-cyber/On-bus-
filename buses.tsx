import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import type { Bus } from "@/lib/firebase";

function BusCard({
  id,
  bus,
  stationName,
  isFav,
  onToggleFav,
}: {
  id: string;
  bus: Bus;
  stationName: (sid: string) => string;
  isFav: boolean;
  onToggleFav: () => void;
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
        <View style={styles.busInfo}>
          <View style={[styles.codeTag, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <Text style={[styles.codeText, { color: colors.primary }]}>{bus.busCode}</Text>
          </View>
          <View>
            <Text style={[styles.busName, { color: colors.text }]}>{bus.busName}</Text>
            <Text style={[styles.busNumber, { color: colors.textMuted }]}>{bus.busNumber}</Text>
          </View>
        </View>
        <View style={styles.fareBox}>
          <Text style={[styles.fareAmt, { color: colors.primary }]}>{bus.fare}</Text>
          <TouchableOpacity onPress={onToggleFav} style={styles.heartBtn}>
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? "#EF4444" : colors.textMuted} />
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
        <View style={styles.tagRow}>
          <View style={[styles.typeTag, { backgroundColor: colors.surface2 }]}>
            <Ionicons name="bus" size={12} color={colors.textSecondary} />
            <Text style={[styles.typeTagText, { color: colors.textSecondary }]}>{bus.type}</Text>
          </View>
          <View style={[styles.crowdTag, { backgroundColor: crowdColor + "22" }]}>
            <View style={[styles.crowdDot, { backgroundColor: crowdColor }]} />
            <Text style={[styles.crowdText, { color: crowdColor }]}>{bus.crowd}</Text>
          </View>
        </View>
        <View style={styles.seatsRow}>
          <Ionicons name="person" size={12} color={colors.textMuted} />
          <Text style={[styles.seatsText, { color: colors.textMuted }]}>{bus.availableSeats} सीटें उपलब्ध</Text>
        </View>
      </View>

      <View style={styles.tripsRow}>
        {bus.trips.slice(0, 3).map((t) => (
          <View key={t.id} style={[styles.tripChip, { backgroundColor: colors.surface2, borderColor: t.delay > 0 ? colors.warning + "44" : colors.border }, t.delay > 0 && { backgroundColor: colors.warning + "11" }]}>
            <Ionicons name="time-outline" size={11} color={t.delay > 0 ? colors.warning : colors.textSecondary} />
            <Text style={[styles.tripTime, { color: t.delay > 0 ? colors.warning : colors.textSecondary }]}>{t.departure}</Text>
            {t.delay > 0 && <Text style={[styles.delayText, { color: colors.warning }]}>+{t.delay}m</Text>}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function BusesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { buses, stations, isLoading } = useFirebase();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [search, setSearch] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const stationName = (id: string) => stations[id]?.name ?? id;

  const filtered = Object.entries(buses).filter(([, b]) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.busName.toLowerCase().includes(q) ||
      b.busNumber.toLowerCase().includes(q) ||
      stationName(b.fromStation).includes(q) ||
      stationName(b.toStation).includes(q)
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>सभी बसें</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>{Object.keys(buses).length} बसें उपलब्ध</Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="बस नाम या नंबर खोजें..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bus" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>कोई बस नहीं मिली</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={([id]) => id}
          renderItem={({ item: [id, bus] }) => (
            <BusCard
              id={id}
              bus={bus}
              stationName={stationName}
              isFav={isFavorite(id)}
              onToggleFav={() => toggleFavorite(id)}
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    padding: 0,
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
  busInfo: {
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
  fareBox: {
    alignItems: "flex-end",
    gap: 4,
  },
  fareAmt: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagRow: {
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
  seatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seatsText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  tripsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  tripChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  tripTime: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  delayText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
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
