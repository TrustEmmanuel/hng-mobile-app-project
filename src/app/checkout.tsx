import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BasketLines, Totals } from '@/components/store/Basket';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { placeOrder } from '@/lib/api';
import { formatNaira } from '@/lib/money';
import { go, replace } from '@/lib/nav';
import { saveOrder } from '@/lib/orders';
import { deliveryFee } from '@/lib/pricing';

const emptyForm = {
  recipient: '',
  phone: '',
  street: '',
  area: '',
  city: 'Lagos',
  note: '',
};

function validPhone(value: string) {
  const compact = value.replace(/[\s-]/g, '');
  return /^(\+234|0)[789]\d{9}$/.test(compact);
}

function composeAddress(form: typeof emptyForm) {
  return [
    form.recipient.trim(),
    [form.street.trim(), form.area.trim(), form.city.trim()].filter(Boolean).join(', '),
    form.note.trim() ? `Note: ${form.note.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export default function CheckoutScreen() {
  const { user, openSignIn } = useAuth();
  const { items, subtotal, clear, isLoading, error: cartError } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (form.recipient.trim().length < 2) next.recipient = 'Add the recipient’s name.';
    if (!validPhone(form.phone)) next.phone = 'Use a Nigerian number, like 0803 000 0000 or +234…';
    if (form.street.trim().length < 4) next.street = 'Add a street address.';
    if (form.area.trim().length < 2) next.area = 'Add the area, such as Yaba or Lekki.';
    if (form.city.trim().length < 2) next.city = 'Add a city.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    setSubmitError('');
    if (!user) {
      openSignIn();
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await placeOrder({
        credential: user.credential,
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        delivery_address: composeAddress(form),
        phone: form.phone.replace(/[\s-]/g, ''),
      });
      const order = result.order;
      await saveOrder(order.id, { ...result, order });
      await clear();
      replace(`/order/${order.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not place the order.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.muted}>Loading the basket…</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Nothing to check out.</Text>
        <Pressable style={styles.button} onPress={() => go('/shop')}>
          <Text style={styles.buttonText}>Shop the shelf</Text>
        </Pressable>
      </View>
    );
  }

  const total = subtotal + deliveryFee(subtotal);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.kicker}>Checkout</Text>
      <Text style={styles.title}>Where should we bring it?</Text>

      {!user ? (
        <View style={styles.gate}>
          <Text style={styles.heading}>Sign in to place the order</Text>
          <Text style={styles.muted}>
            Sign in with Google so this basket is saved to your account and the receipt has somewhere to go.
          </Text>
          <Pressable style={styles.button} onPress={openSignIn}>
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.signedIn}>
          Signed in as {user.name} · {user.email}
        </Text>
      )}

      <Field label="Recipient" error={errors.recipient}>
        <TextInput
          value={form.recipient}
          onChangeText={(value) => update('recipient', value)}
          placeholder={user?.name || 'Name on the bag'}
          placeholderTextColor="#8a837a"
          style={styles.input}
        />
      </Field>
      <Field label="Phone" error={errors.phone}>
        <TextInput
          value={form.phone}
          onChangeText={(value) => update('phone', value)}
          placeholder="0803 000 0000"
          placeholderTextColor="#8a837a"
          keyboardType="phone-pad"
          style={styles.input}
        />
      </Field>
      <Field label="Street address" error={errors.street}>
        <TextInput
          value={form.street}
          onChangeText={(value) => update('street', value)}
          placeholder="14 Market Lane"
          placeholderTextColor="#8a837a"
          style={styles.input}
        />
      </Field>
      <Field label="Area" error={errors.area}>
        <TextInput
          value={form.area}
          onChangeText={(value) => update('area', value)}
          placeholder="Yaba"
          placeholderTextColor="#8a837a"
          style={styles.input}
        />
      </Field>
      <Field label="City" error={errors.city}>
        <TextInput
          value={form.city}
          onChangeText={(value) => update('city', value)}
          style={styles.input}
        />
      </Field>
      <Field label="Note for the rider" optional>
        <TextInput
          value={form.note}
          onChangeText={(value) => update('note', value)}
          placeholder="Gate code, landmark, or when to call"
          placeholderTextColor="#8a837a"
          style={[styles.input, styles.note]}
          multiline
        />
      </Field>
      <Text style={styles.muted}>Payment is transfer or cash when the bag arrives. We don’t take card details here.</Text>
      {cartError ? <Text style={styles.error}>{cartError}</Text> : null}
      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
      <Pressable style={[styles.button, (submitting || !user) && styles.disabled]} onPress={onSubmit} disabled={submitting || !user}>
        <Text style={styles.buttonText}>
          {submitting ? 'Placing order…' : user ? `Place order · ${formatNaira(total)}` : 'Sign in to place order'}
        </Text>
      </Pressable>

      <Text style={styles.heading}>Order summary</Text>
      <BasketLines items={items} />
      <Totals subtotal={subtotal} />
    </ScrollView>
  );
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {optional ? <Text style={styles.optional}>  Optional</Text> : null}
      </Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f3f1ec' },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  screen: { flex: 1, backgroundColor: '#f3f1ec', padding: 16, gap: 12 },
  kicker: { color: '#5c564e', fontWeight: '600' },
  title: { color: '#161513', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  heading: { color: '#161513', fontSize: 20, fontWeight: '700' },
  muted: { color: '#5c564e', lineHeight: 21 },
  signedIn: { color: '#161513' },
  gate: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, gap: 10 },
  field: { gap: 6 },
  label: { color: '#161513', fontWeight: '600' },
  optional: { color: '#5c564e', fontWeight: '500' },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#161513',
  },
  note: { minHeight: 80, textAlignVertical: 'top' },
  error: { color: '#9a3412' },
  button: { backgroundColor: '#12261f', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#f7f3ea', fontWeight: '700' },
});
