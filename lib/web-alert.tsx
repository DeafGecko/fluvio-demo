import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../hooks/use-theme';

// On the web, Alert only shows a single message. This adds a dialog that supports
// several buttons and text prompts, so the same Alert calls work in the browser.
type Btn = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: (value?: string) => void };
type Req = { title: string; message?: string; buttons: Btn[]; prompt: boolean; defaultValue?: string; id: number };

let listener: ((r: Req | null) => void) | null = null;
let seq = 0;
const show = (r: Omit<Req, 'id'>) => listener?.({ ...r, id: ++seq });

// Replace Alert.alert and Alert.prompt on the web. Runs once when the app loads.
export function installWebAlerts() {
  if (Platform.OS !== 'web') return;
  const A = Alert as any;
  A.alert = (title: string, message?: string, buttons?: Btn[]) =>
    show({ title, message, buttons: buttons && buttons.length ? buttons : [{ text: 'OK' }], prompt: false });
  A.prompt = (title: string, message?: string, buttons?: Btn[] | ((v?: string) => void), _type?: string, defaultValue?: string) => {
    const btns: Btn[] = typeof buttons === 'function' ? [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', onPress: buttons }] : buttons ?? [];
    show({ title, message, buttons: btns, prompt: true, defaultValue });
  };
}

// Mount this once in the root layout.
export function WebAlertHost() {
  const { c, t } = useTheme();
  const [req, setReq] = useState<Req | null>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    listener = (r) => { setReq(r); setValue(r?.defaultValue ?? ''); };
    return () => { listener = null; };
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: { backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 20, width: '100%', maxWidth: 340, gap: 12 },
    title: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: '700' },
    message: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight },
    input: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: c.border, paddingHorizontal: 12, color: c.textPrimary, fontSize: t.body.fontSize },
    row: { flexDirection: 'row', gap: 8, marginTop: 4 },
    btn: { flex: 1, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    primary: { backgroundColor: c.accent, borderColor: c.accent },
    danger: { backgroundColor: c.danger, borderColor: c.danger },
    btnText: { color: c.textPrimary, fontSize: 16, fontWeight: '600' },
    // Text on the filled buttons uses the theme's on-accent color: white in light mode, dark in dark mode.
    onColor: { color: c.onAccent },
  }), [c, t]);

  if (!req) return null;
  const close = () => setReq(null);
  // Cancel buttons first, then the rest (the last one is the main action).
  const ordered = [...req.buttons.filter((b) => b.style === 'cancel'), ...req.buttons.filter((b) => b.style !== 'cancel')];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={styles.scrim}>
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>{req.title}</Text>
          {!!req.message && <Text style={styles.message}>{req.message}</Text>}
          {req.prompt && (
            <TextInput style={styles.input} value={value} onChangeText={setValue} autoFocus accessibilityLabel={req.title} />
          )}
          <View style={styles.row}>
            {ordered.map((b, i) => {
              const isPrimary = i === ordered.length - 1 && b.style !== 'cancel';
              const isDanger = b.style === 'destructive';
              return (
                <Pressable key={`${b.text}-${i}`} accessibilityRole="button" accessibilityLabel={b.text}
                  onPress={() => { close(); b.onPress?.(req.prompt ? value : undefined); }}
                  style={[styles.btn, isPrimary && styles.primary, isDanger && styles.danger]}>
                  <Text style={[styles.btnText, (isPrimary || isDanger) && styles.onColor]}>{b.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
