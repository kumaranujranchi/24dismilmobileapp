import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView, Switch,
  Modal, Animated, Easing
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useMutation, useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';

// ============================================================
// CONSTANTS
// ============================================================
const PRIMARY = '#b12300';
const DARK = '#2d2f31';
const MUTED = '#5a5c5d';
const BORDER = '#e1e2e5';
const BG = '#f6f6f8';
const SURFACE_LIGHT = '#ffffff';
const SURFACE_DIM = '#f0f1f3';

const AREA_UNITS = [
  'Square Foot', 'Square Yard (Gaj)', 'Square Meter', 'Acre', 'Hectare',
  'Dismil / Decimal', 'Kattha', 'Bigha', 'Kanal', 'Marla', 'Guntha / Gunta',
  'Cent', 'Ground', 'Ankanam', 'Biswa', 'Biswansi', 'Lecha', 'Ares'
];

const AMENITY_GROUPS = [
  { title: '⚡ Basic', items: ['Power Backup','Water Supply','Rainwater Harvesting','Lift','Garbage Disposal','Solar Energy','Central Drainage System'] },
  { title: '🛡 Security', items: ['24x7 Security','Gated Society','CCTV','Intercom','Fire Safety','Boundary Wall'] },
  { title: '🌟 Lifestyle', items: ['Swimming Pool','Gymnasium','Childrens Play Area','Clubhouse','Garden / Park','Private Terrace','Free WiFi','Room Service','Daily Housekeeping'] },
];

const PROP_TYPES = [
  { label: 'Apartment', icon: 'building' },
  { label: 'Villa / House', icon: 'home' },
  { label: 'Plot / Land', icon: 'map-marked-alt' },
  { label: 'Commercial', icon: 'store' },
  { label: 'PG Room', icon: 'bed' },
  { label: 'Warehouse', icon: 'industry' },
  { label: 'Hotel / Resort', icon: 'hotel' },
  { label: 'Lodge', icon: 'door-open' },
];

const FACING = ['East','West','North','South','North-East','North-West','South-East','South-West'];

const LOCATIONS: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Ara", "Begusarai", "Katihar", "Bihta"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Raigarh", "Jagdalpur", "Ambikapur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Dwarka", "Rohini"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Porvorim"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Navsari", "Morbi", "Bharuch"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Baddi"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli-Dharwad", "Mangalore", "Belagavi", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga", "Tumkur", "Udupi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Malappuram"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", "Mira-Bhayandar", "Bhiwandi", "Amravati", "Nanded", "Kolhapur", "Akola", "Jalgaon", "Latur", "Dhule", "Ahmednagar"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur", "Mohali", "Pathankot", "Moga", "Abohar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani-cum-Kathgodam", "Rudrapur", "Kashipur", "Rishikesh"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Kharagpur", "Burdwan", "Haldia"]
};

// ============================================================
// COMPONENTS
// ============================================================

const SearchableModal = ({ visible, onClose, onSelect, title, data, placeholder }: any) => {
  const [search, setSearch] = useState('');
  const filteredData = useMemo(() => 
    data.filter((item: string) => item.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '80%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: DARK }}>{title}</Text>
            <TouchableOpacity onPress={onClose}><FontAwesome5 name="times" size={20} color={MUTED} /></TouchableOpacity>
          </View>
          
          <Inp ph={placeholder || 'Search...'} val={search} onChange={setSearch} />
          
          <ScrollView style={{ marginTop: 10 }}>
            {filteredData.map((item: string) => (
              <TouchableOpacity 
                key={item} 
                style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: BORDER }}
                onPress={() => { onSelect(item); onClose(); setSearch(''); }}
              >
                <Text style={{ fontSize: 16, color: DARK }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// TINY HELPERS
// ============================================================
const L = ({ t, req }: { t: string; req?: boolean }) => (
  <Text style={s.label}>{t}{req && <Text style={{ color: PRIMARY }}> *</Text>}</Text>
);
const Inp = ({ ph, val, onChange, kb, multi, style: sx }: any) => (
  <TextInput style={[s.input, multi && s.ta, sx]} placeholder={ph} placeholderTextColor={MUTED}
    value={val} onChangeText={onChange} keyboardType={kb || 'default'}
    multiline={multi} numberOfLines={multi ? 4 : 1} />
);
const Chip = ({ label, selected, onPress }: any) => (
  <TouchableOpacity style={[s.chip, selected && s.chipOn]} onPress={onPress}>
    <Text style={[s.chipTxt, selected && s.chipTxtOn]}>{label}</Text>
  </TouchableOpacity>
);
const Divider = ({ title }: { title: string }) => (
  <View style={s.divider}><Text style={s.dividerTxt}>{title}</Text></View>
);
const Row2 = ({ children }: any) => <View style={s.row2}>{children}</View>;
const Card = ({ children }: any) => <View style={s.card}>{children}</View>;

// ============================================================
// MAIN
// ============================================================
export default function PostPropertyScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createProperty = useMutation(api.properties.createProperty);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<{uri:string;type:string;name:string;category:string}[]>([]);
  const [video, setVideo] = useState<{uri:string;type:string;name:string} | null>(null);
  const [brochure, setBrochure] = useState<{uri:string;type:string;name:string} | null>(null);
  const [externalLinks, setExternalLinks] = useState(['']);

  const [opportunityScore, setOpportunityScore] = useState(0);
  const [scoreTips, setScoreTips] = useState<{text:string;icon:string;highlight?:boolean}[]>([]);
  const [rewriting, setRewriting] = useState(false);
  
  // Submission Overlay State
  const [showProgress, setShowProgress] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal States
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  // Hooks
  const rewriteAction = useAction(api.ai.rewriteDescription);

  // ---- FORM STATE ----
  const [posterType, setPosterType] = useState('Owner');
  const [txType, setTxType] = useState('For Sale');
  const [propType, setPropType] = useState('Apartment');

  // Location
  const [state, setState_] = useState('');
  const [city, setCity] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [locality, setLocality] = useState('');
  const [society, setSociety] = useState('');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState('');
  const [landmark, setLandmark] = useState('');
  const [metroKm, setMetroKm] = useState('');
  const [schoolKm, setSchoolKm] = useState('');
  const [mallKm, setMallKm] = useState('');
  const [hospitalKm, setHospitalKm] = useState('');

  // Details common
  const [status, setStatus] = useState('Ready to Move');
  const [bhk, setBhk] = useState('');
  const [builtUp, setBuiltUp] = useState('');
  const [builtUpUnit, setBuiltUpUnit] = useState('Square Foot');
  const [carpet, setCarpet] = useState('');
  const [floorNo, setFloorNo] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [balconies, setBalconies] = useState('');
  const [furnishing, setFurnishing] = useState('Unfurnished');
  const [facing, setFacing] = useState('');
  const [parking, setParking] = useState('None');
  const [rera, setRera] = useState('');
  const [constYear, setConstYear] = useState('');
  const [ownershipType, setOwnershipType] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [plotAreaUnit, setPlotAreaUnit] = useState('Square Foot');
  const [frontage, setFrontage] = useState('');
  const [roadWidth, setRoadWidth] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);

  // Commercial
  const [commType, setCommType] = useState('');
  const [commGrade, setCommGrade] = useState('');
  const [commFurnishing, setCommFurnishing] = useState('');
  const [commCeilingH, setCommCeilingH] = useState('');
  const [commWashrooms, setCommWashrooms] = useState('');

  // Lodge/PG
  const [roomType, setRoomType] = useState('Single Bed');
  const [acType, setAcType] = useState('Non-AC');
  const [bathroomType, setBathroomType] = useState('Common');
  const [bedType, setBedType] = useState('Single');

  // Hotel
  const [hotelType, setHotelType] = useState('');
  const [starRating, setStarRating] = useState('');
  const [totalRooms, setTotalRooms] = useState('');

  // Pricing
  const [price, setPrice] = useState('');
  const [priceOnReq, setPriceOnReq] = useState(false);
  const [pricingType, setPricingType] = useState('Per Unit');
  const [priceType, setPriceType] = useState('Fixed');
  const [maintenance, setMaintenance] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [availability, setAvailability] = useState('');
  // Lodge pricing
  const [pricePerDay, setPricePerDay] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [secDeposit, setSecDeposit] = useState('');

  // Contact
  const [cName, setCName] = useState(user?.name || '');
  const [cMobile, setCMobile] = useState(user?.phone || '');
  const [cEmail, setCEmail] = useState(user?.email || '');
  const [cRole, setCRole] = useState('Property Owner');
  const [cTime, setCTime] = useState('Any Time');
  const [altPhone, setAltPhone] = useState('');

  // Multiple configurations
  const [flatConfigs, setFlatConfigs] = useState([{ id: Date.now(), bhk: '2BHK', builtUp: '', builtUpUnit: 'Square Foot', carpet: '', carpetUnit: 'Square Foot', price: '' }]);
  const [plotConfigs, setPlotConfigs] = useState([{ id: Date.now(), title: '', area: '', areaUnit: 'Square Foot', price: '', frontage: '', roadWidth: '', facing: '' }]);

  // helpers
  const isPlot = /plot|land|agricultural/i.test(propType);
  const isComm = /commercial|warehouse/i.test(propType);
  const isLodge = /lodge|pg room/i.test(propType);
  const isHotel = /hotel|resort/i.test(propType);
  const isApt = /apartment/i.test(propType);
  const isVilla = /villa|house/i.test(propType);

  const toggleAmenity = (a: string) =>
    setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  // ---- PICK PHOTOS ----
  const pickPhotos = async () => {
    Alert.alert('Upload Photo', 'Choose a source:', [
      { text: 'Camera', onPress: handleTakePhoto },
      { text: 'Gallery', onPress: handlePickLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'Camera access is required.'); return; }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      setPhotos(p => [...p, {
        uri: a.uri, type: a.mimeType || 'image/jpeg',
        name: a.fileName || `cam_${Date.now()}.jpg`, category: 'Exterior',
      }].slice(0, 15));
    }
  };

  const handlePickLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'Gallery access is required.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, quality: 0.8, selectionLimit: 15 - photos.length,
    });
    if (!res.canceled) {
      const newP = res.assets.map((a, i) => ({
        uri: a.uri, type: a.mimeType || 'image/jpeg',
        name: a.fileName || `photo_${Date.now()}_${i}.jpg`, category: 'Exterior',
      }));
      setPhotos(p => [...p, ...newP].slice(0, 15));
    }
  };

  const pickVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true, quality: 1,
    });
    if (!res.canceled && res.assets[0]) {
      const v = res.assets[0];
      setVideo({ uri: v.uri, type: v.mimeType || 'video/mp4', name: v.fileName || 'video.mp4' });
    }
  };

  const pickBrochure = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (!res.canceled && res.assets[0]) {
        const d = res.assets[0];
        setBrochure({ uri: d.uri, type: d.mimeType || 'application/pdf', name: d.name });
      }
    } catch (e) { Alert.alert('Error', 'Could not pick document.'); }
  };

  // ---- OPPORTUNITY SCORE LOGIC ----
  useEffect(() => {
    let score = 0;
    const tips: {text:string;icon:string;highlight?:boolean}[] = [];

    if (photos.length > 0) {
      const pScore = Math.min(photos.length * 5, 25);
      score += pScore;
      if (photos.length < 5) tips.push({ text: `Add ${5 - photos.length} more photos for +${(5 - photos.length) * 5} pts`, icon: 'camera' });
    } else tips.push({ text: 'Add at least 5 photos for +25 pts', icon: 'camera', highlight: true });

    if (description.length > 300) score += 15;
    else if (description.length > 100) {
      score += 10;
      tips.push({ text: 'Make description longer (>300 chars) for +5 pts', icon: 'align-left' });
    } else if (description.length > 0) {
      score += 5;
      tips.push({ text: 'Add detailed description for +10 pts', icon: 'align-left' });
    } else tips.push({ text: 'Add property description for +15 pts', icon: 'align-left' });

    if (rera && rera.trim().length > 5) score += 20;
    else if (!isLodge && !isHotel) tips.push({ text: 'Add RERA Number for +20 pts', icon: 'file-contract' });

    if (amenities.length > 5) score += 10;
    else if (amenities.length > 0) tips.push({ text: 'Select more amenities for +10 pts', icon: 'list-check' });

    if (society && locality) score += 10;
    else tips.push({ text: 'Add Project Name & Locality for +10 pts', icon: 'map-marker-alt' });

    if (video || brochure) score += 20;
    else tips.push({ text: 'Add Video or Brochure for +20 pts', icon: 'film' });

    setOpportunityScore(Math.min(score, 100));
    setScoreTips(tips.slice(0, 3));
  }, [photos, description, rera, amenities, society, locality, video, brochure]);

  const handleAIRewrite = async () => {
    if (!description || description.length < 10) {
      Alert.alert('Short Description', 'Please write a basic description (at least 10 chars) first.');
      return;
    }
    setRewriting(true);
    try {
      const res = await rewriteAction({ text: description, propertyType: propType, locality: locality || 'Your Locality', city: city || 'Your City' });
      if (res.success && res.text) setDescription(res.text);
      else Alert.alert('AI Error', res.error || 'Could not rewrite description.');
    } catch (e) { Alert.alert('Error', 'AI service unavailable.'); }
    finally { setRewriting(false); }
  };

  // ---- VALIDATE ----
  const validate = () => {
    if (step === 2 && (!state || !city || !locality || !pin)) {
      Alert.alert('Required', 'Please fill State, City, Locality and PIN Code.'); return false;
    }
    if (step === 3 && !description) {
      Alert.alert('Required', 'Please add a property description.'); return false;
    }
    if (step === 4 && photos.length === 0) {
      Alert.alert('Photos Required', 'Add at least 1 photo.'); return false;
    }
    if (step === 5) {
      if (!priceOnReq && !isLodge && !isHotel && !price) {
        Alert.alert('Required', 'Enter a price or select Price on Request.'); return false;
      }
      if (!cEmail) { Alert.alert('Required', 'Email is required.'); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep(p => Math.min(p + 1, 5)); };
  const prev = () => setStep(p => Math.max(p - 1, 1));

  // ---- SUBMIT ----
  const submit = async () => {
    if (!validate() || !token) {
      if (!token) Alert.alert('Login Required', 'Please log in first.');
      return;
    }
    
    setShowProgress(true);
    setUploadProgress(0);
    setUploadStatus('Preparing files...');
    setSubmitting(true);

    try {
      // 1. Upload Photos
      setUploadStatus('Uploading photos...');
      const uploadedPhotos = await Promise.all(photos.map(async (ph, i) => {
        const url = await generateUploadUrl();
        const blob = await fetch(ph.uri).then(r => r.blob());
        const up = await fetch(url, { method: 'POST', headers: { 'Content-Type': ph.type }, body: blob });
        if (!up.ok) throw new Error(`Photo ${i + 1} failed`);
        const { storageId } = await up.json();
        setUploadProgress(((i + 1) / (photos.length + (video ? 1 : 0) + (brochure ? 1 : 0))) * 80);
        return { storageId, category: ph.category, isCover: i === 0 };
      }));

      // 2. Upload Video
      let uploadedVideo = null;
      if (video) {
        setUploadStatus('Uploading video...');
        const url = await generateUploadUrl();
        const blob = await fetch(video.uri).then(r => r.blob());
        const up = await fetch(url, { method: 'POST', headers: { 'Content-Type': video.type }, body: blob });
        if (!up.ok) throw new Error('Video upload failed');
        const { storageId } = await up.json();
        uploadedVideo = storageId;
      }

      // 3. Upload Brochure
      let uploadedBrochure = null;
      if (brochure) {
        setUploadStatus('Uploading brochure...');
        const url = await generateUploadUrl();
        const blob = await fetch(brochure.uri).then(r => r.blob());
        const up = await fetch(url, { method: 'POST', headers: { 'Content-Type': brochure.type }, body: blob });
        if (!up.ok) throw new Error('Brochure upload failed');
        const { storageId } = await up.json();
        uploadedBrochure = storageId;
      }

      // 4. Final Submission
      setUploadStatus('Processing images (watermarking)...');
      setUploadProgress(85);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing

      setUploadStatus('Saving property details...');
      setUploadProgress(95);

      // 4. Configurations
      let configurations: any[] = [];
      if (isPlot) {
        configurations = plotConfigs.map(c => ({
          name: c.title || `${c.area} ${c.areaUnit} Plot`,
          builtup: parseFloat(c.area) || 0,
          builtupUnit: c.areaUnit,
          price: parseFloat(c.price) || 0,
          frontageWidth: parseFloat(c.frontage) || 0,
          roadWidth: parseFloat(roadWidth) || 0,
          facing: c.facing || facing || 'East',
          photos: []
        }));
      } else if (isApt || isVilla) {
        configurations = flatConfigs.map(c => ({
          name: c.bhk,
          bhk: c.bhk,
          builtup: parseFloat(c.builtUp) || 0,
          builtupUnit: c.builtUpUnit,
          carpet: parseFloat(c.carpet) || 0,
          carpetUnit: c.carpetUnit,
          price: parseFloat(c.price) || 0,
          photos: []
        }));
      }

      const payload: any = {
        token,
        transactionType: txType,
        propertyType: propType,
        posterType,
        location: {
          state, 
          city: city === 'Other' ? manualCity : city,
          locality,
          society: society || undefined,
          fullAddress: address || undefined,
          pinCode: pin,
          landmark: landmark || undefined,
          metroDistance: metroKm ? metroKm + " km" : undefined,
          schoolDistance: schoolKm ? schoolKm + " km" : undefined,
          mallDistance: mallKm ? mallKm + " km" : undefined,
          hospitalDistance: hospitalKm ? hospitalKm + " km" : undefined,
        },
        details: {
          category: isPlot ? 'Land' : isComm ? 'Commercial' : isHotel ? 'Hospitality' : isLodge ? 'Lodge' : 'Residential',
          bhk: (isApt || isVilla) ? (flatConfigs[0]?.bhk || '2BHK') : (bhk || 'N/A'),
          status,
          builtUpArea: (isApt || isVilla) ? (parseFloat(flatConfigs[0]?.builtUp) || 0) : (parseFloat(builtUp) || 0),
          builtUpAreaUnit: (isApt || isVilla) ? (flatConfigs[0]?.builtUpUnit || 'Square Foot') : builtUpUnit,
          carpetArea: carpet ? parseFloat(carpet) : undefined,
          floorNumber: floorNo ? parseInt(floorNo) : undefined,
          totalFloors: totalFloors ? parseInt(totalFloors) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
          balconies: balconies ? parseInt(balconies) : undefined,
          furnishing: furnishing || undefined,
          facing: facing || undefined,
          parking: parking || undefined,
          constructionYear: constYear ? parseInt(constYear) : undefined,
          ownershipType: ownershipType || undefined,
          plotArea: isPlot ? (parseFloat(plotConfigs[0]?.area) || 0) : undefined,
          plotAreaUnit: isPlot ? (plotConfigs[0]?.areaUnit || 'Square Foot') : undefined,
          frontageWidth: frontage ? parseFloat(frontage) : undefined,
          roadWidth: roadWidth ? parseFloat(roadWidth) : undefined,
          description,
          // Advanced types
          commercialType: commType || undefined,
          commercialGrade: commGrade || undefined,
          commercialFurnishing: commFurnishing || undefined,
          ceilingHeight: commCeilingH ? parseFloat(commCeilingH) : undefined,
          washrooms: commWashrooms || undefined,
          roomType: isLodge ? roomType : undefined,
          acType: isLodge ? acType : undefined,
          bathroomType: isLodge ? bathroomType : undefined,
          bedType: isLodge ? bedType : undefined,
          hotelType: isHotel ? hotelType : undefined,
          starRating: starRating ? parseInt(starRating) : undefined,
          totalRooms: totalRooms ? parseInt(totalRooms) : undefined,
        },
        amenities,
        photos: uploadedPhotos.map((p: any) => p.storageId),
        videos: uploadedVideo ? [uploadedVideo] : undefined,
        brochure: uploadedBrochure || undefined,
        externalVideos: externalLinks.filter(l => l.trim()),
        pricing: {
          expectedPrice: (priceOnReq || isLodge || isHotel) ? 0 : parseFloat(price) || 0,
          isPriceOnRequest: priceOnReq,
          pricingType,
          priceType: priceType || undefined,
          maintenance: maintenance ? parseFloat(maintenance) : undefined,
          negotiable,
          availabilityDate: availability || undefined,
          pricePerDay: pricePerDay ? parseFloat(pricePerDay) : undefined,
          pricePerMonth: pricePerMonth ? parseFloat(pricePerMonth) : undefined,
          securityDeposit: secDeposit ? parseFloat(secDeposit) : undefined,
        },
        contactDesc: {
          name: cName,
          mobile: cMobile,
          email: cEmail,
          role: cRole || undefined,
          rera: rera || undefined,
          preferredTime: cTime || undefined,
        },
        configurations,
      };

      await createProperty(payload);
      setUploadProgress(100);
      setUploadStatus('Done!');
      
      setTimeout(() => {
        setShowProgress(false);
        Alert.alert('🎉 Posted!', 'Your property has been submitted for review.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]);
      }, 500);

    } catch (e: any) {
      setShowProgress(false);
      Alert.alert('Error', e.message || 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  // ---- COMPONENTS ----
  // ---- COMPONENTS ----
  const renderProgressModal = () => (
    <Modal visible={showProgress} transparent animationType="fade">
      <View style={s.modalOverlay}>
        <View style={s.progressCard}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={s.progressTitle}>{uploadStatus}</Text>
          <View style={s.progressBarWrap}>
            <View style={[s.progressBar, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={s.progressPercent}>{Math.round(uploadProgress)}%</Text>
        </View>
      </View>
    </Modal>
  );

  // ---- STEP INDICATOR ----
  const LABELS = ['Type','Location','Details','Photos','Pricing'];
  
  const renderOpportunityScoreRing = () => {
    const color = opportunityScore > 70 ? '#10b981' : opportunityScore > 40 ? '#f59e0b' : '#ef4444';
    const label = opportunityScore > 70 ? 'Excellent' : opportunityScore > 40 ? 'Good' : 'Needs Work';
    
    return (
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        padding: 10, 
        borderRadius: 40, 
        borderWidth: 1, 
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
        minWidth: 150
      }}>
        <View style={{ 
          width: 48, 
          height: 48, 
          borderRadius: 24, 
          borderWidth: 1, 
          borderColor: color, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#000' }}>{opportunityScore}</Text>
          <Text style={{ fontSize: 8, color: '#9ca3af', marginTop: -2 }}>/100</Text>
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: 11, fontFamily: 'Poppins-Bold', color: '#ef4444' }}>Needs Work</Text>
          <Text style={{ fontSize: 9, color: '#6b7280', fontFamily: 'Poppins-Medium' }}>Opportunity Score</Text>
        </View>
      </View>
    );
  };

  const renderStep2ScoreCard = () => (
    <View style={{ 
      backgroundColor: SURFACE_LIGHT, 
      borderRadius: 16, 
      padding: 24, 
      marginBottom: 32, 
      flexDirection: 'row', 
      alignItems: 'center',
      gap: 24,
      shadowColor: '#2d2f31',
      shadowOpacity: 0.06,
      shadowRadius: 20,
      elevation: 4,
      marginHorizontal: 4
    }}>
      <View style={{ 
        width: 96, 
        height: 96, 
        borderRadius: 48, 
        borderWidth: 8, 
        borderColor: '#e1e2e5', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Mocking the SVG Gauge with a thick border */}
        <View style={{ 
          position: 'absolute', 
          width: 96, 
          height: 96, 
          borderRadius: 48, 
          borderWidth: 8, 
          borderColor: PRIMARY, 
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: '-45deg' }]
        }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontFamily: 'Poppins-Bold', color: DARK }}>{opportunityScore}</Text>
          <Text style={{ fontSize: 10, color: MUTED, fontFamily: 'Poppins-Bold', textTransform: 'uppercase', letterSpacing: -0.5 }}>/ 100</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: DARK }}>Opportunity Score</Text>
          <View style={{ backgroundColor: '#fcdadd', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Poppins-Bold', color: '#a70138', textTransform: 'uppercase' }}>Needs Work</Text>
          </View>
        </View>
        <Text style={{ fontSize: 14, color: MUTED, fontFamily: 'Poppins-Medium', marginBottom: 16, lineHeight: 20 }}>Higher scores lead to 3x faster buyer conversions.</Text>
        
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <View style={{ backgroundColor: SURFACE_DIM, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <FontAwesome5 name="camera" size={14} color={PRIMARY} />
            <Text style={{ fontSize: 12, fontFamily: 'Poppins-Bold', color: DARK }}>+25 pts for 5+ photos</Text>
          </View>
          <View style={{ backgroundColor: SURFACE_DIM, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <FontAwesome5 name="file-alt" size={14} color={PRIMARY} />
            <Text style={{ fontSize: 12, fontFamily: 'Poppins-Bold', color: DARK }}>+15 pts for description</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStepBar = () => {
    const percent = Math.min(100, (step - 1) * 20 + 20); // Each step is 20%
    return (
      <View style={{ backgroundColor: BG, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: MUTED, fontFamily: 'Inter-Medium', letterSpacing: 1.2 }}>STEP 0{step} OF 05</Text>
          <Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: PRIMARY }}>{percent}% Complete</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={{ height: 8, backgroundColor: BORDER, borderRadius: 4, overflow: 'hidden', marginBottom: 24 }}>
          <View style={{ height: '100%', width: `${percent}%`, backgroundColor: PRIMARY }} />
        </View>

        <Text style={{ fontSize: 32, fontFamily: 'Poppins-Bold', color: DARK, marginBottom: 8 }}>{LABELS[step - 1]}</Text>
      </View>
    );
  };

  const renderScoreTips = () => {
    if (scoreTips.length === 0 || step >= 3) return null;
    if (step === 2) return renderStep2ScoreCard();
    return (
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        {scoreTips.slice(0, 2).map((tip, i) => {
          const isPhotoTip = tip.text.includes('photos');
          return (
            <View key={i} style={{ 
              width: '100%', 
              marginBottom: 10, 
              paddingVertical: 14, 
              paddingHorizontal: 16, 
              borderRadius: 12, 
              backgroundColor: isPhotoTip ? '#fff5f3' : '#f8fafc',
              borderWidth: 1,
              borderColor: isPhotoTip ? '#fee2e2' : '#f1f5f9',
              flexDirection: 'row', 
              alignItems: 'center' 
            }}>
              <View style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 16, 
                backgroundColor: isPhotoTip ? '#fee2e2' : '#f1f5f9', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: 12 
              }}>
                <FontAwesome5 name={tip.icon} size={14} color={isPhotoTip ? '#e84118' : '#9ca3af'} />
              </View>
              <Text style={{ fontSize: 12, color: isPhotoTip ? '#e84118' : '#4b5563', fontFamily: 'Poppins-SemiBold', flex: 1 }}>
                {tip.text}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // ============================================================
  // STEP 1
  // ============================================================
  const renderStep1 = () => (
    <View style={{ paddingHorizontal: 4 }}>
      <Text style={{ fontSize: 24, fontFamily: 'Poppins-Bold', color: '#000', marginBottom: 30, marginTop: 10 }}>What are you listing?</Text>
      
      <Text style={{ fontSize: 14, fontFamily: 'Poppins-Medium', color: '#6b7280', marginBottom: 12 }}>You are the...</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
        {['Owner','Agent / Broker','Builder'].map(t => {
          const isSelected = posterType === t;
          return (
            <TouchableOpacity key={t} onPress={()=>setPosterType(t)} 
              style={{
                borderRadius: 40,
                paddingHorizontal: 25,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: isSelected ? '#e84118' : '#e5e7eb',
                backgroundColor: '#fff'
              }}>
              <Text style={{ 
                fontSize: 14, 
                fontFamily: isSelected ? 'Poppins-Bold' : 'Poppins-Medium', 
                color: isSelected ? '#e84118' : '#6b7280' 
              }}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontFamily: 'Poppins-Medium', color: '#6b7280' }}>Transaction Type</Text>
        <Text style={{ color: '#ef4444', marginLeft: 4 }}>*</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
        {['For Sale','For Rent','PG / Co-living'].map(t => {
          const isSelected = txType === t;
          return (
            <TouchableOpacity key={t} onPress={()=>setTxType(t)} 
              style={{
                borderRadius: 40,
                paddingHorizontal: 25,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: isSelected ? '#e84118' : '#e5e7eb',
                backgroundColor: isSelected ? '#e84118' : '#fff'
              }}>
              <Text style={{ 
                fontSize: 14, 
                fontFamily: 'Poppins-Bold', 
                color: isSelected ? '#fff' : '#6b7280' 
              }}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ fontSize: 14, fontFamily: 'Poppins-Medium', color: '#6b7280' }}>Property Type</Text>
        <Text style={{ color: '#ef4444', marginLeft: 4 }}>*</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {PROP_TYPES.map(({ label, icon }) => {
          const isSelected = propType === label;
          return (
            <TouchableOpacity key={label} style={{ 
              width: '48%', 
              paddingVertical: 24, 
              borderRadius: 20, 
              borderWidth: isSelected ? 2 : 1, 
              borderColor: isSelected ? '#e84118' : '#f1f5f9', 
              backgroundColor: '#fff', 
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.02,
              shadowRadius: 5,
              elevation: 1
            }} onPress={()=>setPropType(label)}>
              <View style={{ marginBottom: 10 }}>
                <FontAwesome5 name={icon as any} size={32} color={isSelected ? '#e84118' : '#6b7280'} />
              </View>
              <Text style={{ 
                fontSize: 14, 
                fontFamily: isSelected ? 'Poppins-Bold' : 'Poppins-Medium', 
                color: isSelected ? '#e84118' : '#6b7280', 
                textAlign: 'center' 
              }}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // ============================================================
  // STEP 2
  // ============================================================
  const renderStep2 = () => (
    <View style={{ paddingVertical: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 16, marginBottom: 32 }}>
        <FontAwesome5 name="map-marker-alt" size={20} color={PRIMARY} />
        <Text style={{ fontSize: 20, fontFamily: 'Poppins-Bold', color: DARK }}>Where is your property?</Text>
      </View>

      <Text style={{ fontSize: 14, fontFamily: 'Poppins-Bold', color: MUTED, marginLeft: 4, marginBottom: 8 }}>State *</Text>
      <TouchableOpacity 
        style={{ 
          backgroundColor: BORDER, 
          borderRadius: 8, 
          paddingHorizontal: 16, 
          paddingVertical: 14, 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24
        }} 
        onPress={() => setShowStateModal(true)}
      >
        <Text style={{ fontSize: 14, fontFamily: 'Poppins-Medium', color: state ? DARK : '#9ca3af' }}>{state || 'Select State'}</Text>
        <FontAwesome5 name="chevron-down" size={16} color={MUTED} />
      </TouchableOpacity>

      <Text style={{ fontSize: 14, fontFamily: 'Poppins-Bold', color: MUTED, marginLeft: 4, marginBottom: 8 }}>City *</Text>
      <TouchableOpacity 
        style={{ 
          backgroundColor: BORDER, 
          borderRadius: 8, 
          paddingHorizontal: 16, 
          paddingVertical: 14, 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24,
          opacity: state ? 1 : 0.5
        }} 
        onPress={() => state ? setShowCityModal(true) : Alert.alert('Wait', 'Select a state first.')}
        disabled={!state}
      >
        <Text style={{ fontSize: 14, fontFamily: 'Poppins-Medium', color: city ? DARK : '#9ca3af' }}>{city || 'Select City'}</Text>
        <FontAwesome5 name="chevron-down" size={16} color={MUTED} />
      </TouchableOpacity>

      <Text style={{ fontSize: 14, fontFamily: 'Poppins-Bold', color: MUTED, marginLeft: 4, marginBottom: 8 }}>Locality / Area *</Text>
      <TextInput 
        style={{ 
          backgroundColor: BORDER, 
          borderRadius: 8, 
          paddingHorizontal: 16, 
          paddingVertical: 14, 
          fontSize: 14, 
          fontFamily: 'Poppins-Medium', 
          color: DARK,
          marginBottom: 24
        }} 
        placeholder="e.g. Sector 62, Koramangala" 
        placeholderTextColor="#9ca3af"
        value={locality} 
        onChangeText={setLocality} 
      />

      <Text style={{ fontSize: 14, fontFamily: 'Poppins-Bold', color: MUTED, marginLeft: 4, marginBottom: 8 }}>Society / Project Name</Text>
      <TextInput 
        style={{ 
          backgroundColor: BORDER, 
          borderRadius: 8, 
          paddingHorizontal: 16, 
          paddingVertical: 14, 
          fontSize: 14, 
          fontFamily: 'Poppins-Medium', 
          color: DARK,
          marginBottom: 32
        }} 
        placeholder="e.g. Prestige Lake Habitat" 
        placeholderTextColor="#9ca3af"
        value={society} 
        onChangeText={setSociety} 
      />

      <TouchableOpacity 
        style={{ 
          borderWidth: 2, 
          borderColor: '#acadaf', 
          borderStyle: 'dashed', 
          borderRadius: 12, 
          paddingVertical: 16, 
          flexDirection: 'row', 
          gap: 12, 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: 48
        }} 
        onPress={() => Alert.alert('Coming Soon', 'Map selection will be available in the next update.')}
      >
        <FontAwesome5 name="map" size={16} color="#acadaf" />
        <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: MUTED }}>Set Location on Map</Text>
      </TouchableOpacity>

      <View style={{ borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fcdadd', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesome5 name="bus" size={24} color={PRIMARY} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: DARK }}>Nearby Distances (Optional)</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Poppins-Medium', color: MUTED }}>Helps attract serious buyers. Fill in KM distance.</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {[
            { label: 'METRO STATION', val: metroKm, set: setMetroKm },
            { label: 'SCHOOLS', val: schoolKm, set: setSchoolKm },
            { label: 'SHOPPING MALL', val: mallKm, set: setMallKm },
            { label: 'HOSPITAL', val: hospitalKm, set: setHospitalKm },
          ].map((item, i) => (
            <View key={i} style={{ width: '47.5%', backgroundColor: SURFACE_DIM, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Poppins-Bold', color: MUTED, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 }}>{item.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput 
                  style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: DARK, padding: 0, flex: 1 }} 
                  value={item.val || ''} 
                  onChangeText={item.set} 
                  placeholder="0.0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
                <Text style={{ fontSize: 12, fontFamily: 'Poppins-Bold', color: '#acadaf' }}>KM</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // ============================================================
  // STEP 3
  // ============================================================
  const renderStep3 = () => (
    <>
      <Card>
        <Text style={s.cardTitle}>📋 Property Details</Text>

        {/* Status */}
        <L t="Property Status" req />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          <View style={s.chips}>
            {['Ready to Move','Under Construction','New Launch'].map(v => <Chip key={v} label={v} selected={status===v} onPress={()=>setStatus(v)} />)}
          </View>
        </ScrollView>

        {/* APARTMENT / VILLA CONFIGS */}
        {(isApt || isVilla) && (
          <View style={{ marginTop: 16 }}>
            <L t="Flat Configurations" req />
            <Text style={s.helper}>Add each flat type (2 BHK, 3 BHK, etc.) with its area and price.</Text>
            {flatConfigs.map((cfg, i) => (
              <View key={cfg.id} style={s.configCard}>
                <View style={[s.row2, { alignItems: 'center', marginBottom: 12 }]}>
                  <Text style={{ fontSize: 14, fontFamily: 'Poppins-SemiBold', color: PRIMARY }}>Unit #{i+1}</Text>
                  {flatConfigs.length > 1 && (
                    <TouchableOpacity onPress={() => setFlatConfigs(fs => fs.filter((_, j) => j !== i))} style={{ marginLeft: 'auto' }}>
                      <FontAwesome5 name="trash" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <L t="BHK Type" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={s.chips}>
                    {['1RK','1BHK','2BHK','3BHK','4BHK','5BHK','5+ BHK','Custom'].map(v => 
                      <Chip key={v} label={v} selected={cfg.bhk===v} onPress={() => { const c=[...flatConfigs]; c[i].bhk=v; setFlatConfigs(c); }} />)}
                  </View>
                </ScrollView>
                <Row2>
                  <View style={{ flex: 1 }}>
                    <L t="Built-up Area" />
                    <Inp ph="e.g. 1200" val={cfg.builtUp} onChange={(v:any) => { const c=[...flatConfigs]; c[i].builtUp=v; setFlatConfigs(c); }} kb="decimal-pad" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <L t="Unit" />
                    <TouchableOpacity style={s.selectTriggerSm} onPress={() => { /* Simple alert for units in mobile if modal not used here, but we can reuse AREA_UNITS */
                      Alert.alert("Select Unit", "Choose one:", AREA_UNITS.map(u => ({ text: u, onPress: () => { const c=[...flatConfigs]; c[i].builtUpUnit=u; setFlatConfigs(c); } })) as any);
                    }}>
                      <Text style={s.selectTriggerTxtSm}>{cfg.builtUpUnit}</Text>
                    </TouchableOpacity>
                  </View>
                </Row2>
                <L t="Price (optional)" />
                <Inp ph="e.g. 4500000" val={cfg.price} onChange={(v:any) => { const c=[...flatConfigs]; c[i].price=v; setFlatConfigs(c); }} kb="decimal-pad" />
              </View>
            ))}
            <TouchableOpacity style={s.addBtnFull} onPress={() => setFlatConfigs(fs => [...fs, { id: Date.now(), bhk: '2BHK', builtUp: '', builtUpUnit: 'Square Foot', carpet: '', carpetUnit: 'Square Foot', price: '' }])}>
              <FontAwesome5 name="plus-circle" size={16} color={PRIMARY} />
              <Text style={s.addBtnTxtFull}>Add Another Configuration</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PLOT CONFIGS */}
        {isPlot && (
          <View style={{ marginTop: 16 }}>
            <L t="Plot Configurations" req />
            <Text style={s.helper}>Add each plot size available in this project.</Text>
            {plotConfigs.map((cfg, i) => (
              <View key={cfg.id} style={s.configCard}>
                <View style={[s.row2, { alignItems: 'center', marginBottom: 12 }]}>
                  <Text style={{ fontSize: 14, fontFamily: 'Poppins-SemiBold', color: PRIMARY }}>Plot #{i+1}</Text>
                  {plotConfigs.length > 1 && (
                    <TouchableOpacity onPress={() => setPlotConfigs(fs => fs.filter((_, j) => j !== i))} style={{ marginLeft: 'auto' }}>
                      <FontAwesome5 name="trash" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <L t="Plot Area" />
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Inp ph="e.g. 1200" val={cfg.area} onChange={(v:any) => { const c=[...plotConfigs]; c[i].area=v; setPlotConfigs(c); }} kb="decimal-pad" style={{ flex: 1 }} />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingRight: 20 }}>
                    <View style={s.chips}>
                      {AREA_UNITS.map(u => <Chip key={u} label={u} selected={cfg.areaUnit===u} onPress={() => { const c=[...plotConfigs]; c[i].areaUnit=u; setPlotConfigs(c); }} />)}
                    </View>
                  </ScrollView>
                </View>
                <Row2>
                  <View style={{ flex: 1 }}><L t="Frontage (ft)" /><Inp ph="40" val={cfg.frontage} onChange={(v:any) => { const c=[...plotConfigs]; c[i].frontage=v; setPlotConfigs(c); }} kb="decimal-pad" /></View>
                  <View style={{ flex: 1 }}><L t="Price" /><Inp ph="4500000" val={cfg.price} onChange={(v:any) => { const c=[...plotConfigs]; c[i].price=v; setPlotConfigs(c); }} kb="decimal-pad" /></View>
                </Row2>
              </View>
            ))}
            <TouchableOpacity style={s.addBtnFull} onPress={() => setPlotConfigs(fs => [...fs, { id: Date.now(), title: '', area: '', areaUnit: 'Square Foot', price: '', frontage: '', roadWidth: '', facing: '' }])}>
              <FontAwesome5 name="plus-circle" size={16} color={PRIMARY} />
              <Text style={s.addBtnTxtFull}>Add Another Plot Size</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* FACING */}
        {!isPlot && (
          <><L t="Facing Direction" />
          <View style={s.chips}>
            {FACING.map(f => <Chip key={f} label={f} selected={facing===f} onPress={()=>setFacing(f)} />)}
          </View></>
        )}

        {/* Floor / Building */}
        {(isApt || isComm) && (
          <Row2>
            <View style={{ flex: 1 }}><L t="Floor Number" /><Inp ph="e.g. 5" val={floorNo} onChange={setFloorNo} kb="numeric" /></View>
            <View style={{ flex: 1 }}><L t="Total Floors" /><Inp ph="e.g. 18" val={totalFloors} onChange={setTotalFloors} kb="numeric" /></View>
          </Row2>
        )}

        {/* Villa / Apt Extras */}
        {(isApt || isVilla) && (
          <>
            <Row2>
              <View style={{ flex: 1 }}><L t="Bathrooms" />
                <View style={s.chips}>{['1','2','3','4','5+'].map(v=><Chip key={v} label={v} selected={bathrooms===v} onPress={()=>setBathrooms(v)} />)}</View>
              </View>
              <View style={{ flex: 1 }}><L t="Balconies" />
                <View style={s.chips}>{['0','1','2','3','4+'].map(v=><Chip key={v} label={v} selected={balconies===v} onPress={()=>setBalconies(v)} />)}</View>
              </View>
            </Row2>

            <L t="Furnishing Status" />
            <View style={s.chips}>
              {['Unfurnished','Semi-Furnished','Furnished'].map(v=><Chip key={v} label={v} selected={furnishing===v} onPress={()=>setFurnishing(v)} />)}
            </View>

            <L t="Car Parking" />
            <View style={s.chips}>
              {['None','1 Covered','1 Open','2 Covered','2+ Parking'].map(v=><Chip key={v} label={v} selected={parking===v} onPress={()=>setParking(v)} />)}
            </View>

            <L t="Ownership Type" />
            <View style={s.chips}>
              {['Freehold','Leasehold','Power of Attorney'].map(v=><Chip key={v} label={v} selected={ownershipType===v} onPress={()=>setOwnershipType(v)} />)}
            </View>
          </>
        )}

        {/* COMMERCIAL specifics */}
        {isComm && (
          <>
            <Divider title="Commercial Details" />
            <L t="Commercial Type" />
            <View style={s.chips}>
              {['Office Space','IT Park','Retail Shop','Showroom','Co-working Space','Business Center','Commercial Land'].map(v =>
                <Chip key={v} label={v} selected={commType===v} onPress={()=>setCommType(v)} />)}
            </View>
            <L t="Building Grade" />
            <View style={s.chips}>
              {['Grade A','Grade B','Grade C'].map(v=><Chip key={v} label={v} selected={commGrade===v} onPress={()=>setCommGrade(v)} />)}
            </View>
            <L t="Furnishing" />
            <View style={s.chips}>
              {['Unfurnished','Semi-Furnished','Fully Furnished'].map(v=><Chip key={v} label={v} selected={commFurnishing===v} onPress={()=>setCommFurnishing(v)} />)}
            </View>
            <Row2>
              <View style={{flex:1}}><L t="Ceiling Height (ft)" /><Inp ph="e.g. 12" val={commCeilingH} onChange={setCommCeilingH} kb="decimal-pad" /></View>
              <View style={{flex:1}}><L t="Washrooms" />
                <View style={s.chips}>{['Private','Common','Both'].map(v=><Chip key={v} label={v} selected={commWashrooms===v} onPress={()=>setCommWashrooms(v)} />)}</View>
              </View>
            </Row2>
          </>
        )}

        {/* LODGE / PG specifics */}
        {isLodge && (
          <>
            <Divider title="Room Details" />
            <L t="Room Type" req />
            <View style={s.chips}>
              {['Single Bed','2 Seater','3 Seater','4 Seater'].map(v=><Chip key={v} label={v} selected={roomType===v} onPress={()=>setRoomType(v)} />)}
            </View>
            <Row2>
              <View style={{flex:1}}><L t="AC / Non-AC" />
                <View style={s.chips}>{['AC','Non-AC'].map(v=><Chip key={v} label={v} selected={acType===v} onPress={()=>setAcType(v)} />)}</View>
              </View>
              <View style={{flex:1}}><L t="Bathroom" />
                <View style={s.chips}>{['Attached','Common'].map(v=><Chip key={v} label={v} selected={bathroomType===v} onPress={()=>setBathroomType(v)} />)}</View>
              </View>
            </Row2>
            <L t="Bed Type" />
            <View style={s.chips}>
              {['Single','Double','Bunk Bed'].map(v=><Chip key={v} label={v} selected={bedType===v} onPress={()=>setBedType(v)} />)}
            </View>
          </>
        )}

        {/* HOTEL */}
        {isHotel && (
          <>
            <Divider title="Hotel Details" />
            <L t="Hospitality Type" />
            <View style={s.chips}>
              {['Hotel','Resort','Guest House','Lodge','Service Apartment'].map(v=><Chip key={v} label={v} selected={hotelType===v} onPress={()=>setHotelType(v)} />)}
            </View>
            <Row2>
              <View style={{flex:1}}><L t="Star Rating (1-5)" /><Inp ph="e.g. 3" val={starRating} onChange={setStarRating} kb="numeric" /></View>
              <View style={{flex:1}}><L t="Total Rooms" /><Inp ph="e.g. 50" val={totalRooms} onChange={setTotalRooms} kb="numeric" /></View>
            </Row2>
          </>
        )}

        {/* Year Built — for all except lodge/hotel */}
        {!isLodge && !isHotel && (
          <View style={{ marginBottom: 12 }}>
            <L t="Year Built" /><Inp ph="e.g. 2020" val={constYear} onChange={setConstYear} kb="numeric" />
          </View>
        )}

        <View style={{ position: 'relative' }}>
          <L t="Property Description" req />
          <TouchableOpacity 
            style={[s.aiBtn, rewriting && { opacity: 0.6 }]} 
            onPress={handleAIRewrite} 
            disabled={rewriting}
          >
            {rewriting ? <ActivityIndicator size="small" color={PRIMARY} /> : (
              <><FontAwesome5 name="magic" size={10} color={PRIMARY} /><Text style={s.aiBtnTxt}>AI Rewrite</Text></>
            )}
          </TouchableOpacity>
          <Inp ph="Describe your property — highlights, nearby places, special features..." val={description} onChange={setDescription} multi />
        </View>
      </Card>

      {/* AMENITIES */}
      <Card>
        <Text style={s.cardTitle}>🏊 Amenities</Text>
        {AMENITY_GROUPS.map(g => (
          <View key={g.title} style={{ marginBottom: 16 }}>
            <Text style={s.amenGrpTitle}>{g.title}</Text>
            <View style={s.chips}>
              {g.items.map(a => <Chip key={a} label={a} selected={amenities.includes(a)} onPress={()=>toggleAmenity(a)} />)}
            </View>
          </View>
        ))}
      </Card>
    </>
  );

  // ============================================================
  // STEP 4
  // ============================================================
  const renderStep4 = () => (
    <>
      <Card>
        <Text style={s.cardTitle}>🎥 Photos, Videos & Brochure</Text>
        <Text style={s.helper}>Properties with Photos & Videos get 10x more inquiries.</Text>
        
        <TouchableOpacity style={s.pickBtn} onPress={pickPhotos}>
          <FontAwesome5 name="camera" size={18} color={PRIMARY} />
          <Text style={s.pickBtnTxt}>Add Photos (Max 15)</Text>
          {photos.length > 0 && <View style={s.mediaBadge}><Text style={{ color: '#fff', fontSize: 10 }}>{photos.length}</Text></View>}
        </TouchableOpacity>

        <View style={s.mediaRow}>
          <TouchableOpacity style={[s.mediaBtn, video && s.mediaBtnActive]} onPress={pickVideo}>
            <FontAwesome5 name="video" size={18} color={video ? PRIMARY : MUTED} />
            <Text style={s.mediaBtnTxt}>{video ? 'Video Added' : 'Add Video'}</Text>
            {video && <View style={s.mediaBadge}><FontAwesome5 name="check" size={8} color="#fff" /></View>}
          </TouchableOpacity>

          <TouchableOpacity style={[s.mediaBtn, brochure && s.mediaBtnActive]} onPress={pickBrochure}>
            <FontAwesome5 name="file-pdf" size={18} color={brochure ? PRIMARY : MUTED} />
            <Text style={s.mediaBtnTxt}>{brochure ? 'Brochure Added' : 'Add Brochure'}</Text>
            {brochure && <View style={s.mediaBadge}><FontAwesome5 name="check" size={8} color="#fff" /></View>}
          </TouchableOpacity>
        </View>

        {photos.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={s.amenGrpTitle}>Gallery Preview</Text>
            <View style={s.photoGrid}>
              {photos.map((p, i) => (
                <View key={i} style={s.photoItem}>
                  <Image source={{ uri: p.uri }} style={s.photoThumb} />
                  {i === 0 && <View style={s.coverBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>COVER</Text></View>}
                  <TouchableOpacity style={s.removeBtn} onPress={() => setPhotos(ps => ps.filter((_, j) => j !== i))}>
                    <FontAwesome5 name="times-circle" size={18} color={PRIMARY} />
                  </TouchableOpacity>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {['Exterior','Interior','Kitchen','Bedroom','Bathroom','Hall','Floor Plan'].map(cat => (
                        <TouchableOpacity key={cat}
                          style={[s.catChip, p.category===cat && s.catChipOn]}
                          onPress={() => { const c=[...photos]; c[i]={...p, category: cat}; setPhotos(c); }}>
                          <Text style={[s.catChipTxt, p.category===cat && { color: PRIMARY }]}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              ))}
            </View>
          </View>
        )}
        {photos.length === 0 && (
          <View style={s.noPhoto}>
            <FontAwesome5 name="images" size={48} color="#d1d5db" />
            <Text style={s.noPhotoTxt}>No photos selected yet</Text>
          </View>
        )}
      </Card>

      <Card>
        <Text style={s.cardTitle}>🔗 External Video Links (Optional)</Text>
        <Text style={s.helper}>Paste YouTube / Vimeo URLs</Text>
        {externalLinks.map((link, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <Inp ph="https://youtube.com/..." val={link} onChange={(v: string) => { const c=[...externalLinks]; c[i]=v; setExternalLinks(c); }} style={{ flex: 1 }} />
            {externalLinks.length > 1 && (
              <TouchableOpacity onPress={() => setExternalLinks(l => l.filter((_, j) => j !== i))}>
                <FontAwesome5 name="trash" size={14} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {externalLinks.length < 5 && (
          <TouchableOpacity onPress={() => setExternalLinks(l => [...l, ''])} style={s.addBtn}>
            <FontAwesome5 name="plus" size={12} color={PRIMARY} />
            <Text style={s.addBtnTxt}>Add another link</Text>
          </TouchableOpacity>
        )}
      </Card>
    </>
  );

  // ============================================================
  // STEP 5
  // ============================================================
  const renderStep5 = () => (
    <>
      <Card>
        <Text style={s.cardTitle}>💰 Pricing</Text>

        {/* Lodge / Hotel pricing */}
        {(isLodge || isHotel) ? (
          <>
            <L t="Price per Day (₹)" req /><Inp ph="e.g. 500" val={pricePerDay} onChange={setPricePerDay} kb="decimal-pad" />
            <L t="Price per Month (₹)" /><Inp ph="e.g. 8000" val={pricePerMonth} onChange={setPricePerMonth} kb="decimal-pad" />
            <L t="Security Deposit (₹)" /><Inp ph="e.g. 2000" val={secDeposit} onChange={setSecDeposit} kb="decimal-pad" />
          </>
        ) : (
          <>
            <View style={s.checkRow}>
              <TouchableOpacity onPress={()=>setPriceOnReq(p=>!p)} style={[s.checkbox, priceOnReq && s.checkboxOn]}>
                {priceOnReq && <FontAwesome5 name="check" size={10} color="#fff" />}
              </TouchableOpacity>
              <Text style={s.checkLbl}>Price on Request</Text>
            </View>
            {!priceOnReq && (
              <>
                <L t="Expected Price (₹)" req /><Inp ph="e.g. 8500000" val={price} onChange={setPrice} kb="decimal-pad" />
                <L t="Pricing Type" />
                <View style={s.chips}>
                  {['Per Unit','Per Sqft'].map(v=><Chip key={v} label={v} selected={pricingType===v} onPress={()=>setPricingType(v)} />)}
                </View>
                <L t="Price Type" />
                <View style={s.chips}>
                  {['Fixed','Negotiable','Price on request'].map(v=><Chip key={v} label={v} selected={priceType===v} onPress={()=>setPriceType(v)} />)}
                </View>
                <L t="Maintenance Charges (₹/month)" /><Inp ph="e.g. 5000" val={maintenance} onChange={setMaintenance} kb="decimal-pad" />
                <L t="Availability Date" /><Inp ph="YYYY-MM-DD" val={availability} onChange={setAvailability} />
              </>
            )}
          </>
        )}
      </Card>

      <Card>
        <Text style={s.cardTitle}>📞 Your Contact Details</Text>
        <View style={s.infoBox}>
          <FontAwesome5 name="info-circle" size={14} color={PRIMARY} style={{ marginTop: 2 }} />
          <Text style={s.infoBoxTxt}>These details may be shown publicly. Leave blank to route inquiries to your Lead Section privately.</Text>
        </View>
        <L t="Your Name" /><Inp ph="Full Name" val={cName} onChange={setCName} />
        <Row2>
          <View style={{ flex: 1 }}><L t="Mobile Number" /><Inp ph="+91 XXXXX XXXXX" val={cMobile} onChange={setCMobile} kb="phone-pad" /></View>
          <View style={{ flex: 1 }}><L t="RERA Number" /><Inp ph="MH/2023/123" val={rera} onChange={setRera} /></View>
        </Row2>
        <L t="Email Address" req /><Inp ph="your@email.com" val={cEmail} onChange={setCEmail} kb="email-address" />
        <L t="You are" />
        <View style={s.chips}>
          {['Property Owner','Builder / Developer','Authorised Agent'].map(v=><Chip key={v} label={v} selected={cRole===v} onPress={()=>setCRole(v)} />)}
        </View>
        <L t="Preferred Contact Time" />
        <View style={s.chips}>
          {['Any Time','Morning (9AM-12PM)','Afternoon (12PM-4PM)','Evening (4PM-8PM)'].map(v=><Chip key={v} label={v} selected={cTime===v} onPress={()=>setCTime(v)} />)}
        </View>
      </Card>
    </>
  );

  return (
    <SafeAreaView style={s.safe}>
      {renderProgressModal()}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: 16, 
          backgroundColor: BG, 
          borderBottomWidth: 1, 
          borderBottomColor: SURFACE_DIM 
        }}>
          <TouchableOpacity onPress={step > 1 ? prev : () => router.back()} style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 22, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <FontAwesome5 name="arrow-left" size={24} color="#FF5A36" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontFamily: 'Poppins-Bold', color: '#FF5A36' }}>Post Property</Text>
          <TouchableOpacity style={{ width: 44, alignItems: 'center' }}>
            <FontAwesome5 name="ellipsis-v" size={18} color={DARK} />
          </TouchableOpacity>
        </View>

        {renderStepBar()}

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          {renderScoreTips()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* MODALS */}
        <SearchableModal 
          visible={showStateModal} 
          onClose={() => setShowStateModal(false)}
          onSelect={(st: string) => { setState_(st); setCity(''); }}
          title="Select State"
          data={Object.keys(LOCATIONS).sort()}
          placeholder="Search states..."
        />
        <SearchableModal 
          visible={showCityModal} 
          onClose={() => setShowCityModal(false)}
          onSelect={(ct: string) => setCity(ct)}
          title="Select City"
          data={state ? [...LOCATIONS[state].sort(), 'Other'] : []}
          placeholder="Search cities..."
        />

        {/* Footer */}
        <View style={{ 
          padding: 24, 
          paddingBottom: Platform.OS === 'ios' ? 44 : 32,
          backgroundColor: '#fff', 
          borderTopWidth: 1, 
          borderTopColor: BORDER,
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 4
        }}>
          <TouchableOpacity onPress={step > 1 ? prev : () => router.back()}>
            <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: DARK }}>Back</Text>
          </TouchableOpacity>

          {step < 5 ? (
            <TouchableOpacity style={{ 
              backgroundColor: PRIMARY, 
              borderRadius: 16, 
              paddingVertical: 18, 
              paddingHorizontal: 40,
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 12,
              shadowColor: PRIMARY,
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 4
            }} onPress={next}>
              <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: '#fff' }}>Next: {LABELS[step]}</Text>
              <FontAwesome5 name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={{ 
              backgroundColor: '#16a34a', 
              borderRadius: 16, 
              paddingVertical: 18, 
              paddingHorizontal: 40,
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 12,
              shadowColor: '#16a34a',
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 4
            }} onPress={submit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> :
                <><FontAwesome5 name="rocket" size={14} color="#fff" /><Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: '#fff' }}>POST PROPERTY FREE</Text></>}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: DARK },
  stepBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4, backgroundColor: '#fff' },
  stepLabel: { textAlign: 'center', fontSize: 12, fontFamily: 'Inter-Regular', color: MUTED, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: PRIMARY },
  dotTxt: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: MUTED },
  line: { flex: 1, height: 2, backgroundColor: '#e5e7eb', marginHorizontal: 4 },
  lineOn: { backgroundColor: PRIMARY },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width:0, height:4 }, elevation: 4 },
  cardTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: DARK, marginBottom: 18 },
  label: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: DARK, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 16, height: 52, fontSize: 14, fontFamily: 'Poppins-Regular', color: DARK },
  selectTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff' },
  selectTriggerTxt: { fontSize: 15, fontFamily: 'Inter-Regular', color: DARK },
  ta: { height: 120, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff' },
  chipOn: { backgroundColor: '#fff5f3', borderColor: PRIMARY },
  chipTxt: { fontSize: 13, fontFamily: 'Inter-Medium', color: MUTED },
  chipTxtOn: { color: PRIMARY, fontFamily: 'Inter-SemiBold' },
  propGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  propItem: { width: '47%', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff', alignItems: 'center', gap: 8 },
  propItemOn: { borderColor: PRIMARY, backgroundColor: '#fff5f3' },
  propLbl: { fontSize: 12, fontFamily: 'Inter-Medium', color: MUTED, textAlign: 'center' },
  divider: { borderTopWidth: 1, borderTopColor: BORDER, marginTop: 16, marginBottom: 12, paddingTop: 12 },
  dividerTxt: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: PRIMARY },
  row2: { flexDirection: 'row', gap: 12 },
  helper: { fontSize: 12, fontFamily: 'Inter-Regular', color: MUTED, marginBottom: 14 },
  amenGrpTitle: { fontSize: 13, fontFamily: 'Inter-SemiBold', color: DARK, marginBottom: 8 },
  pickBtn: { borderWidth: 2, borderColor: PRIMARY, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 20, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff5f3', marginBottom: 16 },
  pickBtnTxt: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: PRIMARY },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoItem: { width: '47%', marginBottom: 8 },
  photoThumb: { width: '100%', height: 110, borderRadius: 10, backgroundColor: '#f3f4f6' },
  coverBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: PRIMARY, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  removeBtn: { position: 'absolute', top: 4, right: 4 },
  catChip: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff' },
  catChipOn: { borderColor: PRIMARY, backgroundColor: '#fff5f3' },
  catChipTxt: { fontSize: 10, fontFamily: 'Inter-Medium', color: MUTED },
  noPhoto: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  noPhotoTxt: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#9ca3af' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  addBtnTxt: { fontSize: 13, fontFamily: 'Inter-Medium', color: PRIMARY },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  checkLbl: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#374151' },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: '#fff5f3', borderWidth: 1, borderColor: '#fbd5cc', borderRadius: 10, padding: 12, marginBottom: 16 },
  infoBoxTxt: { flex: 1, fontSize: 12, fontFamily: 'Inter-Regular', color: '#374151', lineHeight: 18 },
  nextBtn: { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: PRIMARY, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width:0, height:4 }, elevation: 5 },
  nextTxt: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#fff' },
  // Progressive Upload Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  progressCard: { backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', width: '80%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },
  progressTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: DARK, marginTop: 20, marginBottom: 12 },
  progressBarWrap: { width: '100%', height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: PRIMARY },
  progressPercent: { fontSize: 14, fontFamily: 'Inter-Bold', color: PRIMARY },
  // Score Styles
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDER },
  scoreRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  scoreMax: { fontSize: 8, color: MUTED, marginTop: -2 },
  scoreLabel: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  scoreHint: { fontSize: 10, color: MUTED },
  stepHeader: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  stepRow: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4 },
  stepInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  stepSub: { fontSize: 11, fontFamily: 'Inter-Medium', color: MUTED, marginBottom: 2 },
  stepMain: { fontSize: 18, fontFamily: 'Poppins-Bold', color: DARK },
  tipsContainer: { paddingHorizontal: 16, marginBottom: 16 },
  tipsRowInner: { flexDirection: 'row', gap: 10 },
  tipItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tipItemActive: { backgroundColor: '#fff5f3', borderColor: '#fbd5cc', borderWidth: 1 },
  tipText: { fontSize: 10, color: MUTED, fontFamily: 'Inter-Medium' },
  aiBtn: { position: 'absolute', right: 10, top: 10, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: PRIMARY, flexDirection: 'row', alignItems: 'center', gap: 5, zIndex: 10 },
  aiBtnTxt: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: PRIMARY },
  mediaRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  mediaBtn: { flex: 1, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff', alignItems: 'center', gap: 8 },
  mediaBtnActive: { borderColor: PRIMARY, backgroundColor: '#fff5f3' },
  mediaBtnTxt: { fontSize: 13, fontFamily: 'Inter-SemiBold', color: DARK },
  mediaBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#16a34a', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  // Config Card
  configCard: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  addBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 12, borderWidth: 1.5, borderColor: PRIMARY, borderStyle: 'dashed', backgroundColor: '#fff5f3' },
  addBtnTxtFull: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: PRIMARY },
  selectTriggerSm: { borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 10, height: 48, justifyContent: 'center', backgroundColor: '#fff' },
  selectTriggerTxtSm: { fontSize: 12, fontFamily: 'Inter-Medium', color: DARK },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: BORDER, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
});
