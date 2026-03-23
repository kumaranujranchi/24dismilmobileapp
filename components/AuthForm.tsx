import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { setToken } = useAuth();
  
  const loginMutation = useMutation(api.auth.login);
  const registerMutation = useMutation(api.auth.register);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await loginMutation({ email, password });
      } else {
        result = await registerMutation({ name, email, password });
      }
      
      // Save token to SecureStore context
      await setToken(result?.token);
    } catch (error: any) {
      console.log('--- AUTH ERROR DEBUG ---');
      console.log(error);
      console.log('Error message:', error.message);
      Alert.alert('Authentication Failed', `Error: ${error.message} \n\nPlease ensure your local time is correct and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const getInputContainerStyle = (fieldName: string) => {
    return `flex-row items-center border ${
      focusedField === fieldName ? 'border-primary bg-white shadow-sm' : 'border-gray-200 bg-gray-50'
    } rounded-xl px-4 py-0.5 transition-all`;
  };

  return (
    <View className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 w-full max-w-md mx-auto">
      <Text className="text-dark font-poppins-bold text-3xl mb-2 text-center">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </Text>
      <Text className="text-text-muted font-inter text-sm mb-8 text-center">
        {isLogin ? 'Enter your details to continue' : 'Sign up to start your journey'}
      </Text>

      {!isLogin && (
        <View className="mb-5">
          <Text className="text-dark font-inter-semibold text-xs mb-2 ml-1 uppercase tracking-wider opacity-60">Full Name</Text>
          <View className={getInputContainerStyle('name')}>
            <FontAwesome5 name="user" size={14} color={focusedField === 'name' ? Colors.primary : "#9ca3af"} />
            <TextInput
              className="flex-1 py-3.5 ml-3 text-dark font-inter text-[15px]"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              // @ts-ignore
              style={{ outlineStyle: 'none' }}
            />
          </View>
        </View>
      )}

      <View className="mb-5">
        <Text className="text-dark font-inter-semibold text-xs mb-2 ml-1 uppercase tracking-wider opacity-60">Email Address</Text>
        <View className={getInputContainerStyle('email')}>
          <FontAwesome5 name="envelope" size={14} color={focusedField === 'email' ? Colors.primary : "#9ca3af"} />
          <TextInput
            className="flex-1 py-3.5 ml-3 text-dark font-inter text-[15px]"
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="none"
            keyboardType="email-address"
            // @ts-ignore
            style={{ outlineStyle: 'none' }}
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-dark font-inter-semibold text-xs mb-2 ml-1 uppercase tracking-wider opacity-60">Password</Text>
        <View className={getInputContainerStyle('password')}>
          <FontAwesome5 name="lock" size={14} color={focusedField === 'password' ? Colors.primary : "#9ca3af"} />
          <TextInput
            className="flex-1 py-3.5 ml-3 text-dark font-inter text-[15px]"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            secureTextEntry
            // @ts-ignore
            style={{ outlineStyle: 'none' }}
          />
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleSubmit} 
        disabled={loading}
        className={`w-full bg-primary rounded-xl py-4 items-center justify-center shadow-lg shadow-primary/20 ${loading ? 'opacity-70' : ''}`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-poppins-semibold text-lg">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>
        )}
      </TouchableOpacity>

      <View className="mt-8 flex-row items-center justify-center">
        <Text className="text-text-muted font-inter text-[14px]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
        </Text>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text className="text-primary font-poppins-semibold text-[14px]">
            {isLogin ? 'Register' : 'Log In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
