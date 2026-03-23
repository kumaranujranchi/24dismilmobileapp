import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function PostScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleStartPosting = () => {
    if (!user) {
      router.push('/(tabs)/profile');
    } else {
      router.push('/post-property');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Illustration / Icon */}
        <View style={styles.iconWrap}>
          <FontAwesome5 name="home" size={60} color="#e84118" />
          <View style={styles.plusBadge}>
            <FontAwesome5 name="plus" size={14} color="#fff" />
          </View>
        </View>

        <Text style={styles.heading}>Sell or Rent your{'\n'}Property for Free</Text>
        <Text style={styles.sub}>
          Reach millions of buyers and tenants.{'\n'}Get higher value for your property.
        </Text>

        {/* Feature list */}
        <View style={styles.features}>
          {[
            { icon: 'eye', text: 'Maximum Visibility to Buyers' },
            { icon: 'shield-alt', text: 'Verified Listings & Secure Process' },
            { icon: 'chart-line', text: 'Free Listing — No Hidden Costs' },
            { icon: 'bolt', text: 'Get Leads Directly on WhatsApp' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <FontAwesome5 name={f.icon as any} size={14} color="#e84118" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={handleStartPosting} activeOpacity={0.85}>
          <FontAwesome5 name="paper-plane" size={16} color="#fff" />
          <Text style={styles.startBtnText}>
            {user ? 'Start Posting Now' : 'Login to Post Property'}
          </Text>
        </TouchableOpacity>

        {!user && (
          <Text style={styles.loginNote}>
            You need to be logged in to post a property.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, paddingBottom: 24,
  },
  iconWrap: { position: 'relative', marginBottom: 32 },
  plusBadge: {
    position: 'absolute', bottom: -4, right: -8,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#f8fafc',
  },
  heading: {
    fontSize: 26, fontFamily: 'Poppins-Bold', color: '#1f2937',
    textAlign: 'center', lineHeight: 34, marginBottom: 10,
  },
  sub: {
    fontSize: 14, fontFamily: 'Inter-Regular', color: '#6b7280',
    textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  features: { width: '100%', gap: 14, marginBottom: 40 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#fff5f3', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#fbd5cc',
  },
  featureText: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#374151', flex: 1 },
  startBtn: {
    backgroundColor: '#e84118', borderRadius: 14, paddingVertical: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, width: '100%',
    shadowColor: '#e84118', shadowOpacity: 0.4, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  startBtnText: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#fff' },
  loginNote: { marginTop: 14, fontSize: 12, fontFamily: 'Inter-Regular', color: '#9ca3af', textAlign: 'center' },
});
