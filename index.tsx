import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { useFirebase } from "@/contexts/FirebaseContext";

const POPULAR_ROUTES = [
  { fromId: "barmer_stand", toId: "chouhtan_stand", label: "बाड़मेर → चौहटन" },
  { fromId: "barmer_stand", toId: "nimbdi", label: "बाड़मेर → निम्बड़ी" },
  { fromId: "chouhtan_stand", toId: "barmer_stand", label: "चौहटन → बाड़मेर" },
  { fromId: "barmer_stand", toId: "jaisalmer_stand", label: "बाड़मेर → जैसलमेर" },
];

const FEATURES = [
  { icon: "time", label: "सही समय", sub: "लाइव अपडेट्स के साथ समय की बचत", bg: "#FF9F1A22", color: "#FF9F1A" },
  { icon: "shield-checkmark", label: "सुरक्षित यात्रा", sub: "प्रमाणित बसें और ड्राइवर", bg: "#22C55E22", color: "#22C55E" },
  { icon: "location", label: "लाइव ट्रैकिंग", sub: "बस की सटीक लोकेशन", bg: "#3B82F622", color: "#3B82F6" },
  { icon: "notifications", label: "अलर्ट्स", sub: "देरी की सूचना तुरंत", bg: "#A855F722", color: "#A855F7" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { stations, isLoading } = useFirebase();
  const [fromId, setFromId] = useState<string>("barmer_stand");
  const [toId, setToId] = useState<string>("chouhtan_stand");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const stationList = Object.entries(stations);

  const handleSearch = () => {
    if (!fromId || !toId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      router.push({ pathname: "/bus-results", params: { fromId, toId } });
    });
  };

  const handlePopularRoute = (fId: string, tId: string) => {
    Haptics.selectionAsync();
    setFromId(fId);
    setToId(tId);
    router.push({ pathname: "/bus-results", params: { fromId: fId, toId: tId } });
  };

  const swapStations = () => {
    Haptics.selectionAsync();
    setFromId(toId);
    setToId(fromId);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background, paddingBottom: bottomPad }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <LinearGradient
          colors={colors.heroGradient}
          style={[styles.hero, { paddingTop: topPad + 20 }]}
        >
          <View style={styles.heroTopRow}>
            <View style={[styles.badge, { backgroundColor: "#FF9F1A22", borderColor: "#FF9F1A44" }]}>
              <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>100% सटीक लाइव ट्रैकिंग</Text>
            </View>
            <TouchableOpacity
              style={[styles.themeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={toggleTheme}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.obLogo}>
            <Text style={[styles.obText, { color: colors.primary }]}>OB</Text>
            <Text style={[styles.obSubText, { color: colors.textSecondary }]}>बस ट्रैकर</Text>
          </View>

          <Text style={[styles.heroTitle, { color: colors.text }]}>आपकी यात्रा,</Text>
          <Text style={[styles.heroTitle, { color: colors.primary }]}>हमारी जिम्मेदारी</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            भारत की सभी बसों की लाइव लोकेशन और समय सारणी एक ही जगह।
          </Text>
        </LinearGradient>

        <View style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.searchHeader}>
            <Ionicons name="search" size={18} color={colors.primary} />
            <Text style={[styles.searchHeaderText, { color: colors.text }]}>कहाँ जाना है?</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.stationRow, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => { setShowFromPicker(!showFromPicker); setShowToPicker(false); }}
                activeOpacity={0.7}
              >
                <View style={[styles.stationDotOrange, { borderColor: "#FF9F1A44" }]} />
                <Text style={[styles.stationText, { color: !fromId ? colors.textMuted : colors.text }]}>
                  {fromId && stations[fromId] ? stations[fromId].name : "कहाँ से?"}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {showFromPicker && (
                <View style={[styles.picker, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                  {stationList.map(([id, s]) => (
                    <TouchableOpacity
                      key={id}
                      style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                      onPress={() => { setFromId(id); setShowFromPicker(false); }}
                    >
                      <Ionicons name="location" size={14} color={colors.textSecondary} />
                      <Text style={[styles.pickerText, { color: colors.text }]}>{s.name}</Text>
                      {fromId === id && <Ionicons name="checkmark" size={14} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.dividerRow}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <TouchableOpacity style={[styles.swapBtn, { backgroundColor: "#FF9F1A22", borderColor: "#FF9F1A44" }]} onPress={swapStations}>
                  <Ionicons name="swap-vertical" size={18} color={colors.primary} />
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity
                style={[styles.stationRow, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => { setShowToPicker(!showToPicker); setShowFromPicker(false); }}
                activeOpacity={0.7}
              >
                <View style={[styles.stationDotGray, { backgroundColor: colors.textMuted }]} />
                <Text style={[styles.stationText, { color: !toId ? colors.textMuted : colors.text }]}>
                  {toId && stations[toId] ? stations[toId].name : "कहाँ तक?"}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {showToPicker && (
                <View style={[styles.picker, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                  {stationList.map(([id, s]) => (
                    <TouchableOpacity
                      key={id}
                      style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                      onPress={() => { setToId(id); setShowToPicker(false); }}
                    >
                      <Ionicons name="location" size={14} color={colors.textSecondary} />
                      <Text style={[styles.pickerText, { color: colors.text }]}>{s.name}</Text>
                      {toId === id && <Ionicons name="checkmark" size={14} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
                  <LinearGradient
                    colors={["#FF9F1A", "#E8860D"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.searchBtnGrad}
                  >
                    <Ionicons name="search" size={18} color="#09090B" />
                    <Text style={styles.searchBtnText}>बसें खोजें</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>लोकप्रिय मार्ग</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularList}>
            {POPULAR_ROUTES.map((route, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.popularChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handlePopularRoute(route.fromId, route.toId)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="bus-side" size={14} color={colors.primary} />
                <Text style={[styles.popularChipText, { color: colors.text }]}>{route.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => Alert.alert("जानकारी", "यह सुविधा जल्द ही उपलब्ध होगी")}
                activeOpacity={0.7}
              >
                <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                  <Ionicons name={f.icon as any} size={24} color={f.color} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{f.label}</Text>
                <Text style={[styles.featureSub, { color: colors.textMuted }]}>{f.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  obLogo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },
  obText: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  obSubText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    lineHeight: 38,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    lineHeight: 22,
  },
  searchCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchHeaderText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  stationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  stationDotOrange: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF9F1A",
    borderWidth: 2,
  },
  stationDotGray: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  stationText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
  },
  pickerText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  searchBtn: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  searchBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  searchBtnText: {
    color: "#09090B",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  popularList: {
    gap: 8,
    paddingRight: 16,
  },
  popularChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  popularChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  featureTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 4,
  },
  featureSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
});
