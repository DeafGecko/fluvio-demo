import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CheckIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../hooks/use-theme';
import { rem, font } from '../constants/tokens';

// Our own dialog, used on every platform instead of the system alert. The system alert
// cannot be tinted; this one follows the app's colors. It supports several buttons and text prompts.
// selected: marks the current choice in a list of options (shown with a check mark).
type Btn = { text: string; style?: 'default' | 'cancel' | 'destructive'; selected?: boolean; onPress?: (value?: string) => void };
type Req = { title: string; message?: string; buttons: Btn[]; prompt: boolean; defaultValue?: string; id: number };

let listener: ((r: Req | null) => void) | null = null;
let seq = 0;
const show = (r: Omit<Req, 'id'>) => listener?.({ ...r, id: ++seq });

// Replace Alert.alert and Alert.prompt on the web. Runs once when the app loads.
export function installWebAlerts() {
  const A = Alert as any;
  A.alert = (title: string, message?: string, buttons?: Btn[]) =>
    show({ title, message, buttons: buttons && buttons.length ? buttons : [{ text: 'OK' }], prompt: false });
  A.prompt = (title: string, message?: string, buttons?: Btn[] | ((v?: string) => void), _type?: string, defaultValue?: string) => {
    const btns: Btn[] = typeof buttons === 'function' ? [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', onPress: buttons }] : buttons ?? [];
    show({ title, message, buttons: btns, prompt: true, defaultValue });
  };
}

// A dialog listing choices (for example Light / Dark / System). The current one gets a check mark.
// Uses the same host as every other alert, so it looks the same on web and phone.
export function showChoiceAlert(title: string, message: string, options: Btn[]) {
  (Alert as any).alert(title, message, options);
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
    scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: rem(1.5) },
    card: { backgroundColor: c.surface, borderRadius: rem(1), borderWidth: 1, borderColor: c.border, padding: rem(1.25), width: '100%', maxWidth: rem(21.25), gap: rem(0.75) },
    title: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: '700' },
    message: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight },
    input: { minHeight: rem(2.75), borderRadius: rem(0.625), borderWidth: 1, borderColor: c.border, paddingHorizontal: rem(0.75), color: c.textPrimary, fontSize: t.body.fontSize },
    // Buttons stack as full-width rows, so long labels never get squeezed.
    column: { flexDirection: 'column', gap: rem(0.5), marginTop: rem(0.25) },
    btn: { minHeight: rem(3), borderRadius: rem(0.625), borderWidth: 1, borderColor: c.border, paddingHorizontal: rem(1), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    selectedRow: { backgroundColor: c.accentSoft, borderColor: c.accent },
    primary: { backgroundColor: c.accent, borderColor: c.accent },
    danger: { backgroundColor: c.danger, borderColor: c.danger },
    btnText: { color: c.textPrimary, fontSize: font(1), fontWeight: '600', flexShrink: 1 },
    // Text on the filled buttons uses the theme's on-accent color: white in light mode, dark in dark mode.
    onColor: { color: c.onAccent },
  }), [c, t]);

  if (!req) return null;
  const close = () => setReq(null);
  // Options first, Cancel last (as a row at the bottom). Lists of choices show a check on the current one.
  const ordered = [...req.buttons.filter((b) => b.style !== 'cancel'), ...req.buttons.filter((b) => b.style === 'cancel')];
  const isChoiceList = ordered.some((b) => b.selected !== undefined);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={styles.scrim}>
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>{req.title}</Text>
          {!!req.message && <Text style={styles.message}>{req.message}</Text>}
          {req.prompt && (
            <TextInput style={styles.input} value={value} onChangeText={setValue} autoFocus accessibilityLabel={req.title} />
          )}
          <View style={styles.column}>
            {ordered.map((b, i) => {
              const isPrimary = !isChoiceList && i === ordered.length - 1 && b.style !== 'cancel';
              const isDanger = b.style === 'destructive';
              const isSelected = !!b.selected;
              return (
                <Pressable key={`${b.text}-${i}`} accessibilityRole={isChoiceList ? 'radio' : 'button'}
                  accessibilityState={isChoiceList ? { selected: isSelected, checked: isSelected } : undefined}
                  accessibilityLabel={b.text}
                  onPress={() => { close(); b.onPress?.(req.prompt ? value : undefined); }}
                  style={[styles.btn, isPrimary && styles.primary, isDanger && styles.danger, isSelected && styles.selectedRow]}>
                  <Text style={[styles.btnText, (isPrimary || isDanger) && styles.onColor]}>{b.text}</Text>
                  {isSelected && <CheckIcon size={rem(1.125)} color={c.accent} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
