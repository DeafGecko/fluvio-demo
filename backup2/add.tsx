import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
      Alert,
      Pressable,
      ScrollView,
      StyleSheet,
      Text, TextInput,
      View,
} from 'react-native';
import {
      CheckIcon,
      CubeIcon,
      DocumentIcon,
      FilmIcon, HeartIcon,
      ShoppingBagIcon,
      ShoppingCartIcon, TruckIcon,
      XMarkIcon,
} from 'react-native-heroicons/outline';
import type { Expense } from '../backup4/index';
import { loadExpenses } from '../backup4/index';

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
                  id: Date.now().toString(),
                  name: name.trim(),
                  amount: parseFloat(amount),
                  category: selectedCategory,
                  note: note.trim(),
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            };
            try {
                  const existing = await loadExpenses();
                  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newExpense]));
                  router.back();
            } catch {
                  Alert.alert('Error', 'Could not save. Please try again.');
            } finally { setSaving(false); }
      };

      return (
            <View style={styles.bg}>
                  <View style={styles.nebula1} />
                  <View style={styles.nebula2} />
                  <View style={styles.nebula3} />
                  <View style={styles.nebula4} />
                  <ScrollView
                        style={styles.container}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                  >
                        <View style={styles.header}>
                              <Text style={styles.heading} accessibilityRole="header">New Expense</Text>
                              <Text style={styles.subHeading}>Track where your money goes</Text>
                        </View>

                        <Text style={styles.label}>WHAT DID YOU SPEND ON?</Text>
                        <TextInput
                              style={styles.input}
                              placeholder="e.g. Starbucks, Rent, Uber..."
                              placeholderTextColor="#1a2f4a"
                              value={name}
                              onChangeText={setName}
                              accessibilityLabel="Expense name"
                              accessibilityHint="Enter what you spent money on"
                        />

                        <Text style={styles.label}>AMOUNT</Text>
                        <View style={styles.amountRow}>
                              <Text style={styles.dollarSign} accessibilityElementsHidden>$</Text>
                              <TextInput
                                    style={styles.amountInput}
                                    placeholder="0.00"
                                    placeholderTextColor="#1a2f4a"
                                    value={amount}
                                    onChangeText={setAmount}
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
                                                style={[
                                                      styles.categoryButton,
                                                      selected && { borderColor: cat.color + '60', backgroundColor: cat.color + '10' },
                                                ]}
                                                accessibilityRole="radio"
                                                accessibilityLabel={cat.name}
                                                accessibilityState={{ checked: selected }}
                                                onPress={() => setSelectedCategory(cat.name)}
                                          >
                                                <cat.Icon size={17} color={selected ? cat.color : '#1a2f4a'} />
                                                <Text style={[styles.catName, selected && { color: cat.color }]}>
                                                      {cat.name}
                                                </Text>
                                          </Pressable>
                                    );
                              })}
                        </View>

                        <Text style={styles.label}>
                              NOTE <Text style={styles.optional}>· OPTIONAL</Text>
                        </Text>
                        <TextInput
                              style={[styles.input, styles.noteInput]}
                              placeholder="Any extra details..."
                              placeholderTextColor="#1a2f4a"
                              value={note}
                              onChangeText={setNote}
                              multiline
                              numberOfLines={3}
                              accessibilityLabel="Optional note"
                              textAlignVertical="top"
                        />

                        <Pressable
                              style={[styles.saveButton, saving && { opacity: 0.5 }]}
                              accessibilityRole="button"
                              accessibilityLabel={saving ? 'Saving, please wait' : 'Save expense'}
                              accessibilityState={{ disabled: saving, busy: saving }}
                              onPress={handleSave}
                              disabled={saving}
                        >
                              <LinearGradient
                                    colors={['#1a3a6e', '#0d2248']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.saveGradient}
                              >
                                    <CheckIcon size={18} color="#4f9eff" />
                                    <Text style={styles.saveButtonText}>
                                          {saving ? 'Saving...' : 'Save Expense'}
                                    </Text>
                              </LinearGradient>
                        </Pressable>

                        <Pressable
                              style={styles.cancelButton}
                              accessibilityRole="button"
                              accessibilityLabel="Cancel and go back"
                              onPress={() => router.back()}
                        >
                              <XMarkIcon size={15} color="#253550" />
                              <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>

                  </ScrollView>
            </View>
      );
}

const styles = StyleSheet.create({
      bg: { flex: 1, backgroundColor: '#02040e' },
      nebula1: {
            position: 'absolute', width: 340, height: 340,
            borderRadius: 170, backgroundColor: '#0a1a4e',
            top: -100, right: -80, opacity: 0.25,
      },
      nebula2: {
            position: 'absolute', width: 220, height: 220,
            borderRadius: 110, backgroundColor: '#2a0a4e',
            top: 150, left: -70, opacity: 0.25,
      },
      nebula3: {
            position: 'absolute', width: 180, height: 260,
            borderRadius: 100, backgroundColor: '#071a3a',
            top: 420, right: -40, opacity: 0.2,
      },
      nebula4: {
            position: 'absolute', width: 240, height: 140,
            borderRadius: 90, backgroundColor: '#1a0a2e',
            top: 640, left: -30, opacity: 0.1,
      },
      container: { flex: 1, paddingHorizontal: 20 },
      header: { marginTop: 70, marginBottom: 28 },
      heading: {
            fontSize: 34, fontWeight: '800', color: '#f0f4ff', letterSpacing: -1,
      },
      subHeading: {
            fontSize: 14, color: '#253550', marginTop: 4, fontWeight: '600', letterSpacing: 0.3,
      },
      label: {
            color: '#1a2f4a', fontSize: 11, fontWeight: '800',
            letterSpacing: 2, marginBottom: 10, marginTop: 22,
      },
      optional: { color: '#111f35', fontWeight: '600' },
      input: {
            backgroundColor: '#060d1e', borderRadius: 16,
            padding: 16, color: '#e8eeff', fontSize: 16,
            fontWeight: '600', borderWidth: 1, borderColor: '#0f1f35',
      },
      amountRow: {
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#060d1e', borderRadius: 16,
            borderWidth: 1, borderColor: '#0f1f35', paddingHorizontal: 16,
      },
      dollarSign: { color: '#1a2f4a', fontSize: 26, fontWeight: '800', marginRight: 6 },
      amountInput: {
            flex: 1, color: '#f0f4ff', fontSize: 34,
            fontWeight: '800', letterSpacing: -1, paddingVertical: 16,
      },
      noteInput: { height: 90, textAlignVertical: 'top' },
      categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
      categoryButton: {
            backgroundColor: '#060d1e', borderRadius: 13,
            paddingVertical: 10, paddingHorizontal: 14,
            borderWidth: 1, borderColor: '#0f1f35',
            flexDirection: 'row', alignItems: 'center', gap: 7,
      },
      catName: { color: '#1a2f4a', fontSize: 13, fontWeight: '700' },
      saveButton: {
            borderRadius: 18, marginTop: 36,
            overflow: 'hidden', borderWidth: 1, borderColor: '#1a3a6e',
      },
      saveGradient: {
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'center', gap: 10, padding: 18,
      },
      saveButtonText: { color: '#4f9eff', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
      cancelButton: {
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'center', gap: 8, padding: 16, marginBottom: 40,
      },
      cancelText: { color: '#253550', fontSize: 14, fontWeight: '600' },
});