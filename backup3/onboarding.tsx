import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
      Animated, KeyboardAvoidingView, Platform,
      Pressable,
      StyleSheet,
      Text, TextInput,
      View,
} from 'react-native';
import { SparklesIcon, UserCircleIcon } from 'react-native-heroicons/outline';

export default function Onboarding() {
      const router = useRouter();
      const [name, setName] = useState('');
      const [saving, setSaving] = useState(false);
      const scaleAnim = useRef(new Animated.Value(1)).current;

      const handleStart = async () => {
            if (!name.trim()) return;
            setSaving(true);

            Animated.sequence([
                  Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
                  Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();

            await AsyncStorage.setItem('user_name', name.trim());
            await AsyncStorage.setItem('onboarded', 'true');
            router.replace('/');
      };

      return (
            <KeyboardAvoidingView
                  style={styles.bg}
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                  <View style={styles.nebula1} />
                  <View style={styles.nebula2} />
                  <View style={styles.nebula3} />

                  <View style={styles.container}>

                        {/* Icon */}
                        <View style={styles.iconWrap}>
                              <LinearGradient
                                    colors={['#1a3a6e', '#0d2248']}
                                    style={styles.iconGradient}
                              >
                                    <SparklesIcon size={40} color="#4f9eff" />
                              </LinearGradient>
                        </View>

                        {/* Title */}
                        <Text style={styles.title} accessibilityRole="header">
                              Welcome to{'\n'}SpendSmart
                        </Text>
                        <Text style={styles.subtitle}>
                              Your AI-powered expense tracker.{'\n'}Let's personalize your experience.
                        </Text>

                        {/* Name Input */}
                        <View style={styles.inputSection}>
                              <Text style={styles.label}>WHAT'S YOUR NAME?</Text>
                              <View style={styles.inputRow}>
                                    <UserCircleIcon size={20} color="#253550" />
                                    <TextInput
                                          style={styles.input}
                                          placeholder="e.g. Dwight"
                                          placeholderTextColor="#1a2f4a"
                                          value={name}
                                          onChangeText={setName}
                                          autoFocus
                                          returnKeyType="done"
                                          onSubmitEditing={handleStart}
                                          accessibilityLabel="Your name"
                                          accessibilityHint="Enter your name to personalize the app"
                                    />
                              </View>
                        </View>

                        {/* Start Button */}
                        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
                              <Pressable
                                    style={[styles.button, !name.trim() && styles.buttonDisabled]}
                                    onPress={handleStart}
                                    disabled={!name.trim() || saving}
                                    accessibilityRole="button"
                                    accessibilityLabel="Get started"
                                    accessibilityState={{ disabled: !name.trim() }}
                              >
                                    <LinearGradient
                                          colors={name.trim() ? ['#1a3a6e', '#0d2248'] : ['#0a0f1a', '#0a0f1a']}
                                          start={{ x: 0, y: 0 }}
                                          end={{ x: 1, y: 0 }}
                                          style={styles.buttonGradient}
                                    >
                                          <SparklesIcon size={18} color={name.trim() ? '#4f9eff' : '#1a2f4a'} />
                                          <Text style={[styles.buttonText, !name.trim() && styles.buttonTextDisabled]}>
                                                Get Started
                                          </Text>
                                    </LinearGradient>
                              </Pressable>
                        </Animated.View>

                        <Text style={styles.footer}>
                              Your data stays private on your device 🔒
                        </Text>

                  </View>
            </KeyboardAvoidingView>
      );
}

const styles = StyleSheet.create({
      bg: { flex: 1, backgroundColor: '#02040e' },
      nebula1: {
            position: 'absolute', width: 380, height: 380,
            borderRadius: 190, backgroundColor: '#0a1f5e',
            top: -120, right: -100, opacity: 0.4,
      },
      nebula2: {
            position: 'absolute', width: 260, height: 260,
            borderRadius: 130, backgroundColor: '#1a0a3e',
            top: 300, left: -80, opacity: 0.3,
      },
      nebula3: {
            position: 'absolute', width: 200, height: 200,
            borderRadius: 100, backgroundColor: '#072a2a',
            bottom: 100, right: -50, opacity: 0.25,
      },
      container: {
            flex: 1,
            paddingHorizontal: 28,
            justifyContent: 'center',
            alignItems: 'center',
      },
      iconWrap: {
            marginBottom: 32,
            shadowColor: '#4f9eff',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
      },
      iconGradient: {
            width: 90,
            height: 90,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#1a3a6e',
      },
      title: {
            fontSize: 40,
            fontWeight: '800',
            color: '#f0f4ff',
            textAlign: 'center',
            letterSpacing: -1.5,
            lineHeight: 46,
            marginBottom: 14,
      },
      subtitle: {
            fontSize: 15,
            color: '#253550',
            textAlign: 'center',
            lineHeight: 22,
            fontWeight: '500',
            marginBottom: 48,
      },
      inputSection: {
            width: '100%',
            marginBottom: 20,
      },
      label: {
            color: '#1a2f4a',
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 2,
            marginBottom: 10,
      },
      inputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#060d1e',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#0f1f35',
            paddingHorizontal: 16,
            gap: 12,
      },
      input: {
            flex: 1,
            color: '#f0f4ff',
            fontSize: 20,
            fontWeight: '700',
            paddingVertical: 16,
            letterSpacing: -0.3,
      },
      button: {
            borderRadius: 18,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#1a3a6e',
            marginBottom: 20,
      },
      buttonDisabled: {
            borderColor: '#0f1f35',
      },
      buttonGradient: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 18,
      },
      buttonText: {
            color: '#4f9eff',
            fontSize: 16,
            fontWeight: '800',
            letterSpacing: 0.2,
      },
      buttonTextDisabled: {
            color: '#1a2f4a',
      },
      footer: {
            color: '#1a2f4a',
            fontSize: 12,
            fontWeight: '500',
            textAlign: 'center',
      },
});
