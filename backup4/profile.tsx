import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowRightStartOnRectangleIcon, CheckIcon, TrashIcon, UserCircleIcon } from 'react-native-heroicons/outline';
import { saveExpenses } from './index';

export default function Profile() {
  const [name, setName] = useState('');
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);
  const [expenseCount, setExpenseCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('user_name').then((n) => { if (n) { setName(n); setEditName(n); } });
    AsyncStorage.getItem('expenses').then((data) => { if (data) setExpenseCount(JSON.parse(data).length); });
  }, []);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    await AsyncStorage.setItem('user_name', editName.trim());
    setName(editName.trim()); setEditing(false);
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'Delete all expenses permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: async () => { await saveExpenses([]); setExpenseCount(0); Alert.alert('Done', 'All expenses cleared.'); } },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset App', 'Clear all data and return to onboarding?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => { await AsyncStorage.clear(); } },
    ]);
  };

  return (
    <View style={styles.bg}>
      <View style={styles.nebula1} />
      <View style={styles.nebula2} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.heading} accessibilityRole="header">Profile</Text>
          <Text style={styles.sub}>Manage your account</Text>
        </View>

        <View style={styles.avatarSection}>
          <LinearGradient colors={['#1a3a6e', '#0d2248']} style={styles.avatar}>
            <UserCircleIcon size={36} color="#4f9eff" />
          </LinearGradient>
          <Text style={styles.avatarName}>{name || 'User'}</Text>
          <Text style={styles.avatarSub}>{expenseCount} expenses tracked</Text>
        </View>

        <Text style={styles.sectionLabel}>YOUR NAME</Text>
        <View style={styles.card}>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput style={styles.nameInput} value={editName} onChangeText={setEditName} autoFocus accessibilityLabel="Edit name" returnKeyType="done" onSubmitEditing={handleSaveName} />
              <Pressable style={styles.saveNameBtn} onPress={handleSaveName} accessibilityRole="button" accessibilityLabel="Save name">
                <CheckIcon size={15} color="#4f9eff" />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.nameRow} onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel={`Name: ${name}. Tap to edit.`}>
              <Text style={styles.nameText}>{name || 'Tap to set name'}</Text>
              <Text style={styles.editHint}>Edit</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionLabel}>STATS</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard} accessible accessibilityLabel={`${expenseCount} total expenses`}>
            <Text style={styles.statValue}>{expenseCount}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <View style={styles.statCard} accessible accessibilityLabel="Member since March 2026">
            <Text style={styles.statValue}>Mar</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>DANGER ZONE</Text>
        <Pressable style={styles.dangerCard} onPress={handleClearData} accessibilityRole="button" accessibilityLabel="Clear all expense data">
          <TrashIcon size={15} color="#f87171" />
          <View style={styles.dangerInfo}>
            <Text style={styles.dangerTitle}>Clear All Expenses</Text>
            <Text style={styles.dangerSub}>Permanently delete all expense data</Text>
          </View>
        </Pressable>

        <Pressable style={styles.dangerCard} onPress={handleReset} accessibilityRole="button" accessibilityLabel="Reset app">
          <ArrowRightStartOnRectangleIcon size={15} color="#f87171" />
          <View style={styles.dangerInfo}>
            <Text style={styles.dangerTitle}>Reset App</Text>
            <Text style={styles.dangerSub}>Clear everything and restart onboarding</Text>
          </View>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#02040e' },
  nebula1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: '#0a1f5e', top: -60, right: -60, opacity: 0.25 },
  nebula2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#1a0a3e', top: 350, left: -50, opacity: 0.2 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { marginTop: 56, marginBottom: 14 },
  heading: { fontSize: 22, fontWeight: '800', color: '#f0f4ff', letterSpacing: -0.5 },
  sub: { fontSize: 12, color: '#253550', marginTop: 2, fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginBottom: 22 },
  avatar: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#1a3a6e' },
  avatarName: { color: '#f0f4ff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  avatarSub: { color: '#253550', fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionLabel: { color: '#1a2f4a', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 6, marginTop: 16 },
  card: { backgroundColor: '#060d1e', borderRadius: 12, borderWidth: 1, borderColor: '#0f1f35', paddingHorizontal: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  nameText: { color: '#e8eeff', fontSize: 14, fontWeight: '700' },
  editHint: { color: '#253550', fontSize: 12, fontWeight: '600' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  nameInput: { flex: 1, color: '#f0f4ff', fontSize: 14, fontWeight: '700', paddingVertical: 6 },
  saveNameBtn: { backgroundColor: '#0d2248', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#1a3a6e' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, backgroundColor: '#060d1e', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#0f1f35' },
  statValue: { color: '#e8eeff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  statLabel: { color: '#253550', fontSize: 10, fontWeight: '700', marginTop: 3, letterSpacing: 0.3 },
  dangerCard: { backgroundColor: '#060d1e', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#1a0808' },
  dangerInfo: { flex: 1 },
  dangerTitle: { color: '#f87171', fontSize: 13, fontWeight: '700' },
  dangerSub: { color: '#253550', fontSize: 11, marginTop: 1, fontWeight: '500' },
});
