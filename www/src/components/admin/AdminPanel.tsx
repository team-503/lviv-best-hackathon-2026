import { useState, useCallback } from 'react';
import { Plus, Trash2, Warehouse, MapPin, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppDispatch } from '@/store/hooks';
import { addPoint } from '@/store/slices/mapPointsSlice';
import { PRODUCTS, type StockItem, type PointType } from '@/data/mockData';
import { LocationPicker } from './LocationPicker';

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uk`,
    { headers: { 'Accept-Language': 'uk' } },
  );
  if (!res.ok) return '';
  const data = await res.json();
  const a = data.address ?? {};
  const parts = [
    a.road ?? a.pedestrian ?? a.path ?? '',
    a.house_number ?? '',
    a.city ?? a.town ?? a.village ?? '',
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : (data.display_name ?? '');
}

interface StockRow {
  productId: string;
  quantity: string;
  minThreshold: string;
}

interface FormState {
  name: string;
  address: string;
  location: { lat: number; lng: number } | null;
  stock: StockRow[];
}

function emptyForm(): FormState {
  return { name: '', address: '', location: null, stock: [] };
}

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<PointType>('warehouse');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [addressLoading, setAddressLoading] = useState(false);

  const handleLocationChange = useCallback(async (lat: number, lng: number) => {
    setForm((f) => ({ ...f, location: { lat, lng } }));
    setAddressLoading(true);
    try {
      const address = await reverseGeocode(lat, lng);
      if (address) setForm((f) => ({ ...f, address }));
    } finally {
      setAddressLoading(false);
    }
  }, []);

  function handleClose() {
    setForm(emptyForm());
    onOpenChange(false);
  }

  function handleTabChange(value: string) {
    setTab(value as PointType);
    setForm(emptyForm());
  }

  function addStockRow() {
    const usedIds = new Set(form.stock.map((s) => s.productId));
    const next = PRODUCTS.find((p) => !usedIds.has(p.id));
    if (!next) return;
    setForm((f) => ({ ...f, stock: [...f.stock, { productId: next.id, quantity: '', minThreshold: '' }] }));
  }

  function updateStockRow(idx: number, patch: Partial<StockRow>) {
    setForm((f) => {
      const stock = [...f.stock];
      stock[idx] = { ...stock[idx], ...patch };
      return { ...f, stock };
    });
  }

  function removeStockRow(idx: number) {
    setForm((f) => ({ ...f, stock: f.stock.filter((_, i) => i !== idx) }));
  }

  function usedProductIds(currentIdx: number): Set<string> {
    return new Set(form.stock.filter((_, i) => i !== currentIdx).map((s) => s.productId));
  }

  const canSubmit =
    form.name.trim() !== '' &&
    form.address.trim() !== '' &&
    form.location !== null;

  function handleSubmit() {
    if (!form.location) return;
    const stock: StockItem[] = form.stock
      .filter((s) => s.quantity !== '')
      .map((s) => ({
        productId: s.productId,
        quantity: Math.max(0, Number(s.quantity) || 0),
        ...(tab === 'delivery' && s.minThreshold !== ''
          ? { minThreshold: Math.max(0, Number(s.minThreshold) || 0) }
          : {}),
      }));

    dispatch(
      addPoint({
        name: form.name.trim(),
        type: tab,
        lat: form.location.lat,
        lng: form.location.lng,
        address: form.address.trim(),
        stock,
      }),
    );
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90svh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle>Додати об'єкт</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0 mt-3">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="warehouse" className="flex-1 gap-1.5">
                <Warehouse className="size-3.5" />
                Склад
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex-1 gap-1.5">
                <MapPin className="size-3.5" />
                Точка доставки
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={tab} className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-[calc(90svh-200px)]">
              <div className="px-4 py-3 flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="point-name">Назва</Label>
                  <Input
                    id="point-name"
                    placeholder={tab === 'warehouse' ? 'Склад «Центральний»' : 'Точка доставки №7'}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="point-address">Адреса</Label>
                  <div className="relative">
                    <Input
                      id="point-address"
                      placeholder="вул. Промислова, 14, Львів"
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      className={addressLoading ? 'pr-8' : ''}
                    />
                    {addressLoading && (
                      <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Location picker */}
                <div className="flex flex-col gap-1.5">
                  <Label>Розташування</Label>
                  <LocationPicker
                    value={form.location}
                    onChange={handleLocationChange}
                  />
                  {form.location && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground self-end"
                      onClick={() => setForm((f) => ({ ...f, location: null }))}
                    >
                      Скинути
                    </button>
                  )}
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Початковий запас</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={addStockRow}
                      disabled={form.stock.length >= PRODUCTS.length}
                    >
                      <Plus className="size-3" />
                      Додати товар
                    </Button>
                  </div>

                  {form.stock.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3 border rounded-lg border-dashed">
                      Запас не задано
                    </p>
                  )}

                  {form.stock.map((row, idx) => {
                    const used = usedProductIds(idx);
                    return (
                      <div key={idx} className="flex items-end gap-2">
                        <div className="flex-1 flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Товар</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
                            value={row.productId}
                            onChange={(e) => updateStockRow(idx, { productId: e.target.value })}
                          >
                            {PRODUCTS.map((p) => (
                              <option key={p.id} value={p.id} disabled={used.has(p.id)}>
                                {p.name} ({p.unit})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24 flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Кількість</Label>
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={row.quantity}
                            onChange={(e) => updateStockRow(idx, { quantity: e.target.value })}
                          />
                        </div>
                        {tab === 'delivery' && (
                          <div className="w-24 flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">Мін. поріг</Label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={row.minThreshold}
                              onChange={(e) => updateStockRow(idx, { minThreshold: e.target.value })}
                            />
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeStockRow(idx)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-4 py-3 border-t bg-muted/50 flex-row justify-end gap-2 -mx-0 -mb-0 rounded-b-xl">
          <Button variant="outline" onClick={handleClose}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {tab === 'warehouse' ? <Warehouse className="size-3.5 mr-1.5" /> : <MapPin className="size-3.5 mr-1.5" />}
            Додати
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
