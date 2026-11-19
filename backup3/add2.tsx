import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert, Animated, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import {
  CheckIcon, CubeIcon, DocumentIcon, FilmIcon,
  HeartIcon, ShoppingBagIcon, ShoppingCartIcon,
  TruckIcon, XMarkIcon,
} from 'react-native-heroicons/outline';
import type { Expense } from '../backup4/index';
import { loadExpenses } from '../backup4/index';

const CATEGORIES = [
  { Icon: ShoppingCartIcon, name: 'Food' },
  { Icon: TruckIcon, name: 'Transport' },
  { Icon: FilmIcon, name: 'Entertainment' },
  { Icon: HeartIcon, name: 'Health' },
  { Icon: ShoppingBagIcon, name: 'Shopping' },
  { Icon: DocumentIcon, name: 'Bills' },
  { Icon: CubeIcon, name: 'Other' },
];

const STORAGE_KEY = 'expenses';

function PressableScale({ onPress, style, children, disabled, accessibilityLabel, accessibilityRole, accessibilityState }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => !disabled && Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  return (
    <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut}
      disabled={disabled} accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole} accessibilityState={accessibilityState}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export default function AddExpense() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Oops', 'Please enter an expense name.'); return; }
    if (!amount || isNaN(parseFloat(amount))) { Alert.alert('Oops', 'Please enter a valid amount.'); return; }
    if (!category) { Alert.alert('Oops', 'Please select a category.'); return; }
    setSaving(true);
    const newExpense: Expense = {
      id: Date.now().toString(), name: name.trim(),
      amount: parseFloat(amount), category,
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
          placeholderTextColor={C.textDim}
          value={name} onChangeText={setName}
          accessibilityLabel="Expense name" returnKeyType="next"
        />

        <Text style={styles.label}>AMOUNT</Text>
        <View style={styles.amountRow}>
          <Text style={styles.dollar} accessibilityElementsHidden>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00" placeholderTextColor={C.textDim}
            value={amount} onChangeText={setAmount}
            keyboardType="decimal-pad"
            accessibilityLabel="Expense amount"
          />
        </View>

        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categoryGrid} accessibilityRole="radiogroup">
          {CATEGORIES.map((cat) => {
            const selected = category === cat.name;
            const color = CATEGORY_COLORS[cat.name];
            return (
              <PressableScale key={cat.name}
                style={[styles.catBtn, selected && { borderColor: color + '70', backgroundColor: color + '12' }]}
                accessibilityRole="radio"
                accessibilityLabel={cat.name}
                accessibilityState={{ checked: selected }}
                onPress={() => setCategory(cat.name)}
              >
                <cat.Icon size={14} color={selected ? color : C.textDim} />
                <Text style={[styles.catName, selected && { color }]}>{cat.name}</Text>
              </PressableScale>
            );
          })}
        </View>

        <Text style={styles.label}>NOTE <Text style={styles.opt}>· OPTIONAL</Text></Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Any extra details..." placeholderTextColor={C.textDim}
          value={note} onChangeText={setNote}
          multiline numberOfLines={3}
          accessibilityLabel="Optional note" textAlignVertical="top"
        />

        <PressableScale
          style={[styles.saveBtn, saving && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel={saving ? 'Saving' : 'Save expense'}
          accessibilityState={{ disabled: saving, busy: saving }}
          onPress={handleSave} disabled={saving}
        >
          <LinearGradient colors={[C.blueMid, C.blueDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGrad}>
            <CheckIcon size={14} color={C.blue} />
            <Text style={styles.saveTxt}>{saving ? 'Saving...' : 'Save Expense'}</Text>
          </LinearGradient>
        </PressableScale>

        <PressableScale style={styles.cancelBtn}
          accessibilityRole="button" accessibilityLabel="Cancel" onPress={() => router.back()}>
          <XMarkIcon size={12} color={C.textMuted} />
          <Text style={styles.cancelTxt}>Cancel</Text>
        </PressableScale>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },
  nebula1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: '#0a1a4e', top: -70, right: -60, opacity: 0.35 },
  nebula2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#2a0a4e', top: 220, left: -40, opacity: 0.25 },
  container: { flex: 1, paddingHorizontal: S.pagePad },
  header: { marginTop: S.safeTop, marginBottom: S.lg },
  heading: { ...T.h1 },
  sub: { ...T.small, marginTop: 2 },
  label: { ...T.label, marginBottom: S.xs + 2, marginTop: S.lg },
  opt: { color: '#111f35', fontWeight: '600' },
  input: { backgroundColor: C.surface, borderRadius: S.radius.md, padding: S.md, color: C.textSub, fontSize: 14, fontWeight: '600', borderWidth: 1, borderColor: C.border },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: S.radius.md, borderWidth: 1, borderColor: C.border, paddingHorizontal: S.md },
  dollar: { color: C.textDim, fontSize: 20, fontWeight: '800', marginRight: 4 },
  amountInput: { flex: 1, color: C.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, paddingVertical: 10 },
  noteInput: { height: 66, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catBtn: { backgroundColor: C.surface, borderRadius: S.radius.sm + 2, paddingVertical: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 5 },
  catName: { color: C.textDim, fontSize: 12, fontWeight: '700' },
  saveBtn: { borderRadius: S.radius.md, marginTop: S.xl, overflow: 'hidden', borderWidth: 1, borderColor: C.blueMid },
  saveGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, padding: S.md },
  saveTxt: { color: C.blue, fontSize: 14, fontWeight: '800' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: S.md, marginBottom: S.xxl },
  cancelTxt: { color: C.textMuted, fontSize: 13, fontWeight: '600' },
});
