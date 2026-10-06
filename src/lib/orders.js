import AsyncStorage from '@react-native-async-storage/async-storage';

const memory = new Map();

function key(id) {
  return `tajmart.order.${id}`;
}

export async function saveOrder(id, record) {
  memory.set(id, record);
  await AsyncStorage.setItem(key(id), JSON.stringify(record));
}

export async function readOrder(id) {
  if (memory.has(id)) return memory.get(id);
  try {
    const raw = await AsyncStorage.getItem(key(id));
    if (!raw) return null;
    const record = JSON.parse(raw);
    memory.set(id, record);
    return record;
  } catch {
    return null;
  }
}
