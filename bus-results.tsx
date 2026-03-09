import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import type { Bus } from "@/lib/firebase";

function BusResultCard({
  id,
  bus,
  stationName,
  isFav,
  onToggleFav,
}: {
  id: string;
  bus: Bus;
  stationName: (id: string) => string;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const { colors } = useTheme();
  const crowdColor =
    bus.crowd === "कम" ? colors.success : bus.crowd === "मध्यम" ? colors.warning : colors.error;
  const forwardTrips = bus.trips.filter((t) => !t.isReturnTrip);

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
        <View style={styles.rightCol}>
          <View style={[styles.fareBox, { backgroundColor: colors.primary + "11", borderColor: colors.primary + "33" }]}>
            <Text style={[styles.fareAmt, { color: colors.primary }]}>{bus.fare}</Text>
          </View>
          <TouchableOpacity onPress={onToggleFav} style={styles.heartBtn}>
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? "#EF4444" : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.busTypeRow}>
        <View style={[styles.typeTag, { backgroundColor: colors.surface2 }]}>
          <Ionicons name="bus" size={12} color={colors.textSecondary} />
          <Text style={[styles.typeText, { color: colors.textSecondary }]}>{bus.type}</Text>
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

      {forwardTrips.length > 0 && (
        <View style={styles.tripsSection}>
          <Text style={[styles.tripsLabel, { color: colors.textMuted }]}>यात्रा समय:</Text>
          <View style={styles.tripsGrid}>
            {forwardTrips.map((trip) => (
              <View
                key={trip.id}
                style={[
                  styles.tripCard,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                  trip.delay > 0 && { backgroundColor: colors.warning + "11", borderColor: colors.warning + "44" },
                ]}
              >
                <Text style={[styles.tripDep, { color: colors.text }]}>{trip.departure}</Text>
                <Ionicons name="arrow-forward" size={10} color={colors.textMuted} />
                <Text style={[styles.tripArr, { color: colors.textSecondary }]}>{trip.arrival}</Text>
                {trip.delay > 0 && (
                  <View style={[styles.delayBadge, { backgroundColor: colors.warning }]}>
                    <Text style={styles.delayBadgeText}>+{trip.delay}m</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.amenitiesRow}>
        {bus.amenities.slice(0, 3).map((a, i) => (
          <View key={i} style={[styles.amenityChip, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Text style={[styles.amenityText, { color: colors.textMuted }]}>{a}</Text>
          </View>
        ))}
      </View>

      <View style={styles.viewDetailsRow}>
        <Text style={[styles.viewDetailsText, { color: colors.primary }]}>पूरी जानकारी देखें</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

export default function BusResultsScreen() {
  const { fromId, toId } = useLocalSearchParams<{ fromId: string; toId: string }>();
  const { colors } = useTheme();
  const { stations, searchBuses, isLoading } = useFirebase();
  const { isFavorite, toggleFavorite } = useFavorites();

  const results = fromId && toId ? searchBuses(fromId, toId) : [];
  const fromName = fromId ? (stations[fromId]?.name ?? fromId) : "";
  const toName = toId ? (stations[toId]?.name ?? toId) : "";
  const stationName = (id: string) => stations[id]?.name ?? id;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.routeHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.routeHeaderInner}>
          <View style={styles.stationBox}>
            <View style={[styles.dotOrange, { backgroundColor: colors.primary }]} />
            <Text style={[styles.stationBoxText, { color: colors.text }]} numberOfLines={1}>{fromName}</Text>
          </View>
          <MaterialCommunityIcons name="bus-side" size={20} color={colors.primary} />
          <View style={[styles.stationBox, { alignItems: "flex-end" }]}>
            <View style={[styles.dotGray, { backgroundColor: colors.textMuted }]} />
            <Text style={[styles.stationBoxText, { color: colors.text }]} numberOfLines={1}>{toName}</Text>
          </View>
        </View>
        <Text style={[styles.resultsCount, { color: colors.textMuted }]}>{results.length} बसें मिलीं</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bus-alert" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>कोई बस नहीं मिली</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            इस रूट पर फिलहाल कोई बस उपलब्ध नहीं है।
          </Text>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>वापस जाएं</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={({ id }) => id}
          renderItem={({ item: { id, bus } }) => (
            <BusResultCard
              id={id}
              bus={bus}
              stationName={stationName}
              isFav={isFavorite(id)}
              onToggleFav={() => toggleFavorite(id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  routeHeader: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 6,
  },
  routeHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stationBox: {
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
  stationBoxText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    flex: 1,
  },
  resultsCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
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
    fontSize: 16,
  },
  busNumber: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  fareBox: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  fareAmt: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  heartBtn: {
    padding: 2,
  },
  busTypeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeText: {
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
  tripsSection: { gap: 6 },
  tripsLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  tripsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tripCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  tripDep: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  tripArr: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  delayBadge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  delayBadgeText: {
    color: "#000",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
  },
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  amenityChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  amenityText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
  },
  viewDetailsText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
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
  backBtn: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    color: "#09090B",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
