import AsyncStorage from '@react-native-async-storage/async-storage';
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
import type { Expense } from './backup-index';
import { loadExpenses } from './backup-index';

const CATEGORIES = [
      { Icon: ShoppingCartIcon, name: 'Food', color: '#4ade80' },
      { Icon: TruckIcon, name: 'Transport', color: '#60a5fa' },
      { Icon: FilmIcon, name: 'Entertainment', color: '#c084fc' },
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
            } finally {
                  setSaving(false);
            }
      };

      return (
            <ScrollView
                  style={styles.container}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  accessibilityRole="scrollview"
            >
                  {/* Header */}
                  <View style={styles.header}>
                        <Text
                              style={styles.heading}
                              accessibilityRole="header"
                        >
                              New Expense
                        </Text>
                        <Text style={styles.subHeading}>Track where your money goes</Text>
                  </View>

                  {/* Name */}
                  <Text style={styles.label}>WHAT DID YOU SPEND ON?</Text>
                  <TextInput
                        style={styles.input}
                        placeholder="e.g. Starbucks, Rent, Uber..."
                        placeholderTextColor="#2d3f55"
                        value={name}
                        onChangeText={setName}
                        accessibilityLabel="Expense name"
                        accessibilityHint="Enter what you spent money on"
                        returnKeyType="next"
                  />

                  {/* Amount */}
                  <Text style={styles.label}>AMOUNT</Text>
                  <View style={styles.amountRow}>
                        <Text
                              style={styles.dollarSign}
                              accessibilityElementsHidden={true}
                        >
                              $
                        </Text>
                        <TextInput
                              style={styles.amountInput}
                              placeholder="0.00"
                              placeholderTextColor="#2d3f55"
                              value={amount}
                              onChangeText={setAmount}
                              keyboardType="decimal-pad"
                              accessibilityLabel="Expense amount in dollars"
                              accessibilityHint="Enter the dollar amount you spent"
                              returnKeyType="done"
                        />
                  </View>

                  {/* Category */}
                  <Text style={styles.label}>CATEGORY</Text>
                  <View
                        style={styles.categoryGrid}
                        accessibilityRole="radiogroup"
                        accessibilityLabel="Select a spending category"
                  >
                        {CATEGORIES.map((cat) => {
                              const selected = selectedCategory === cat.name;
                              return (
                                    <Pressable
                                          key={cat.name}
                                          style={[styles.categoryButton, selected && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
                                          accessibilityRole="radio"
                                          accessibilityLabel={cat.name}
                                          accessibilityState={{ checked: selected }}
                                          onPress={() => setSelectedCategory(cat.name)}
                                    >
                                          <cat.Icon
                                                size={18}
                                                color={selected ? cat.color : '#2d3f55'}
                                          />
                                          <Text style={[styles.catName, selected && { color: cat.color }]}>
                                                {cat.name}
                                          </Text>
                                    </Pressable>
                              );
                        })}
                  </View>

                  {/* Note */}
                  <Text style={styles.label}>
                        NOTE{' '}
                        <Text style={styles.optional}>· OPTIONAL</Text>
                  </Text>
                  <TextInput
                        style={[styles.input, styles.noteInput]}
                        placeholder="Any extra details..."
                        placeholderTextColor="#2d3f55"
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                        accessibilityLabel="Optional note about this expense"
                        textAlignVertical="top"
                  />

                  {/* Save */}
                  <Pressable
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        accessibilityRole="button"
                        accessibilityLabel={saving ? 'Saving expense, please wait' : 'Save expense'}
                        accessibilityState={{ disabled: saving, busy: saving }}
                        onPress={handleSave}
                        disabled={saving}
                  >
                        <View style={styles.buttonRow}>
                              <CheckIcon size={18} color="#111827" />
                              <Text style={styles.saveButtonText}>
                                    {saving ? 'Saving...' : 'Save Expense'}
                              </Text>
                        </View>
                  </Pressable>

                  {/* Cancel */}
                  <Pressable
                        style={styles.cancelButton}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel and go back"
                        onPress={() => router.back()}
                  >
                        <View style={styles.buttonRow}>
                              <XMarkIcon size={16} color="#4a6080" />
                              <Text style={styles.cancelText}>Cancel</Text>
                        </View>
                  </Pressable>

            </ScrollView>
      );
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: '#111827',
            paddingHorizontal: 20,
      },
      header: {
            marginTop: 60,
            marginBottom: 28,
      },
      heading: {
            fontSize: 32,
            fontWeight: '800',
            color: '#e2e8f0',
            letterSpacing: -0.5,
      },
      subHeading: {
            fontSize: 14,
            color: '#4a6080',
            marginTop: 4,
            fontWeight: '500',
      },
      label: {
            color: '#2d3f55',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1.5,
            marginBottom: 10,
            marginTop: 22,
      },
      optional: {
            color: '#1e293b',
            fontWeight: '600',
      },
      input: {
            backgroundColor: '#1a2332',
            borderRadius: 14,
            padding: 16,
            color: '#e2e8f0',
            fontSize: 16,
            fontWeight: '500',
            borderWidth: 1,
            borderColor: '#243044',
      },
      amountRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1a2332',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#243044',
            paddingHorizontal: 16,
      },
      dollarSign: {
            color: '#2d3f55',
            fontSize: 24,
            fontWeight: '700',
            marginRight: 6,
      },
      amountInput: {
            flex: 1,
            color: '#e2e8f0',
            fontSize: 32,
            fontWeight: '700',
            letterSpacing: -0.5,
            paddingVertical: 16,
      },
      noteInput: {
            height: 90,
            textAlignVertical: 'top',
      },
      categoryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
      },
      categoryButton: {
            backgroundColor: '#1a2332',
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: '#243044',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
      },
      catName: {
            color: '#2d3f55',
            fontSize: 13,
            fontWeight: '600',
      },
      saveButton: {
            backgroundColor: '#e2e8f0',
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
            marginTop: 36,
      },
      saveButtonDisabled: {
            backgroundColor: '#1a2332',
      },
      saveButtonText: {
            color: '#111827',
            fontSize: 15,
            fontWeight: '800',
            letterSpacing: 0.2,
      },
      buttonRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
      },
      cancelButton: {
            padding: 16,
            alignItems: 'center',
            marginBottom: 40,
      },
      cancelText: {
            color: '#4a6080',
            fontSize: 14,
            fontWeight: '600',
      },
});