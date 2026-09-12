import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface Shop {
  id: string;
  name: string;
  location: string;
}

interface ShopContextType {
  shops: Shop[];
  selectedShop: Shop | null;
  setSelectedShop: (shop: Shop | null) => void;
  loading: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadShops();
    } else {
      setShops([]);
      setSelectedShop(null);
      setLoading(false);
    }
  }, [user]);

  const loadShops = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, location')
        .order('name');

      if (error) throw error;

      setShops(data || []);
      
      // Auto-select first shop if available
      if (data && data.length > 0 && !selectedShop) {
        setSelectedShop(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading shops:', error);
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShopContext.Provider value={{ shops, selectedShop, setSelectedShop, loading }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
