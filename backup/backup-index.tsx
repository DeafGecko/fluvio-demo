import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

import {
  CubeIcon,
  DocumentIcon,
  FilmIcon,
  HeartIcon, ShoppingBagIcon,
  ShoppingCartIcon, TruckIcon,
} from 'react-native-heroicons/outline';

const STORAGE_KEY = 'expenses';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#4ade80',
  Transport: '#60a5fa',
  Entertainment: '#c084fc',
  Health: '#f87171',
  Shopping: '#fb923c',
  Bills: '#facc15',
  Other: '#94a3b8',
};

const CATEGORY_ICONS: Record<string, any> = {
  Food: ShoppingCartIcon,
  Transport: TruckIcon,
  Entertainment: FilmIcon,
  Health: HeartIcon,
  Shopping: ShoppingBagIcon,
  Bills: DocumentIcon,
  Other: CubeIcon,
};

export type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  note: string;
  date: string;
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
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function ExpenseRow({ expense, onDelete, index }: {
  expense: Expense;
  onDelete: (id: string) => void;
  index: number;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
    return (
      <Pressable
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(expense.id);
        }}
      >
        <Animated.Text style={{ fontSize: 20, transform: [{ scale }] }}>🗑️</Animated.Text>
      </Pressable>
    );
  };

  return (
    <AnimatedRow index={index}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        overshootRight={false}
      >
        <View style={styles.expenseCard}>
          <View style={styles.expenseLeft}>
            <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[expense.category] + '20' }]}>
              {(() => {
                const Icon = CATEGORY_ICONS[expense.category] ?? CubeIcon;
                return <Icon size={20} color={CATEGORY_COLORS[expense.category] ?? '#94a3b8'} />;
              })()}
            </View>
            <View>
              <Text style={styles.expenseName}>{expense.name}</Text>
              <Text style={styles.expenseDate}>{expense.category} · {expense.date}</Text>
            </View>
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      loadExpenses().then((data) => {
        setExpenses(data);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }).start();
      });
    }, [fadeAnim])
  );

  const handleDelete = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    await saveExpenses(updated);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const reversed = [...expenses].reverse();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Top Navbar — safe area + future buttons */}
          <View style={styles.navbar}>
            <View style={styles.navbarInner} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>My Expenses</Text>
            <Text style={styles.subGreeting}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* Total Card */}
          <LinearGradient
            colors={['#1a56db', '#1e3a8a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.totalCard}
          >
            <Text style={styles.totalLabel}>TOTAL SPENT</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            <View style={styles.totalFooter}>
              <View style={styles.totalPill}>
                <Text style={styles.totalPillText}>
                  {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Add Button */}
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            accessibilityRole="button"
            onPress={() => router.push('/add')}
          >
            <Text style={styles.addButtonText}>+ Add Expense</Text>
          </Pressable>

          {/* List */}
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {expenses.length > 0 && (
              <Text style={styles.swipeHint}>swipe to delete</Text>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color="#60a5fa" style={{ marginTop: 40 }} />
          ) : expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={styles.emptySubText}>Tap Add Expense to get started</Text>
            </View>
          ) : (
            <View accessibilityRole="list">
              {reversed.map((expense, index) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onDelete={handleDelete}
                  index={index}
                />
              ))}
            </View>
          )}

        </Animated.View>

      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080c14',
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 16,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: '#475569',
    marginTop: 3,
    fontWeight: '500',
  },
  totalCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 14,
  },
  totalLabel: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  totalAmount: {
    color: '#ffffff',
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
    marginBottom: 16,
  },
  totalFooter: {
    flexDirection: 'row',
  },
  totalPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  totalPillText: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    marginBottom: 32,
  },
  addButtonPressed: {
    backgroundColor: '#e2e8f0',
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    color: '#080c14',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  swipeHint: {
    color: '#334155',
    fontSize: 12,
    fontStyle: 'italic',
  },
  expenseCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  categoryBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  expenseName: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  expenseDate: {
    color: '#475569',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  expenseAmount: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  deleteAction: {
    backgroundColor: '#450a0a',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 40,
  },
  emptyIcon: { fontSize: 44, marginBottom: 14 },
  emptyText: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubText: {
    color: '#475569',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  navbar: {
    paddingTop: 70,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navbarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});