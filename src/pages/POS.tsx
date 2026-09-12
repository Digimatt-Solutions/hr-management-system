import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShoppingCart, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  sku: string;
  unit_price: number;
}

interface Shop {
  id: string;
  name: string;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

const POS = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadShops();
    loadProducts();
  }, []);

  const loadShops = async () => {
    const { data } = await supabase.from("shops").select("id, name");
    if (data) setShops(data);
  };

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, sku, unit_price");
    if (data) setProducts(data);
  };

  const addToCart = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * Number(item.unit_price),
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          subtotal: Number(product.unit_price),
        },
      ]);
    }
    setSelectedProduct("");
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * Number(item.unit_price),
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const processSale = async () => {
    if (!selectedShop) {
      toast.error("Please select a shop");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          shop_id: selectedShop,
          user_id: user.id,
          total_amount: getTotalAmount(),
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map((item) => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);

      if (itemsError) throw itemsError;

      toast.success("Sale completed successfully!");
      
      // Reset form
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
    } catch (error: any) {
      toast.error(error.message || "Failed to process sale");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Point of Sale</h2>
          <p className="text-muted-foreground">Process sales and manage transactions</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Add Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Shop</Label>
                  <Select value={selectedShop} onValueChange={setSelectedShop}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Product</Label>
                  <div className="flex gap-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${Number(product.unit_price).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addToCart} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Cart Items</h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${Number(item.unit_price).toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <div className="w-24 text-right font-semibold">
                              ${item.subtotal.toFixed(2)}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer Name (Optional)</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-primary">${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={processSale}
                  disabled={processing || cart.length === 0}
                >
                  {processing ? "Processing..." : "Complete Sale"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default POS;
