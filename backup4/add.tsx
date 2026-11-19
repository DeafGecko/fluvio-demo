import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  CheckIcon, CubeIcon, DocumentIcon, FilmIcon,
  HeartIcon, ShoppingBagIcon, ShoppingCartIcon,
  TruckIcon, XMarkIcon,
} from 'react-native-heroicons/outline';
import { loadExpenses } from './index';
import type { Expense } from './index';

const CATEGORIES = [
  { Icon: ShoppingCartIcon, name: 'Food', color: '#4ade80' },
  { Icon: TruckIcon, name: 'Transport', color: '#4f9eff' },
  { Icon: FilmIcon, name: 'Entertainment', color: '#a855f7' },
  { Icon: HeartIcon, name: 'Health', color: '#f87171' },
  { Icon: ShoppingBagIcon, name: 'Shopping', color: '#fb923c' },
  { Icon: DocumentIcon, name: 'Bills', color: '#facc15' },
  { Icon: CubeIcon, name: 'Other', color: '#94a3b8' },
];

const STORAGE_KEY = 'expenses';

export default function AddExpense() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Oops', 'Please enter an expense name.'); return; }
    if (!amount || isNaN(parseFloat(amount))) { Alert.alert('Oops', 'Please enter a valid amount.'); return; }
    if (!selectedCategory) { Alert.alert('Oops', 'Please select a category.'); return; }
    setSaving(true);
    const newExpense: Expense = {
      id: Date.now().toString(), name: name.trim(),
      amount: parseFloat(amount), category: selectedCategory,
      note: note.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    try {
      const existing = await loadExpenses();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newExpense]));
      router.back();
    } catch { Alert.alert('Error', 'Could not save.'); }
    finally { setSaving(false); }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.nebula1} />
      <View style={styles.nebula2} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.heading} accessibilityRole="header">New Expense</Text>
          <Text style={styles.sub}>Track where your money goes</Text>
        </View>

        <Text style={styles.label}>WHAT DID YOU SPEND ON?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Starbucks, Rent, Uber..."
          placeholderTextColor="#1a2f4a"
          value={name} onChangeText={setName}
          accessibilityLabel="Expense name"
          returnKeyType="next"
        />

        <Text style={styles.label}>AMOUNT</Text>
        <View style={styles.amountRow}>
          <Text style={styles.dollar} accessibilityElementsHidden>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00" placeholderTextColor="#1a2f4a"
            value={amount} onChangeText={setAmount}
            keyboardType="decimal-pad"
            accessibilityLabel="Expense amount in dollars"
          />
        </View>

        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categoryGrid} accessibilityRole="radiogroup">
          {CATEGORIES.map((cat) => {
            const selected = selectedCategory === cat.name;
            return (
              <Pressable
                key={cat.name}
                style={[styles.catBtn, selected && { borderColor: cat.color + '60', backgroundColor: cat.color + '10' }]}
                accessibilityRole="radio"
                accessibilityLabel={cat.name}
                accessibilityState={{ checked: selected }}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <cat.Icon size={14} color={selected ? cat.color : '#1a2f4a'} />
                <Text style={[styles.catName, selected && { color: cat.color }]}>{cat.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>NOTE <Text style={styles.optional}>· OPTIONAL</Text></Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Any extra details..."
          placeholderTextColor="#1a2f4a"
          value={note} onChangeText={setNote}
          multiline numberOfLines={3}
          accessibilityLabel="Optional note"
          textAlignVertical="top"
        />

        <Pressable
          style={[styles.saveButton, saving && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel={saving ? 'Saving' : 'Save expense'}
          accessibilityState={{ disabled: saving, busy: saving }}
          onPress={handleSave} disabled={saving}
        >
          <LinearGradient colors={['#1a3a6e', '#0d2248']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGrad}>
            <CheckIcon size={14} color="#4f9eff" />
            <Text style={styles.saveTxt}>{saving ? 'Saving...' : 'Save Expense'}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable style={styles.cancelButton} accessibilityRole="button" accessibilityLabel="Cancel" onPress={() => router.back()}>
          <XMarkIcon size={12} color="#253550" />
          <Text style={styles.cancelTxt}>Cancel</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#02040e' },
  nebula1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#0a1a4e', top: -80, right: -70, opacity: 0.4 },
  nebula2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#2a0a4e', top: 200, left: -50, opacity: 0.3 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { marginTop: 56, marginBottom: 16 },
  heading: { fontSize: 22, fontWeight: '800', color: '#f0f4ff', letterSpacing: -0.5 },
  sub: { fontSize: 12, color: '#253550', marginTop: 2, fontWeight: '600' },
  label: { color: '#1a2f4a', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6, marginTop: 14 },
  optional: { color: '#111f35', fontWeight: '600' },
  input: { backgroundColor: '#060d1e', borderRadius: 12, padding: 12, color: '#e8eeff', fontSize: 14, fontWeight: '600', borderWidth: 1, borderColor: '#0f1f35' },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#060d1e', borderRadius: 12, borderWidth: 1, borderColor: '#0f1f35', paddingHorizontal: 12 },
  dollar: { color: '#1a2f4a', fontSize: 20, fontWeight: '800', marginRight: 4 },
  amountInput: { flex: 1, color: '#f0f4ff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5, paddingVertical: 10 },
  noteInput: { height: 70, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catBtn: { backgroundColor: '#060d1e', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: '#0f1f35', flexDirection: 'row', alignItems: 'center', gap: 5 },
  catName: { color: '#1a2f4a', fontSize: 12, fontWeight: '700' },
  saveButton: { borderRadius: 13, marginTop: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#1a3a6e' },
  saveGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 },
  saveTxt: { color: '#4f9eff', fontSize: 14, fontWeight: '800' },
  cancelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, marginBottom: 32 },
  cancelTxt: { color: '#253550', fontSize: 13, fontWeight: '600' },
});
