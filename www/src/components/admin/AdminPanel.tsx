import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Warehouse, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PRODUCTS } from '@/data/mockData';
import type { PointType, StockItem } from '@/data/mockData';
import { useAppDispatch } from '@/store/hooks';
import { addPoint } from '@/store/slices/mapPointsSlice';

interface StockEntry {
  productId: string;
  quantity: string;
  minThreshold: string;
}

interface FormState {
  name: string;
  address: string;
  lat: string;
  lng: string;
  stock: StockEntry[];
}

const EMPTY_FORM: FormState = {
  name: '',
  address: '',
  lat: '49.835',
  lng: '24.020',
  stock: [],
};

function emptyEntry(): StockEntry {
  return { productId: PRODUCTS[0].id, quantity: '', minThreshold: '' };
}

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<PointType>('warehouse');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function handleField(field: keyof Omit<FormState, 'stock'>, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addStockEntry() {
    setForm((f) => ({ ...f, stock: [...f.stock, emptyEntry()] }));
  }

  function removeStockEntry(idx: number) {
    setForm((f) => ({ ...f, stock: f.stock.filter((_, i) => i !== idx) }));
  }

  function updateStockEntry(idx: number, field: keyof StockEntry, value: string) {
    setForm((f) => ({
      ...f,
      stock: f.stock.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  }

  function handleTabChange(value: string) {
    setTab(value as PointType);
    setForm(EMPTY_FORM);
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    onOpenChange(false);
  }

  function handleSubmit() {
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (!form.name.trim() || !form.address.trim() || isNaN(lat) || isNaN(lng)) return;

    const stock: StockItem[] = form.stock
      .filter((s) => s.productId && s.quantity.trim() !== '')
      .map((s) => {
        const item: StockItem = {
          productId: s.productId,
          quantity: Math.max(0, parseInt(s.quantity, 10) || 0),
        };
        if (tab === 'delivery' && s.minThreshold.trim() !== '') {
          item.minThreshold = Math.max(0, parseInt(s.minThreshold, 10) || 0);
        }
        return item;
      });

    dispatch(
      addPoint({
        name: form.name.trim(),
        type: tab,
        lat,
        lng,
        address: form.address.trim(),
        stock,
      }),
    );

    handleClose();
  }

  const isWarehouse = tab === 'warehouse';
  const isValid =
    form.name.trim() !== '' &&
    form.address.trim() !== '' &&
    !isNaN(parseFloat(form.lat)) &&
    !isNaN(parseFloat(form.lng));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Додати об'єкт</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="warehouse" onValueChange={handleTabChange}>
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

          {(['warehouse', 'delivery'] as PointType[]).map((type) => (
            <TabsContent key={type} value={type} className="mt-4 space-y-3">
              {/* Base info */}
              <div className="space-y-2">
                <div>
                  <Label className="text-xs mb-1 block">Назва *</Label>
                  <Input
                    placeholder={type === 'warehouse' ? 'Склад «Назва»' : 'Точка «Назва»'}
                    value={form.name}
                    onChange={(e) => handleField('name', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Адреса *</Label>
                  <Input
                    placeholder="вул. Прикладна, 1, Львів"
                    value={form.address}
                    onChange={(e) => handleField('address', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs mb-1 block">Широта *</Label>
                    <Input
                      placeholder="49.835"
                      value={form.lat}
                      onChange={(e) => handleField('lat', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Довгота *</Label>
                    <Input
                      placeholder="24.020"
                      value={form.lng}
                      onChange={(e) => handleField('lng', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Stock items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Початкові запаси</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={addStockEntry}
                  >
                    <Plus className="size-3 mr-1" />
                    Додати товар
                  </Button>
                </div>

                {form.stock.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">
                    Запаси не додано — можна налаштувати пізніше
                  </p>
                ) : (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2 pr-2">
                      {form.stock.map((entry, idx) => {
                        const usedIds = form.stock
                          .filter((_, i) => i !== idx)
                          .map((s) => s.productId);
                        const available = PRODUCTS.filter(
                          (p) => !usedIds.includes(p.id),
                        );
                        return (
                          <div key={idx} className="grid gap-1.5 p-2 rounded-lg border bg-muted/30">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={entry.productId}
                                onChange={(e) => updateStockEntry(idx, 'productId', e.target.value)}
                                className="flex-1 h-7 rounded-md border border-input bg-transparent px-2 text-xs text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                              >
                                {available.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.unit})
                                  </option>
                                ))}
                                {/* Keep current selection visible even if "used" */}
                                {!available.find((p) => p.id === entry.productId) && (
                                  <option value={entry.productId}>
                                    {PRODUCTS.find((p) => p.id === entry.productId)?.name}
                                  </option>
                                )}
                              </select>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removeStockEntry(idx)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                            <div className={`grid gap-1.5 ${type === 'delivery' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              <div>
                                <Label className="text-[10px] text-muted-foreground mb-0.5 block">
                                  Кількість
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="0"
                                  value={entry.quantity}
                                  onChange={(e) => updateStockEntry(idx, 'quantity', e.target.value)}
                                  className="h-7 text-xs"
                                />
                              </div>
                              {type === 'delivery' && (
                                <div>
                                  <Label className="text-[10px] text-muted-foreground mb-0.5 block">
                                    Мін. поріг
                                  </Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="необов'язково"
                                    value={entry.minThreshold}
                                    onChange={(e) =>
                                      updateStockEntry(idx, 'minThreshold', e.target.value)
                                    }
                                    className="h-7 text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Скасувати
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!isValid}>
            <Plus className="size-3.5 mr-1" />
            {isWarehouse ? 'Додати склад' : 'Додати точку'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
