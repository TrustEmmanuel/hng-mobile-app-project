import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { seedProducts } from '@/data/products';
import { supabase } from '@/services/supabase';

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   description?: string,
 *   price: number,
 *   category: string,
 *   image_url?: string | null,
 *   stock_quantity: number,
 * }} CatalogProduct
 */

/**
 * @typedef {{
 *   products: CatalogProduct[],
 *   loading: boolean,
 *   source: string,
 * }} CatalogContextValue
 */

/** @type {import('react').Context<CatalogContextValue | null>} */
const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [state, setState] = useState(/** @type {CatalogContextValue} */ ({ products: [], loading: true, source: 'loading' }));

  useEffect(() => {
    let active = true;

    supabase
      .from('products')
      .select('id, name, description, price, category, image_url, stock_quantity')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data?.length) {
          if (error) console.warn('Using the sample shelf:', error.message);
          setState({ products: seedProducts, loading: false, source: 'sample' });
          return;
        }
        setState({
          products: data.map((row) => ({
            ...row,
            price: Number(row.price),
            stock_quantity: Number(row.stock_quantity),
          })),
          loading: false,
          source: 'supabase',
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used within CatalogProvider');
  return context;
}
