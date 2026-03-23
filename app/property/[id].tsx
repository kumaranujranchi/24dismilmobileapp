import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Linking, Platform, Modal, TextInput, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Robust Image Resolver
const resolvePhotoUri = (photos: any[]) => {
  if (!photos || !photos[0]) return 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  
  const raw = photos[0];
  const photoStr = (typeof raw === 'string') ? raw : (raw?.url || raw?.id || String(raw));
  
  if (photoStr.indexOf('http') === 0) return photoStr;
  if (photoStr === '[object Object]') return 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  
  return `https://compassionate-mockingbird-459.convex.cloud/api/storage/${photoStr}`;
};

// Standardized Icon Mapper
const getAmenityIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('park') && n.includes('car')) return 'car';
  if (n.includes('garden') || n.includes('park')) return 'leaf';
  if (n.includes('security')) return 'shield-check';
  if (n.includes('water')) return 'water';
  if (n.includes('gym')) return 'dumbbell';
  if (n.includes('pool')) return 'pool';
  if (n.includes('power') || n.includes('backup')) return 'flash';
  if (n.includes('lift')) return 'elevator';
  if (n.includes('garbage')) return 'trash-can';
  if (n.includes('cctv')) return 'camera';
  if (n.includes('fire')) return 'fire';
  if (n.includes('play')) return 'toy-brick';
  if (n.includes('club')) return 'account-group';
  if (n.includes('rain')) return 'weather-pouring';
  if (n.includes('intercom')) return 'phone-in-talk';
  if (n.includes('gated')) return 'gate';
  if (n.includes('boundary')) return 'fence';
  return 'check-circle';
};

// Similar Property Card Component
const SimilarPropertyCard = ({ item, onPress }: { item: any, onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={{ width: width * 0.7 }}
    className="bg-white rounded-lg-custom border border-gray-100 mr-4 shadow-standard overflow-hidden"
  >
    <Image 
      source={{ uri: resolvePhotoUri(item.photos) }} 
      className="w-full h-32"
      resizeMode="cover"
    />
    <View className="p-3">
      <Text className="text-dark font-inter-bold text-sm" numberOfLines={1}>₹{item.pricing?.expectedPrice || '0'}</Text>
      <Text className="text-text font-inter-semibold text-[11px] mt-1" numberOfLines={1}>
        {item.details?.bhk || ''} {item.propertyType} in {item.location?.locality}
      </Text>
      <View className="flex-row items-center mt-2">
        <FontAwesome5 name="map-marker-alt" size={8} color="#9ca3af" />
        <Text className="text-text-muted text-[9px] font-inter ml-1" numberOfLines={1}>{item.location?.city}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const contactOwnerMutation = useMutation(api.properties.contactOwner);

  const property = useQuery(api.properties.getProperty, { id: id as Id<"properties"> });
  const allProperties = useQuery(api.properties.getProperties, {});

  if (property === undefined) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (property === null) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <FontAwesome5 name="search" size={60} color="#e5e7eb" />
        <Text className="text-dark font-inter-bold text-xl mt-4">Property Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-primary px-8 py-3 rounded-lg-custom">
          <Text className="text-white font-inter-semibold">Back to Search</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const p = property;
  
  // Filter similar properties (exclude current, same locality or same type)
  const similarItems = (allProperties || [])
    .filter(item => item._id !== p._id)
    .filter(item => item.location?.locality === p.location?.locality || item.propertyType === p.propertyType)
    .slice(0, 5);

  const handleCall = () => {
    setShowLeadForm(true);
  };

  const submitLead = async () => {
    if (!leadName || !leadPhone) {
      Alert.alert('Required', 'Please enter your name and phone number.');
      return;
    }
    setSubmitting(true);
    try {
      await contactOwnerMutation({
        propertyId: p._id,
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        message: `I am interested in ${p.propertyType} in ${p.location?.locality}.`
      });
      setShowLeadForm(false);
      Alert.alert('Success', 'Your interest has been shared with the owner. They will contact you shortly.');
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit interest. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* 1. Header Image */}
        <View className="relative w-full bg-gray-200" style={{ height: 350 }}>
          <Image 
            source={{ uri: resolvePhotoUri(p.photos) }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          
          <View className="absolute w-full px-4 flex-row justify-between" style={{ top: insets.top + 10 }}>
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-lg"
            >
              <FontAwesome5 name="arrow-left" size={16} color="#1a1a1a" />
            </TouchableOpacity>
            <View className="flex-row">
              <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-lg mr-2">
                <Ionicons name="share-outline" size={20} color="#1a1a1a" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-lg">
                <Ionicons name="heart-outline" size={20} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="absolute bottom-6 right-4 bg-black/60 px-3 py-1.5 rounded-lg-custom flex-row items-center">
            <FontAwesome5 name="images" size={10} color="white" />
            <Text className="text-white text-[10px] font-inter-bold ml-2">1 / {p.photos?.length || 1}</Text>
          </View>
        </View>

        {/* 2. Navigation Tabs */}
        <View className="bg-white border-b border-gray-100 py-4 px-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['OVERVIEW', 'AMENITIES', 'LOCATION', 'FAQS'].map((tab, idx) => (
              <TouchableOpacity key={idx} className="mr-8">
                <Text className={`font-inter-bold text-[10px] tracking-widest ${idx === 0 ? 'text-primary' : 'text-gray-400'}`}>
                  {tab}
                </Text>
                {idx === 0 && <View className="h-0.5 bg-primary w-full mt-2 rounded-full" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 3. Title & Price Card */}
        <View className="px-5 pt-4">
          <View className="bg-white rounded-lg-custom p-6 shadow-standard border border-gray-100 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row">
                <View className="bg-green-50 px-2 py-0.5 rounded-sm-custom border border-green-100 mr-2">
                  <Text className="text-green-600 text-[10px] font-inter-bold uppercase">Ready</Text>
                </View>
                {p.isFeatured && (
                  <View className="bg-primary/5 px-2 py-0.5 rounded-sm-custom border border-primary/10">
                    <Text className="text-primary text-[10px] font-inter-bold uppercase">Featured</Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-300 text-[10px] font-inter-bold uppercase tracking-tighter">#{String(p._id).slice(-6)}</Text>
            </View>

            <View className="flex-row items-baseline mb-2">
              <Text className="text-dark font-inter-bold text-3xl">
                {p.pricing?.expectedPrice ? `₹${p.pricing.expectedPrice}` : 'Price on Request'}
              </Text>
              <Text className="text-gray-400 text-xs font-inter-medium ml-2">Fixed</Text>
            </View>

            <Text className="text-text font-inter-semibold text-lg leading-relaxed mb-4">
              {p.details?.bhk || ''} {p.propertyType || 'Property'} for Sale in {p.location?.locality}
            </Text>

            <View className="flex-row items-center pt-4 border-t border-gray-50">
              <FontAwesome5 name="map-marker-alt" size={12} color={Colors.primary} />
              <Text className="text-text-muted text-sm font-inter-medium ml-2">{p.location?.locality}, {p.location?.city}</Text>
            </View>
          </View>
        </View>

        {/* 4. Quick Summary */}
        <View className="px-5 mb-8">
          <View className="flex-row items-center mb-4 pl-1">
            <View className="w-1 h-5 bg-primary rounded-full mr-2" />
            <Text className="text-dark font-inter-bold text-lg">Quick Summary</Text>
          </View>
          <View className="flex-row flex-wrap bg-gray-50/50 rounded-lg-custom border border-gray-100 overflow-hidden">
             {[
               { icon: 'bed-outline', label: 'BHK', value: p.details?.bhk || 'N/A' },
               { icon: 'vector-square', label: 'AREA', value: `${p.details?.builtUpArea || 0} sqft` },
               { icon: 'check-decagram-outline', label: 'STATUS', value: p.details?.status || 'Ready' },
               { icon: 'sofa-outline', label: 'FURNISH', value: p.details?.furnishing || 'No' },
               { icon: 'layers-outline', label: 'FLOOR', value: `${p.details?.floorNumber || 0}/${p.details?.totalFloors || 0}` },
               { icon: 'compass-outline', label: 'FACING', value: p.details?.facing || 'East' }
             ].map((item, idx) => (
                <View key={idx} className={`w-1/2 p-4 flex-row items-center border-gray-100 ${idx % 2 === 0 ? 'border-r' : ''} ${idx < 4 ? 'border-b' : ''}`}>
                  <View className="w-9 h-9 bg-white rounded-base items-center justify-center mr-3 shadow-standard border border-gray-50">
                    <MaterialCommunityIcons name={item.icon as any} size={18} color={Colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-[9px] font-inter-bold uppercase tracking-widest">{item.label}</Text>
                    <Text className="text-dark font-inter-bold text-xs" numberOfLines={1}>{item.value}</Text>
                  </View>
                </View>
             ))}
          </View>
        </View>

        {/* 5. Features & Comfort */}
        {p.amenities && p.amenities.length > 0 && (
          <View className="px-5 mb-8">
             <View className="flex-row items-center mb-5 pl-1">
               <View className="w-1 h-5 bg-primary rounded-full mr-2" />
               <Text className="text-dark font-inter-bold text-lg">Features & Comfort</Text>
             </View>
             <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                {p.amenities.map((item: string, idx: number) => (
                  <View key={idx} className="w-1/4 p-1 mb-3">
                    <View className="items-center">
                      <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-2 border border-gray-100 shadow-sm">
                        <MaterialCommunityIcons name={getAmenityIcon(item) as any} size={22} color={Colors.primary} />
                      </View>
                      <Text className="text-text-muted text-[9px] font-inter-medium text-center px-1" numberOfLines={2}>{item}</Text>
                    </View>
                  </View>
                ))}
             </View>
          </View>
        )}

        {/* 6. Geographic Location */}
        <View className="px-5 mb-8">
          <View className="flex-row items-center mb-4 pl-1">
            <View className="w-1 h-5 bg-primary rounded-full mr-2" />
            <Text className="text-dark font-inter-bold text-lg">Geographic Location</Text>
          </View>
          <View className="bg-white border border-gray-100 rounded-lg-custom overflow-hidden shadow-standard">
             <View className="relative w-full h-48 bg-gray-100">
                {Platform.OS === 'web' ? (
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${p.location?.locality}, ${p.location?.city}`)}&output=embed`}
                    allowFullScreen
                  />
                ) : (
                  <WebView
                    originWhitelist={['*']}
                    source={{ html: `
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <style>body { margin: 0; padding: 0; overflow: hidden; }</style>
                        </head>
                        <body>
                          <iframe
                            width="100%"
                            height="100%"
                            frameborder="0"
                            style="border:0; width: 100vw; height: 100vh;"
                            src="https://maps.google.com/maps?q=${encodeURIComponent(`${p.location?.locality}, ${p.location?.city}`)}&output=embed"
                            allowfullscreen>
                          </iframe>
                        </body>
                      </html>
                    ` }}
                    style={{ width: '100%', height: '100%' }}
                  />
                )}
             </View>
             <View className="p-4 flex-row justify-between items-center bg-gray-50/50">
                <View className="flex-1 mr-4">
                   <Text className="text-text-muted text-[10px] font-inter-bold uppercase">Address</Text>
                   <Text className="text-dark font-inter-semibold text-xs mt-0.5" numberOfLines={1}>{p.location?.fullAddress || `${p.location?.locality}, ${p.location?.city}`}</Text>
                </View>
                <TouchableOpacity 
                   onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.location?.locality}, ${p.location?.city}`)}`)}
                   className="bg-white border border-gray-200 px-4 py-2 rounded-base flex-row items-center shadow-standard"
                >
                   <FontAwesome5 name="directions" size={14} color={Colors.primary} />
                   <Text className="text-dark font-inter-bold text-[11px] ml-2">Directions</Text>
                </TouchableOpacity>
             </View>
          </View>
        </View>

        {/* 7. FAQs */}
        <View className="px-5 mb-8">
          <View className="flex-row items-center mb-4 pl-1">
            <View className="w-1 h-5 bg-primary rounded-full mr-2" />
            <Text className="text-dark font-inter-bold text-lg">FAQs about this Property</Text>
          </View>
          <View className="bg-white border border-gray-100 rounded-lg-custom overflow-hidden shadow-standard">
             {[
               { q: "Is this property ready for immediate possession?", a: p.details?.status === "Ready to Move" ? "Yes, it's ready for immediate possession." : "Possession as per project delivery timeline." },
               { q: "What is the total built-up area?", a: `${p.details?.builtUpArea || 0} sqft approx.` },
               { q: "Are there any hidden brokerage charges?", a: "Direct listing from builder/owner, zero brokerage charges apply." }
             ].map((faq, idx) => (
                <View key={idx} className={`p-5 ${idx !== 2 ? 'border-b border-gray-50' : ''}`}>
                   <View className="flex-row justify-between items-center">
                      <Text className="text-dark font-inter-bold text-[13px] flex-1 mr-4">{faq.q}</Text>
                      <FontAwesome5 name="chevron-down" size={10} color="#9ca3af" />
                   </View>
                   <Text className="text-text-muted text-[12px] font-inter mt-3 leading-5">{faq.a}</Text>
                </View>
             ))}
          </View>
        </View>

        {/* 8. Builder Details - ULTRA-PREMIUM OVERHAUL */}
        <View className="px-5 mb-10">
          <View className="flex-row items-center mb-6 pl-1">
            <View className="w-1.5 h-6 bg-primary rounded-full mr-3" />
            <Text className="text-dark font-inter-bold text-xl">Property Concierge</Text>
          </View>
          
          <View className="bg-white rounded-lg-custom shadow-standard border border-gray-50 overflow-hidden">
             {/* Header Background Accent */}
             <View className="h-24 bg-primary/5 absolute top-0 w-full" />
             
             <View className="p-8">
                {/* Profile Header */}
                <View className="flex-row items-start justify-between mb-10">
                   <View className="flex-row items-center flex-1">
                     <View className="relative">
                        <View className="w-20 h-20 bg-white rounded-lg-custom items-center justify-center shadow-standard border border-gray-50">
                           <Text className="text-primary font-inter-bold text-3xl">
                               {(p.contactDesc?.name || 'A')[0].toUpperCase()}
                           </Text>
                        </View>
                        <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white items-center justify-center">
                           <View className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </View>
                     </View>
                     
                     <View className="ml-5 flex-1">
                        <Text className="text-dark font-inter-bold text-2xl" numberOfLines={2}>
                           {p.contactDesc?.name || 'Premium Seller'}
                        </Text>
                        <View className="flex-row items-center mt-2">
                           <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                           <Text className="text-green-600 font-inter-bold text-[10px] uppercase tracking-[2px] ml-1.5">
                              Certified {p.contactDesc?.role || 'Advisor'}
                           </Text>
                        </View>
                     </View>
                   </View>
                </View>

                {/* Performance Grid */}
                <View className="flex-row justify-between mb-8">
                   <View className="w-[31%] aspect-square bg-gray-50 rounded-lg-custom items-center justify-center border border-gray-100 p-2">
                      <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mb-2">
                         <MaterialCommunityIcons name="office-building" size={16} color={Colors.primary} />
                      </View>
                      <Text className="text-dark font-inter-bold text-lg">15+</Text>
                      <Text className="text-gray-400 text-[8px] font-inter-bold uppercase tracking-widest">Active</Text>
                   </View>
                   
                   <View className="w-[31%] aspect-square bg-white rounded-lg-custom items-center justify-center shadow-standard border border-gray-50 p-2">
                      <View className="w-8 h-8 bg-yellow-50 rounded-full items-center justify-center mb-2">
                         <MaterialCommunityIcons name="star-face" size={16} color="#fbbf24" />
                      </View>
                      <Text className="text-dark font-inter-bold text-lg">4.9</Text>
                      <Text className="text-gray-400 text-[8px] font-inter-bold uppercase tracking-widest">Rating</Text>
                   </View>
                   
                   <View className="w-[31%] aspect-square bg-gray-50 rounded-lg-custom items-center justify-center border border-gray-100 p-2">
                      <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mb-2">
                         <MaterialCommunityIcons name="handshake-outline" size={16} color={Colors.primary} />
                      </View>
                      <Text className="text-dark font-inter-bold text-lg">8yrs</Text>
                      <Text className="text-gray-400 text-[8px] font-inter-bold uppercase tracking-widest">Exp.</Text>
                   </View>
                </View>

                {/* Call to Action Row */}
                <View className="flex-row items-center justify-between pt-6 border-t border-gray-50">
                   <View>
                      <Text className="text-gray-400 text-[9px] font-inter-bold uppercase tracking-widest mb-1">Response Time</Text>
                      <Text className="text-dark font-inter-semibold text-xs">Under 15 mins</Text>
                   </View>
                   <TouchableOpacity 
                      className="bg-primary/5 px-6 py-2.5 rounded-lg-custom border border-primary/20"
                      onPress={() => Alert.alert('Profile', 'Agent profile system is being updated.')}
                   >
                      <Text className="text-primary font-inter-bold text-[11px] uppercase tracking-wider">View Portfolio</Text>
                   </TouchableOpacity>
                </View>
             </View>
             
             {/* Footer Trust Section */}
             <View className="bg-gray-50/80 px-8 py-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                   <Ionicons name="time-outline" size={12} color="#9ca3af" />
                   <Text className="text-gray-500 font-inter-medium text-[10px] ml-1.5">Member for 4+ Years</Text>
                </View>
                <View className="flex-row">
                   <TouchableOpacity className="w-7 h-7 bg-white rounded-full items-center justify-center border border-gray-100 mr-2">
                      <MaterialCommunityIcons name="linkedin" size={14} color="#6b7280" />
                   </TouchableOpacity>
                   <TouchableOpacity className="w-7 h-7 bg-white rounded-full items-center justify-center border border-gray-100">
                      <MaterialCommunityIcons name="web" size={14} color="#6b7280" />
                   </TouchableOpacity>
                </View>
             </View>
          </View>
        </View>

        {/* 9. Similar Properties */}
        {similarItems.length > 0 && (
          <View className="mb-10 pt-4">
             <View className="px-5 flex-row items-center mb-5">
               <View className="w-1 h-5 bg-primary rounded-full mr-2" />
               <Text className="text-dark font-inter-bold text-lg">Similar Properties</Text>
             </View>
             <ScrollView 
               horizontal 
               showsHorizontalScrollIndicator={false} 
               contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
             >
                {similarItems.map((item, idx) => (
                   <SimilarPropertyCard 
                     key={idx} 
                     item={item} 
                     onPress={() => router.push(`/property/${item._id}`)} 
                   />
                ))}
             </ScrollView>
          </View>
        )}

        <View className="h-40" />
      </ScrollView>

      {/* FIXED BOTTOM CONTACT BAR */}
      <View 
        className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 flex-row items-center shadow-standard" 
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity 
          onPress={handleCall}
          className="flex-1 bg-primary rounded-lg-custom h-14 flex-row items-center justify-center shadow-standard active:opacity-90"
        >
          <MaterialCommunityIcons name="phone-outline" size={24} color="white" />
          <Text className="text-white font-inter-bold text-lg ml-3">Contact Owner</Text>
        </TouchableOpacity>
      </View>

      {/* LEAD COLLECTION MODAL */}
      <Modal
        visible={showLeadForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLeadForm(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-lg-custom p-8 pb-12">
            <View className="flex-row justify-between items-center mb-8">
               <View>
                  <Text className="text-dark font-inter-bold text-2xl">Enquire Now</Text>
                  <Text className="text-text-muted font-inter-medium text-sm mt-1">Fill details to contact the owner</Text>
               </View>
               <TouchableOpacity onPress={() => setShowLeadForm(false)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <Ionicons name="close" size={24} color="#1a1a1a" />
               </TouchableOpacity>
            </View>

            <View className="mb-5">
               <Text className="text-dark font-inter-bold text-xs uppercase tracking-widest mb-2 ml-1">Your Name</Text>
               <View className="bg-gray-50 border border-gray-200 rounded-lg-custom px-5 flex-row items-center">
                  <FontAwesome5 name="user" size={14} color={Colors.primary} />
                  <TextInput
                    className="flex-1 py-4 ml-3 text-dark font-inter-semibold"
                    placeholder="Enter your full name"
                    value={leadName}
                    onChangeText={setLeadName}
                  />
               </View>
            </View>

            <View className="mb-5">
               <Text className="text-dark font-inter-bold text-xs uppercase tracking-widest mb-2 ml-1">Phone Number</Text>
               <View className="bg-gray-50 border border-gray-200 rounded-lg-custom px-5 flex-row items-center">
                  <FontAwesome5 name="phone-alt" size={14} color={Colors.primary} />
                  <TextInput
                    className="flex-1 py-4 ml-3 text-dark font-inter-semibold"
                    placeholder="Enter 10-digit mobile number"
                    value={leadPhone}
                    onChangeText={setLeadPhone}
                    keyboardType="phone-pad"
                  />
               </View>
            </View>

            <View className="mb-8">
               <Text className="text-dark font-inter-bold text-xs uppercase tracking-widest mb-2 ml-1">Email (Optional)</Text>
               <View className="bg-gray-50 border border-gray-200 rounded-lg-custom px-5 flex-row items-center">
                  <MaterialCommunityIcons name="email-outline" size={18} color={Colors.primary} />
                  <TextInput
                    className="flex-1 py-4 ml-3 text-dark font-inter-semibold"
                    placeholder="Your email address"
                    value={leadEmail}
                    onChangeText={setLeadEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
               </View>
            </View>

            <TouchableOpacity 
               onPress={submitLead}
               disabled={submitting}
               className={`w-full h-16 rounded-lg-custom bg-primary items-center justify-center shadow-standard ${submitting ? 'opacity-70' : ''}`}
            >
               {submitting ? (
                 <ActivityIndicator color="white" />
               ) : (
                 <Text className="text-white font-inter-bold text-lg">Submit Enquiry</Text>
               )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
