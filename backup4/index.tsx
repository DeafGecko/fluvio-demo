import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated,
  Pressable, ScrollView,
  StyleSheet, Text,
  TextInput, View,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import {
  CubeIcon, DocumentIcon,
  FilmIcon, HeartIcon,
  PlusIcon, ShoppingBagIcon,
  ShoppingCartIcon, TrashIcon,
  TruckIcon, XMarkIcon,
} from 'react-native-heroicons/outline';

let SearchIcon: any;
try {
  SearchIcon = require('react-native-heroicons/outline').MagnifyingGlassIcon;
  if (!SearchIcon) throw new Error();
} catch {
  SearchIcon = require('react-native-heroicons/outline').SearchIcon;
}

const STORAGE_KEY = 'expenses';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#4ade80', Transport: '#4f9eff', Entertainment: '#a855f7',
  Health: '#f87171', Shopping: '#fb923c', Bills: '#facc15', Other: '#94a3b8',
};

const CATEGORY_ICONS: Record<string, any> = {
  Food: ShoppingCartIcon, Transport: TruckIcon, Entertainment: FilmIcon,
  Health: HeartIcon, Shopping: ShoppingBagIcon, Bills: DocumentIcon, Other: CubeIcon,
};

export type Expense = {
  id: string; name: string; amount: number;
  category: string; note: string; date: string;
};

export async function loadExpenses(): Promise<Expense[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function AnimatedRow({ children, index }: { children: React.ReactNode; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function ExpenseRow({ expense, onDelete, index }: {
  expense: Expense; onDelete: (id: string) => void; index: number;
}) {
  const swipeableRef = useRef<Swipeable>(null);
  const color = CATEGORY_COLORS[expense.category] ?? '#94a3b8';
  const Icon = CATEGORY_ICONS[expense.category] ?? CubeIcon;

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
    return (
      <Pressable
        style={styles.deleteAction}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${expense.name}`}
        onPress={() => { swipeableRef.current?.close(); onDelete(expense.id); }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <TrashIcon size={15} color="#f87171" />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <AnimatedRow index={index}>
      <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} rightThreshold={40} overshootRight={false}>
        <View
          style={styles.expenseCard}
          accessibilityRole="listitem"
          accessible={true}
          accessibilityLabel={`${expense.name}, $${expense.amount.toFixed(2)}, ${expense.category}, ${expense.date}. Swipe left to delete.`}
        >
          <View style={[styles.iconBadge, { backgroundColor: color + '15', borderColor: color + '25' }]}>
            <Icon size={14} color={color} />
          </View>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseName} numberOfLines={1}>{expense.name}</Text>
            <Text style={styles.expenseMeta}>{expense.category} · {expense.date}</Text>
          </View>
          <Text style={styles.expenseAmount}>-${expense.amount.toFixed(2)}</Text>
        </View>
      </Swipeable>
    </AnimatedRow>
  );
}

export default function Index() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [search, setSearch] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      AsyncStorage.getItem('onboarded').then((onboarded) => {
        if (!onboarded) { router.replace('/onboarding'); return; }
        AsyncStorage.getItem('user_name').then((n) => setUserName(n ?? ''));
      });
      loadExpenses().then((data) => {
        setExpenses(data);
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, [])
  );

  const handleDelete = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    await saveExpenses(updated);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filtered = search.trim()
    ? [...expenses].reverse().filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
      )
    : [...expenses].reverse();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.bg}>
        <View style={styles.nebula1} />
        <View style={styles.nebula2} />
        <View style={styles.nebula3} />

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Safe area top */}
            <View style={styles.safeTop} />

            {/* Header row */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.greeting} accessibilityRole="header">
                  {userName ? `Hey, ${userName}` : 'My Expenses'}
                </Text>
                <Text style={styles.subGreeting}>
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <Pressable
                style={styles.addBtn}
                accessibilityRole="button"
                accessibilityLabel="Add new expense"
                onPress={() => router.push('/add')}
              >
                <PlusIcon size={16} color="#4f9eff" />
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>

            {/* Total Card — compact */}
            <LinearGradient
              colors={['#0d2248', '#071428', '#02040e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}
            >
              <View style={styles.totalInner}>
                <View>
                  <Text style={styles.totalLabel}>TOTAL SPENT</Text>
                  <Text
                    style={styles.totalAmount}
                    accessibilityLabel={`Total spent: $${total.toFixed(2)}`}
                  >
                    ${total.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.totalPill}
                  accessible={true}
                  accessibilityLabel={`${expenses.length} transactions`}
                >
                  <Text style={styles.totalPillText}>
                    {expenses.length} txn{expenses.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Search Bar */}
            {expenses.length > 0 && (
              <View style={styles.searchBar}>
                <SearchIcon size={13} color="#253550" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search expenses..."
                  placeholderTextColor="#1a2f4a"
                  value={search}
                  onChangeText={setSearch}
                  accessibilityLabel="Search expenses"
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search">
                    <XMarkIcon size={13} color="#253550" />
                  </Pressable>
                )}
              </View>
            )}

            {/* List Header */}
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {search ? `Results (${filtered.length})` : 'Recent'}
              </Text>
              {expenses.length > 0 && !search && (
                <Text style={styles.swipeHint}>swipe to delete</Text>
              )}
            </View>

            {/* List */}
            {loading ? (
              <ActivityIndicator color="#4f9eff" style={{ marginTop: 30 }} />
            ) : expenses.length === 0 ? (
              <View style={styles.emptyState} accessible accessibilityLabel="No expenses yet.">
                <View style={styles.emptyIconWrap}>
                  <DocumentIcon size={24} color="#1a3a6e" />
                </View>
                <Text style={styles.emptyText}>No expenses yet</Text>
                <Text style={styles.emptySubText}>Tap Add to get started</Text>
              </View>
            ) : filtered.length === 0 ? (
              <View style={styles.emptyState} accessible accessibilityLabel={`No results for ${search}`}>
                <View style={styles.emptyIconWrap}>
                  <SearchIcon size={24} color="#1a3a6e" />
                </View>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubText}>Try a different term</Text>
              </View>
            ) : (
              <View accessibilityRole="list">
                {filtered.map((expense, index) => (
                  <ExpenseRow key={expense.id} expense={expense} onDelete={handleDelete} index={index} />
                ))}
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#02040e' },
  nebula1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#0a1f5e', top: -100, right: -80, opacity: 0.2,
  },
  nebula2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#1a0a3e', top: 60, left: -60, opacity: 0.15,
  },
  nebula3: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#072a2a', top: 400, right: -30, opacity: 0.15,
  },
  container: { flex: 1, paddingHorizontal: 16 },
  safeTop: { paddingTop: 56 },

  // Header
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  greeting: {
    fontSize: 22, fontWeight: '800', color: '#f0f4ff', letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 12, color: '#253550', marginTop: 1, fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#060d1e', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#1a3a6e',
  },
  addBtnText: { color: '#4f9eff', fontSize: 13, fontWeight: '700' },

  // Total Card — horizontal compact layout
  totalCard: { borderRadius: 16, marginBottom: 10, padding: 1 },
  totalInner: {
    borderRadius: 15, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#1a3a6e',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: {
    color: '#1e4a8a', fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 3,
  },
  totalAmount: {
    color: '#f0f4ff', fontSize: 32, fontWeight: '800', letterSpacing: -1,
    textShadowColor: '#4f9eff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4,
  },
  totalPill: {
    backgroundColor: '#0d2248', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#1a3a6e',
  },
  totalPillText: { color: '#4f9eff', fontSize: 11, fontWeight: '700' },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#060d1e', borderRadius: 10,
    borderWidth: 1, borderColor: '#0f1f35',
    paddingHorizontal: 10, gap: 8, marginBottom: 10,
  },
  searchInput: {
    flex: 1, color: '#e8eeff', fontSize: 13, fontWeight: '500', paddingVertical: 9,
  },

  // List
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  sectionTitle: {
    color: '#f0f4ff', fontSize: 13, fontWeight: '800', letterSpacing: -0.2,
  },
  swipeHint: { color: '#1a2f4a', fontSize: 10, fontStyle: 'italic' },

  expenseCard: {
    backgroundColor: '#060d1e', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 5, borderWidth: 1, borderColor: '#0f1f35', gap: 10,
  },
  iconBadge: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  expenseInfo: { flex: 1 },
  expenseName: { color: '#e8eeff', fontSize: 13, fontWeight: '700' },
  expenseMeta: { color: '#253550', fontSize: 11, marginTop: 1, fontWeight: '500' },
  expenseAmount: { color: '#f87171', fontSize: 13, fontWeight: '800' },

  deleteAction: {
    backgroundColor: '#1a0a0a', justifyContent: 'center',
    alignItems: 'center', width: 52, borderRadius: 12,
    marginBottom: 5, borderWidth: 1, borderColor: '#3f1515',
  },

  emptyState: { alignItems: 'center', marginTop: 50, marginBottom: 30 },
  emptyIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#060d1e', borderWidth: 1, borderColor: '#0f1f35',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  emptyText: { color: '#f0f4ff', fontSize: 14, fontWeight: '700' },
  emptySubText: { color: '#253550', fontSize: 12, marginTop: 3, fontWeight: '500' },
});
