import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getWarehouse, updateWarehouseStock } from '@/lib/api/warehouses';
import { getProducts } from '@/lib/api/products';
import type { WarehouseDetailResponseDto, ProductResponseDto } from '@/types/api';
import { Package, Warehouse, Plus, Pencil, Trash2, Save, X, Infinity, Loader2 } from 'lucide-react';

// ─── Stock Row ───
function WarehouseStockRow({
  productId,
  productName,
  quantity,
  onSave,
  onRemove,
}: {
  productId: number;
  productName: string;
  quantity: number;
  onSave: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(quantity));

  function save() {
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0) onSave(productId, num);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-500/10">
        <Package className="size-4 text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{productName}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
          <Infinity className="size-3" /> Необмежені запаси
        </p>
      </div>

      {/* Available stock */}
      <div className="flex items-center gap-1.5">
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              className="h-7 w-24 text-xs text-right"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') setEditing(false);
              }}
              autoFocus
            />
            <Button size="icon" variant="ghost" className="size-6" onClick={save}>
              <Save className="size-3" />
            </Button>
            <Button size="icon" variant="ghost" className="size-6" onClick={() => setEditing(false)}>
              <X className="size-3" />
            </Button>
          </div>
        ) : (
          <button
            className="flex items-center gap-1.5 text-sm font-mono hover:text-primary transition-colors group"
            onClick={() => {
              setVal(String(quantity));
              setEditing(true);
            }}
            title="Редагувати запас"
          >
            <span className="font-semibold">{quantity.toLocaleString()}</span>
            <Pencil className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}

        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-destructive hover:text-destructive"
          onClick={() => onRemove(productId)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Add Product Dialog ───
function AddProductDialog({
  existingProductIds,
  allProducts,
  open,
  onClose,
  onAdd,
}: {
  existingProductIds: number[];
  allProducts: ProductResponseDto[];
  open: boolean;
  onClose: () => void;
  onAdd: (productId: number, quantity: number) => void;
}) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  const available = allProducts.filter((p) => !existingProductIds.includes(p.id));

  function handleAdd() {
    const qty = parseInt(quantity);
    const pid = parseInt(productId);
    if (!pid || isNaN(qty) || qty < 0) return;
    onAdd(pid, qty);
    setProductId('');
    setQuantity('');
    onClose();
  }

  const isValid = productId && quantity !== '' && parseInt(quantity) >= 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Додати товар на склад</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Товар</label>
            <Select value={productId} onValueChange={(v) => setProductId(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть товар..." />
              </SelectTrigger>
              <SelectContent>
                {available.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Усі товари вже додані</div>
                ) : (
                  available.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Доступна кількість</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={handleAdd} disabled={!isValid}>
            Додати
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───
export function WarehousePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [warehouse, setWarehouse] = useState<WarehouseDetailResponseDto | null>(null);
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouse = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await getWarehouse(Number(id));
      setWarehouse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити склад');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWarehouse();
    getProducts()
      .then(setProducts)
      .catch(() => {});
  }, [fetchWarehouse]);

  const handleUpdateStock = useCallback(
    async (items: { productId: number; quantity: number }[]) => {
      if (!id) return;
      await updateWarehouseStock(Number(id), items);
      await fetchWarehouse();
    },
    [id, fetchWarehouse],
  );

  const handleSaveQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (!warehouse) return;
      const items = warehouse.stock.map((s) =>
        s.product.id === productId ? { productId: s.product.id, quantity } : { productId: s.product.id, quantity: s.quantity },
      );
      await handleUpdateStock(items);
    },
    [warehouse, handleUpdateStock],
  );

  const handleRemoveProduct = useCallback(
    async (productId: number) => {
      if (!warehouse) return;
      const items = warehouse.stock
        .filter((s) => s.product.id !== productId)
        .map((s) => ({ productId: s.product.id, quantity: s.quantity }));
      await handleUpdateStock(items);
    },
    [warehouse, handleUpdateStock],
  );

  const handleAddProduct = useCallback(
    async (productId: number, quantity: number) => {
      if (!warehouse) return;
      const items = [...warehouse.stock.map((s) => ({ productId: s.product.id, quantity: s.quantity })), { productId, quantity }];
      await handleUpdateStock(items);
    },
    [warehouse, handleUpdateStock],
  );

  if (loading) {
    return (
      <PageLayout title="Завантаження...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (error || !warehouse) {
    return (
      <PageLayout title="Не знайдено">
        <p className="text-muted-foreground">{error ?? 'Склад не знайдено.'}</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          На головну
        </Button>
      </PageLayout>
    );
  }

  const totalProducts = warehouse.stock.length;
  const totalUnits = warehouse.stock.reduce((acc, s) => acc + s.quantity, 0);

  return (
    <PageLayout title={warehouse.name} subtitle="Склад">
      {/* Info strip */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Warehouse className="size-4 text-indigo-500" />
        <span>
          {warehouse.location.lat.toFixed(4)}, {warehouse.location.lng.toFixed(4)}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalProducts}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Видів товарів</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-primary">{totalUnits.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Одиниць загалом</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-4 pb-4 flex items-center gap-2">
            <Infinity className="size-5 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Необмежені запаси</p>
              <p className="text-xs text-muted-foreground">Склад-джерело</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="size-4 text-primary" />
                Товари на складі
              </CardTitle>
              <CardDescription className="mt-1">Натисніть на кількість щоб відредагувати</CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddDialogOpen(true)}>
              <Plus className="size-4" data-icon="inline-start" />
              Додати товар
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {warehouse.stock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Товарів немає</p>
              <p className="text-xs text-muted-foreground mt-1">Натисніть «Додати товар» щоб почати</p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="flex items-center gap-3 pb-2 text-xs text-muted-foreground font-medium border-b mb-1">
                <div className="size-8 shrink-0" />
                <div className="flex-1">Товар</div>
                <div className="text-right">Доступна кількість</div>
              </div>
              {warehouse.stock.map((s) => (
                <WarehouseStockRow
                  key={s.product.id}
                  productId={s.product.id}
                  productName={s.product.name}
                  quantity={s.quantity}
                  onSave={handleSaveQuantity}
                  onRemove={handleRemoveProduct}
                />
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <AddProductDialog
        existingProductIds={warehouse.stock.map((s) => s.product.id)}
        allProducts={products}
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddProduct}
      />
    </PageLayout>
  );
}
