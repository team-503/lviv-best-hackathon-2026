import { PageLayout } from '@/components/layout/PageLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { deleteWarehouse, getWarehouse, updateWarehouseStock } from '@/lib/api/warehouses';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMapPoints } from '@/store/slices/mapPointsSlice';
import type { ProductResponseDto, WarehouseDetailResponseDto } from '@/types/api';
import { Loader2, Package, Pencil, Plus, Save, Trash2, Warehouse, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
            <NativeSelect className="w-full" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <NativeSelectOption value="" disabled>
                Оберіть товар...
              </NativeSelectOption>
              {available.map((p) => (
                <NativeSelectOption key={p.id} value={String(p.id)}>
                  {p.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
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
  const dispatch = useAppDispatch();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [warehouse, setWarehouse] = useState<WarehouseDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const products = useAppSelector((s) => s.products.products);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      try {
        setError(null);
        const data = await getWarehouse(Number(id));
        if (!cancelled) setWarehouse(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не вдалося завантажити склад');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function refetchWarehouse() {
    if (!id) return;
    try {
      setError(null);
      const data = await getWarehouse(Number(id));
      setWarehouse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити склад');
    }
  }

  async function handleUpdateStock(items: { productId: number; quantity: number }[]) {
    if (!id) return;
    await updateWarehouseStock(Number(id), items);
    await refetchWarehouse();
  }

  async function handleSaveQuantity(productId: number, quantity: number) {
    if (!warehouse) return;
    const items = warehouse.stock.map((s) =>
      s.product.id === productId ? { productId: s.product.id, quantity } : { productId: s.product.id, quantity: s.quantity },
    );
    await handleUpdateStock(items);
  }

  async function handleRemoveProduct(productId: number) {
    if (!warehouse) return;
    const items = warehouse.stock
      .filter((s) => s.product.id !== productId)
      .map((s) => ({ productId: s.product.id, quantity: s.quantity }));
    await handleUpdateStock(items);
  }

  async function handleDeleteWarehouse() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteWarehouse(Number(id));
      await dispatch(fetchMapPoints());
      navigate('/');
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddProduct(productId: number, quantity: number) {
    if (!warehouse) return;
    const items = [...warehouse.stock.map((s) => ({ productId: s.product.id, quantity: s.quantity })), { productId, quantity }];
    await handleUpdateStock(items);
  }

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
        {user?.role === 'admin' && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
            title="Видалити склад"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити склад?</AlertDialogTitle>
            <AlertDialogDescription>Склад буде архівовано. Цю дію не можна скасувати.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteWarehouse();
              }}
            >
              {deleting && <Loader2 className="size-4 animate-spin mr-1" />}
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
