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
      await setToken(result.token);
    } catch (error: any) {
      console.error("Auth error:", error.message);
      Alert.alert('Authentication Failed', error.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 w-full max-w-md mx-auto">
      <Text className="text-dark font-poppins-bold text-2xl mb-6 text-center">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </Text>

      {!isLogin && (
        <View className="mb-4">
          <Text className="text-text-muted font-inter-medium text-sm mb-1.5 ml-1">Full Name</Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-4 bg-gray-50">
            <FontAwesome5 name="user" size={14} color="#6b7280" />
            <TextInput
              className="flex-1 py-3 ml-3 text-dark font-inter"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-text-muted font-inter-medium text-sm mb-1.5 ml-1">Email Address</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg px-4 bg-gray-50">
          <FontAwesome5 name="envelope" size={14} color="#6b7280" />
          <TextInput
            className="flex-1 py-3 ml-3 text-dark font-inter"
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-text-muted font-inter-medium text-sm mb-1.5 ml-1">Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg px-4 bg-gray-50">
          <FontAwesome5 name="lock" size={14} color="#6b7280" />
          <TextInput
            className="flex-1 py-3 ml-3 text-dark font-inter"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleSubmit} 
        disabled={loading}
        className={`w-full bg-primary rounded-lg py-3.5 items-center justify-center shadow-sm ${loading ? 'opacity-70' : ''}`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-poppins-semibold text-base">
            {isLogin ? 'Log In' : 'Sign Up'}
          </Text>
        )}
      </TouchableOpacity>

      <View className="mt-6 flex-row items-center justify-center">
        <Text className="text-text-muted font-inter text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
        </Text>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text className="text-primary font-inter-semibold text-sm">
            {isLogin ? 'Register' : 'Log In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
