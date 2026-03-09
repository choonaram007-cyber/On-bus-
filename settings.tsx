import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

function SettingItem({
  icon,
  label,
  subtitle,
  onPress,
  iconBg,
  showArrow = true,
  rightElement,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  iconBg: string;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={colors.text} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
      </View>
      {rightElement ?? (showArrow && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const showInfo = (msg: string) => Alert.alert("जानकारी", msg);

  const openEmail = () => {
    Linking.openURL("mailto:supportonbus@gmail.com").catch(() =>
      Alert.alert("ईमेल", "supportonbus@gmail.com")
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: bottomPad }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>सेटिंग्स</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <Ionicons name="bus" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.obBrand, { color: colors.primary }]}>OB</Text>
            <Text style={[styles.profileName, { color: colors.text }]}>बस ट्रैकर</Text>
            <Text style={[styles.profileSub, { color: colors.textMuted }]}>भारतीय लोकल बस सेवा</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ऐप सेटिंग</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SettingItem
              icon="notifications"
              label="नोटिफिकेशन"
              subtitle="बस देरी और अलर्ट"
              iconBg="#A855F722"
              onPress={() => Alert.alert("जानकारी", "यह सुविधा जल्द ही उपलब्ध होगी")}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="language"
              label="भाषा"
              subtitle="हिंदी"
              iconBg="#3B82F622"
              onPress={() => showInfo("केवल हिंदी उपलब्ध है")}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <SettingItem
              icon={isDark ? "moon" : "sunny"}
              label="थीम"
              subtitle={isDark ? "डार्क मोड चालू" : "लाइट मोड चालू"}
              iconBg={isDark ? "#1F2937" : "#FFF7ED"}
              showArrow={false}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary + "88" }}
                  thumbColor={isDark ? colors.primary : colors.textMuted}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>जानकारी</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SettingItem
              icon="information-circle"
              label="ऐप के बारे में"
              subtitle="OB बस ट्रैकर v1.0.0"
              iconBg="#FF9F1A22"
              onPress={() => showInfo("OB बस ट्रैकर v1.0.0\nभारत की सभी बसों की लाइव ट्रैकिंग")}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="shield-checkmark"
              label="गोपनीयता नीति"
              iconBg="#22C55E22"
              onPress={() => showInfo("आपका डेटा सुरक्षित है")}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="help-circle"
              label="सहायता"
              subtitle="supportonbus@gmail.com"
              iconBg="#EF444422"
              onPress={openEmail}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.obBigText, { color: colors.primary }]}>OB</Text>
            <Text style={[styles.infoBoxTitle, { color: colors.text }]}>बस ट्रैकर</Text>
            <Text style={[styles.infoBoxText, { color: colors.textMuted }]}>
              भारत की सभी लोकल बसों की लाइव लोकेशन और समय सारणी एक ही जगह। 100% सटीक जानकारी।
            </Text>
            <TouchableOpacity onPress={openEmail} style={[styles.emailBtn, { borderColor: colors.border }]}>
              <Ionicons name="mail" size={14} color={colors.primary} />
              <Text style={[styles.emailText, { color: colors.primary }]}>supportonbus@gmail.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  obBrand: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.5,
  },
  profileName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  profileSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: { flex: 1 },
  settingLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  settingSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  separator: {
    height: 1,
    marginLeft: 62,
  },
  infoBox: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  obBigText: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    letterSpacing: -1,
  },
  infoBoxTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  infoBoxText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  emailText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
