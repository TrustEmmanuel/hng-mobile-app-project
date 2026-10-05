import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';

import { supabase } from '@/services/supabase';

const CartContext = createContext(null);

async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!data.session?.access_token) {
    throw new Error('You need to be signed in to use the cart.');
  }

  return data.session;
}

async function readInvokeError(error) {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body?.error) {
        return new Error(body.error);
      }
    } catch {
      // The function did not return JSON.
    }
  }

  return error;
}

/**
 * The cart Edge Function identifies the shopper with a Google sign-in
 * credential. A fresh Google session exposes that as provider_token.
 * Otherwise send the Supabase access token.
 */
function credentialFromSession(session) {
  return session.provider_token || session.access_token;
}

async function invokeCart(action, payload = {}) {
  const session = await getSession();
  const { data, error } = await supabase.functions.invoke('cart', {
    body: {
      ...payload,
      action,
      credential: credentialFromSession(session),
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw await readInvokeError(error);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

function linePrice(item) {
  const price = Number(item?.price ?? item?.unitPrice ?? item?.unit_price ?? 0);
  const quantity = Number(item?.quantity ?? 0);
  return price * quantity;
}

function readCart(data) {
  if (Array.isArray(data)) {
    return {
      cartItems: data,
      subtotal: data.reduce((sum, item) => sum + linePrice(item), 0),
    };
  }

  const source = data?.cart ?? data;
  const cartItems = source?.cartItems ?? source?.items;

  if (!Array.isArray(cartItems)) {
    return null;
  }

  const subtotal =
    typeof source.subtotal === 'number'
      ? source.subtotal
      : cartItems.reduce((sum, item) => sum + linePrice(item), 0);

  return { cartItems, subtotal };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const applyCart = useCallback((data) => {
    const next = readCart(data);
    if (!next) {
      return false;
    }

    setCartItems(next.cartItems);
    setSubtotal(next.subtotal);
    return true;
  }, []);

  const refreshCart = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (!data.session?.access_token) {
      setCartItems([]);
      setSubtotal(0);
      return;
    }

    const result = await invokeCart('fetch');

    if (!applyCart(result)) {
      throw new Error('Cart function returned an unexpected response.');
    }
  }, [applyCart]);

  const runCartAction = useCallback(
    async (action, payload) => {
      setIsLoading(true);

      try {
        const result = await invokeCart(action, payload);
        const applied = applyCart(result);

        if (!applied) {
          await refreshCart();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [applyCart, refreshCart],
  );

  const addItem = useCallback(
    (product, quantity = 1) => {
      const payload =
        product && typeof product === 'object'
          ? { ...product, quantity: product.quantity ?? quantity }
          : { productId: product, quantity };

      return runCartAction('add', payload);
    },
    [runCartAction],
  );

  const updateQuantity = useCallback(
    (itemId, quantity) => runCartAction('update', { itemId, quantity }),
    [runCartAction],
  );

  const removeItem = useCallback(
    (itemId) => runCartAction('remove', { itemId }),
    [runCartAction],
  );

  const clearCart = useCallback(() => runCartAction('clear'), [runCartAction]);

  useEffect(() => {
    let active = true;

    refreshCart()
      .catch(() => {
        if (active) {
          setCartItems([]);
          setSubtotal(0);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (!active) {
        return;
      }

      setIsLoading(true);
      refreshCart()
        .catch(() => {
          if (active) {
            setCartItems([]);
            setSubtotal(0);
          }
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshCart]);

  const value = useMemo(
    () => ({
      cartItems,
      subtotal,
      isLoading,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [cartItems, subtotal, isLoading, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
