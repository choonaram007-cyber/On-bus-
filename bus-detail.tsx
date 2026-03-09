import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import type { Trip, BusRoute } from "@/lib/firebase";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentActiveTrip(trips: Trip[]): { trip: Trip; progress: number } | null {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (const trip of trips) {
    const dep = timeToMinutes(trip.departure) + trip.delay;
    const arr = timeToMinutes(trip.arrival) + trip.delay;
    if (nowMins >= dep && nowMins <= arr) {
      const progress = Math.min(1, Math.max(0, (nowMins - dep) / (arr - dep)));
      return { trip, progress };
    }
  }
  const upcoming = trips
    .map((t) => ({ trip: t, dep: timeToMinutes(t.departure) + t.delay }))
    .filter(({ dep }) => dep > nowMins)
    .sort((a, b) => a.dep - b.dep);
  if (upcoming.length > 0) return { trip: upcoming[0].trip, progress: -1 };
  return null;
}

function getLiveStopIndex(progress: number, stopsCount: number): number {
  return Math.min(stopsCount - 1, Math.floor(progress * stopsCount));
}

function LiveLocationTracker({
  trip,
  route,
  stationName,
}: {
  trip: Trip;
  route: BusRoute;
  stationName: (id: string) => string;
}) {
  const { colors } = useTheme();
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const [nowMins, setNowMins] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const n = new Date();
      setNowMins(n.getHours() * 60 + n.getMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const dep = timeToMinutes(trip.departure) + trip.delay;
  const arr = timeToMinutes(trip.arrival) + trip.delay;
  const isActive = nowMins >= dep && nowMins <= arr;
  const isUpcoming = dep > nowMins;

  if (!isActive && !isUpcoming) return null;

  const displayStops = trip.isReturnTrip ? [...route.stops].reverse() : route.stops;

  let busStopIdx = 0;
  let progressPct = 0;

  if (isActive) {
    const elapsed = nowMins - dep;
    const total = arr - dep;
    progressPct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    busStopIdx = getLiveStopIndex(progressPct / 100, displayStops.length);
  }

  const minsUntilDep = dep - nowMins;
  const remainingMins = isActive ? arr - nowMins : 0;

  return (
    <View style={[liveStyles.container, { backgroundColor: colors.surface, borderColor: isActive ? "#22C55E44" : colors.border }]}>
      <View style={liveStyles.header}>
        <View style={liveStyles.headerLeft}>
          <Animated.View style={[liveStyles.liveDot, { opacity: isActive ? blinkAnim : 1, backgroundColor: isActive ? "#22C55E" : colors.warning }]} />
          <Text style={[liveStyles.liveLabel, { color: isActive ? "#22C55E" : colors.warning }]}>
            {isActive ? "लाइव लोकेशन" : "अगली ट्रिप"}
          </Text>
        </View>
        <Text style={[liveStyles.tripTime, { color: colors.textMuted }]}>
          {trip.departure} → {trip.arrival}
          {trip.delay > 0 ? `  (+${trip.delay}मि. देरी)` : ""}
        </Text>
      </View>

      {isUpcoming && (
        <View style={[liveStyles.upcomingBox, { backgroundColor: colors.warning + "11", borderColor: colors.warning + "33" }]}>
          <Ionicons name="time" size={14} color={colors.warning} />
          <Text style={[liveStyles.upcomingText, { color: colors.warning }]}>
            {minsUntilDep < 60
              ? `${minsUntilDep} मिनट में रवाना होगी`
              : `${Math.floor(minsUntilDep / 60)} घंटे ${minsUntilDep % 60} मिनट में रवाना होगी`}
          </Text>
        </View>
      )}

      {isActive && (
        <>
          <View style={[liveStyles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[liveStyles.progressFill, { width: `${progressPct}%` as any, backgroundColor: "#22C55E" }]} />
          </View>
          <View style={liveStyles.progressLabels}>
            <Text style={[liveStyles.progressLabel, { color: colors.textMuted }]}>{progressPct.toFixed(0)}% पूरा</Text>
            <Text style={[liveStyles.progressLabel, { color: colors.textMuted }]}>{remainingMins} मिनट शेष</Text>
          </View>
        </>
      )}

      <View style={liveStyles.stopsTrack}>
        {displayStops.map((stop, i) => {
          const isPast = isActive && i < busStopIdx;
          const isCurrent = isActive && i === busStopIdx;
          const isFuture = !isActive || i > busStopIdx;

          return (
            <View key={i} style={liveStyles.stopRow}>
              <View style={liveStyles.stopLeft}>
                {isCurrent ? (
                  <Animated.View style={[liveStyles.busIconWrap, { opacity: blinkAnim }]}>
                    <MaterialCommunityIcons name="bus-side" size={18} color="#22C55E" />
                  </Animated.View>
                ) : (
                  <View style={[
                    liveStyles.stopCircle,
                    isPast ? { backgroundColor: "#22C55E", borderColor: "#22C55E" } : { backgroundColor: colors.background, borderColor: colors.border },
                    i === 0 || i === displayStops.length - 1 ? { width: 14, height: 14, borderRadius: 7 } : {},
                  ]} />
                )}
                {i < displayStops.length - 1 && (
                  <View style={[liveStyles.stopLine, { backgroundColor: isPast ? "#22C55E" : colors.border }]} />
                )}
              </View>
              <View style={liveStyles.stopRight}>
                <Text style={[liveStyles.stopName, { color: isCurrent ? "#22C55E" : isPast ? colors.textSecondary : colors.text }]}>
                  {stationName(stop.stationId)}
                  {isCurrent && "  ← बस यहाँ है"}
                </Text>
                <Text style={[liveStyles.stopDist, { color: colors.textMuted }]}>{stop.distance}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const liveStyles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  tripTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  upcomingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
  upcomingText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -6,
  },
  progressLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  stopsTrack: { gap: 0 },
  stopRow: {
    flexDirection: "row",
    gap: 10,
    minHeight: 38,
  },
  stopLeft: {
    alignItems: "center",
    width: 24,
    paddingTop: 4,
  },
  stopCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  busIconWrap: {
    marginTop: -2,
  },
  stopLine: {
    flex: 1,
    width: 2,
    marginTop: 2,
  },
  stopRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 14,
  },
  stopName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  stopDist: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});

const COMING_SOON = () => Alert.alert("जल्द आ रहा है", "यह सुविधा जल्द ही उपलब्ध होगी।");

export default function BusDetailScreen() {
  const { busId } = useLocalSearchParams<{ busId: string }>();
  const { colors } = useTheme();
  const { buses, stations, routes } = useFirebase();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  if (!busId || !buses[busId]) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Ionicons name="bus" size={48} color={colors.textMuted} />
        <Text style={[styles.notFoundText, { color: colors.textMuted }]}>बस नहीं मिली</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.backBtnText}>वापस जाएं</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bus = buses[busId];
  const route = routes[bus.routeId];
  const crowdColor =
    bus.crowd === "कम" ? colors.success : bus.crowd === "मध्यम" ? colors.warning : colors.error;
  const stationName = (id: string) => stations[id]?.name ?? id;
  const isFav = isFavorite(busId);

  const handleToggleFav = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleFavorite(busId);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <LinearGradient colors={colors.heroGradient} style={styles.heroBanner}>
        <View style={styles.heroRow}>
          <View style={[styles.busIconWrap, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <MaterialCommunityIcons name="bus-side" size={36} color={colors.primary} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { color: colors.text }]}>{bus.busName}</Text>
            <Text style={[styles.heroNumber, { color: colors.textMuted }]}>{bus.busNumber}</Text>
          </View>
          <TouchableOpacity
            style={[styles.heartBtn, { backgroundColor: isFav ? "#EF444422" : colors.surface2, borderColor: isFav ? "#EF444444" : colors.border }]}
            onPress={handleToggleFav}
          >
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#EF4444" : colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroBadges}>
          <View style={[styles.codeBadge, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <Text style={[styles.codeBadgeText, { color: colors.primary }]}>{bus.busCode}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Text style={[styles.typeBadgeText, { color: colors.textSecondary }]}>{bus.type}</Text>
          </View>
          <View style={[styles.crowdBadge, { backgroundColor: crowdColor + "22", borderColor: crowdColor + "44" }]}>
            <View style={[styles.crowdDot, { backgroundColor: crowdColor }]} />
            <Text style={[styles.crowdBadgeText, { color: crowdColor }]}>{bus.crowd} भीड़</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        {[
          { val: bus.fare, label: "किराया" },
          { val: String(bus.availableSeats), label: "उपलब्ध सीटें", color: colors.success },
          { val: String(bus.totalSeats), label: "कुल सीटें" },
          { val: String(bus.trips.length), label: "ट्रिप्स" },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: s.color ?? colors.primary }]}>{s.val}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {(() => {
        const activeInfo = getCurrentActiveTrip(bus.trips);
        if (!activeInfo || !route) return null;
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>लाइव लोकेशन</Text>
            <LiveLocationTracker trip={activeInfo.trip} route={route} stationName={stationName} />
          </View>
        );
      })()}

      {route && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>मार्ग जानकारी</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
            <View style={styles.routeDistanceRow}>
              <View style={styles.routePoint}>
                <View style={[styles.dotOrange, { backgroundColor: colors.primary }]} />
                <Text style={[styles.routePointName, { color: colors.text }]}>{stationName(route.fromStation)}</Text>
              </View>
              <View style={styles.routeMiddle}>
                <Text style={[styles.routeDistance, { color: colors.primary }]}>{route.totalDistance}</Text>
                <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.routeTime, { color: colors.textMuted }]}>{route.forwardTravelTime}</Text>
              </View>
              <View style={[styles.routePoint, { alignItems: "flex-end" }]}>
                <View style={[styles.dotGray, { backgroundColor: colors.textMuted }]} />
                <Text style={[styles.routePointName, { color: colors.text, textAlign: "right" }]}>{stationName(route.toStation)}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { fontSize: 13, marginTop: 12, color: colors.textSecondary }]}>सभी स्टॉप्स</Text>
            {route.stops.map((stop, i) => (
              <View key={i} style={styles.stopRow}>
                <View style={styles.stopLeft}>
                  <View style={[styles.stopDot, i === 0 || i === route.stops.length - 1 ? { backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.primary + "44", width: 12, height: 12, borderRadius: 6 } : { backgroundColor: colors.textMuted, width: 8, height: 8, borderRadius: 4, marginTop: 4, marginLeft: 2 }]} />
                  {i < route.stops.length - 1 && <View style={[styles.stopLine, { backgroundColor: colors.border }]} />}
                </View>
                <View style={styles.stopContent}>
                  <Text style={[styles.stopName, { color: colors.text }]}>{stationName(stop.stationId)}</Text>
                  <Text style={[styles.stopDist, { color: colors.textMuted }]}>{stop.distance}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>यात्रा समय सारिणी</Text>
        <View style={styles.tripsGrid}>
          {bus.trips.map((trip) => {
            const displayStops = route
              ? trip.isReturnTrip
                ? [...route.stops].reverse()
                : route.stops
              : [];

            return (
              <TouchableOpacity
                key={trip.id}
                style={[
                  styles.tripCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedTrip === trip.id && { borderColor: colors.primary, backgroundColor: colors.primary + "11" },
                  trip.delay > 0 && { borderColor: colors.warning + "44", backgroundColor: colors.warning + "08" },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedTrip(selectedTrip === trip.id ? null : trip.id);
                }}
              >
                <View style={styles.tripHeader}>
                  <View style={[styles.tripDirTag, { backgroundColor: trip.isReturnTrip ? "#3B82F622" : colors.primary + "22" }]}>
                    <Ionicons
                      name={trip.isReturnTrip ? "return-down-back" : "arrow-forward"}
                      size={12}
                      color={trip.isReturnTrip ? "#3B82F6" : colors.primary}
                    />
                    <Text style={[styles.tripDirText, { color: trip.isReturnTrip ? "#3B82F6" : colors.primary }]}>
                      {trip.isReturnTrip ? "वापसी" : "जाना"}
                    </Text>
                  </View>
                  {trip.delay > 0 && (
                    <View style={[styles.delayBadge, { backgroundColor: colors.warning + "22" }]}>
                      <Ionicons name="warning" size={10} color={colors.warning} />
                      <Text style={[styles.delayBadgeText, { color: colors.warning }]}>{trip.delay} मिनट देरी</Text>
                    </View>
                  )}
                </View>
                <View style={styles.tripTimes}>
                  <View style={styles.tripTime}>
                    <Text style={[styles.tripTimeVal, { color: colors.text }]}>{trip.departure}</Text>
                    <Text style={[styles.tripTimeLabel, { color: colors.textMuted }]}>प्रस्थान</Text>
                  </View>
                  <View style={styles.tripArrow}>
                    <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
                  </View>
                  <View style={[styles.tripTime, { alignItems: "flex-end" }]}>
                    <Text style={[styles.tripTimeVal, { color: colors.text }]}>{trip.arrival}</Text>
                    <Text style={[styles.tripTimeLabel, { color: colors.textMuted }]}>आगमन</Text>
                  </View>
                </View>
                {selectedTrip === trip.id && displayStops.length > 0 && (
                  <View style={[styles.tripStopsExpanded, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                    <Text style={[styles.tripStopsLabel, { color: colors.textMuted }]}>
                      {trip.isReturnTrip ? "वापसी मार्ग:" : "आगे का मार्ग:"}
                    </Text>
                    <View style={styles.tripStopsList}>
                      {displayStops.map((s, i) => (
                        <View key={i} style={styles.tripStopItem}>
                          <View style={[styles.tripStopDot, { backgroundColor: i === 0 || i === displayStops.length - 1 ? colors.primary : colors.textMuted }]} />
                          <Text style={[styles.tripStopName, { color: colors.textSecondary }]}>{stationName(s.stationId)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>सुविधाएं</Text>
        <View style={[styles.amenitiesGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {bus.amenities.map((a, i) => (
            <View key={i} style={styles.amenityItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.amenityText, { color: colors.text }]}>{a}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => Alert.alert("शेयर", "जल्द आएगा")}
        >
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ticketBtn} onPress={COMING_SOON}>
          <View style={[styles.ticketBtnInner, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 14 }]}>
            <Ionicons name="ticket-outline" size={18} color={colors.text} />
            <Text style={[styles.ticketBtnText, { color: colors.text }]}>टिकट बुक करें</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.trackBtn} onPress={COMING_SOON}>
          <LinearGradient
            colors={["#FF9F1A", "#E8860D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trackBtnGrad}
          >
            <Ionicons name="location" size={18} color="#09090B" />
            <Text style={styles.trackBtnText}>लाइव ट्रैक</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  heroBanner: {
    padding: 16,
    gap: 12,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  busIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInfo: { flex: 1 },
  heroName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  heroNumber: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  heartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  heroBadges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  codeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  codeBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  crowdBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  crowdDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  crowdBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    gap: 2,
  },
  statVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  routeName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginBottom: 12,
  },
  routeDistanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routePoint: {
    flex: 1,
    gap: 4,
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
  routePointName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  routeMiddle: {
    alignItems: "center",
    gap: 2,
  },
  routeDistance: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  routeLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
  },
  routeTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
  },
  stopRow: {
    flexDirection: "row",
    gap: 10,
    minHeight: 36,
  },
  stopLeft: {
    alignItems: "center",
    width: 14,
  },
  stopDot: {},
  stopLine: {
    flex: 1,
    width: 2,
    marginVertical: 2,
  },
  stopContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
  },
  stopName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  stopDist: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  tripsGrid: { gap: 10 },
  tripCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tripDirTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tripDirText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  delayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  delayBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  tripTimes: {
    flexDirection: "row",
    alignItems: "center",
  },
  tripTime: {
    flex: 1,
    gap: 2,
  },
  tripArrow: {
    paddingHorizontal: 12,
  },
  tripTimeVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  tripTimeLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  tripStopsExpanded: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    gap: 6,
  },
  tripStopsLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginBottom: 4,
  },
  tripStopsList: { gap: 6 },
  tripStopItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tripStopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tripStopName: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  amenitiesGrid: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amenityText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  bottomActions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ticketBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  ticketBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  ticketBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  trackBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  trackBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  trackBtnText: {
    color: "#09090B",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
  },
  backBtn: {
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
