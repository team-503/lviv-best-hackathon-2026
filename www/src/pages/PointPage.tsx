import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CriticalityBadge } from '@/components/ui/criticality-badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateMinThreshold, updateQuantity, addActiveRequest, removeActiveRequest } from '@/store/slices/mapPointsSlice';
import { addRequest, removeRequest, updateRequest } from '@/store/slices/requestsSlice';
import { PRODUCTS, type CriticalityLevel, type DeliveryRequest } from '@/data/mockData';
import {
  Package,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Save,
  X,
} from 'lucide-react';

const CRITICALITY_OPTIONS: { value: CriticalityLevel; label: string }[] = [
  { value: 'urgent', label: 'Терміново' },
  { value: 'critical', label: 'Критично' },
  { value: 'needed', label: 'Дуже потрібно' },
  { value: 'normal', label: 'Нормально' },
];

const STATUS_CONFIG = {
  pending: { label: 'Очікує', icon: Clock, classes: 'text-muted-foreground' },
  planned: { label: 'Заплановано', icon: CheckCircle2, classes: 'text-primary' },
  completed: { label: 'Виконано', icon: CheckCircle2, classes: 'text-emerald-500' },
};

// ─── Stock Row ───
function StockRow({ pointId, productId, quantity, minThreshold }: {
  pointId: string;
  productId: string;
  quantity: number;
  minThreshold?: number;
}) {
  const dispatch = useAppDispatch();
  const product = PRODUCTS.find((p) => p.id === productId);
  const [editingQty, setEditingQty] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [qtyVal, setQtyVal] = useState(String(quantity));
  const [thresholdVal, setThresholdVal] = useState(String(minThreshold ?? 0));

  const isBelowThreshold = minThreshold !== undefined && quantity < minThreshold;

  function saveQty() {
    const num = parseInt(qtyVal);
    if (!isNaN(num) && num >= 0) dispatch(updateQuantity({ pointId, productId, quantity: num }));
    setEditingQty(false);
  }

  function saveThreshold() {
    const num = parseInt(thresholdVal);
    if (!isNaN(num) && num >= 0) dispatch(updateMinThreshold({ pointId, productId, minThreshold: num }));
    setEditingThreshold(false);
  }

  return (
    <div className={`flex items-center gap-3 py-3 border-b last:border-0 ${isBelowThreshold ? 'bg-destructive/5 -mx-4 px-4 rounded' : ''}`}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Package className="size-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{product?.name}</p>
        {isBelowThreshold && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
            <AlertTriangle className="size-3" /> Нижче мінімального порогу
          </p>
        )}
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-1.5 min-w-[110px] justify-end">
        {editingQty ? (
          <div className="flex items-center gap-1">
            <Input
              className="h-7 w-20 text-xs text-right"
              value={qtyVal}
              onChange={(e) => setQtyVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveQty(); if (e.key === 'Escape') setEditingQty(false); }}
              autoFocus
            />
            <span className="text-xs text-muted-foreground">{product?.unit}</span>
            <Button size="icon" variant="ghost" className="size-6" onClick={saveQty}><Save className="size-3" /></Button>
            <Button size="icon" variant="ghost" className="size-6" onClick={() => setEditingQty(false)}><X className="size-3" /></Button>
          </div>
        ) : (
          <button
            className="flex items-center gap-1 text-sm font-mono hover:text-primary transition-colors group"
            onClick={() => { setQtyVal(String(quantity)); setEditingQty(true); }}
            title="Редагувати кількість"
          >
            <span className={isBelowThreshold ? 'text-destructive font-semibold' : ''}>
              {quantity.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">{product?.unit}</span>
            <Pencil className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
      </div>

      {/* Min Threshold */}
      <div className="flex items-center gap-1.5 min-w-[120px] justify-end">
        <span className="text-xs text-muted-foreground shrink-0">мін:</span>
        {editingThreshold ? (
          <div className="flex items-center gap-1">
            <Input
              className="h-7 w-20 text-xs text-right"
              value={thresholdVal}
              onChange={(e) => setThresholdVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveThreshold(); if (e.key === 'Escape') setEditingThreshold(false); }}
              autoFocus
            />
            <Button size="icon" variant="ghost" className="size-6" onClick={saveThreshold}><Save className="size-3" /></Button>
            <Button size="icon" variant="ghost" className="size-6" onClick={() => setEditingThreshold(false)}><X className="size-3" /></Button>
          </div>
        ) : (
          <button
            className="flex items-center gap-1 text-xs font-mono hover:text-primary transition-colors group"
            onClick={() => { setThresholdVal(String(minThreshold ?? 0)); setEditingThreshold(true); }}
            title="Редагувати мінімальний поріг"
          >
            <span>{(minThreshold ?? 0).toLocaleString()} {product?.unit}</span>
            <Pencil className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Create/Edit Request Dialog ───
interface RequestDialogProps {
  pointId: string;
  open: boolean;
  onClose: () => void;
  editing?: DeliveryRequest;
}

function RequestDialog({ pointId, open, onClose, editing }: RequestDialogProps) {
  const dispatch = useAppDispatch();
  const [productId, setProductId] = useState(editing?.productId ?? '');
  const [quantity, setQuantity] = useState(String(editing?.quantity ?? ''));
  const [criticality, setCriticality] = useState<CriticalityLevel>(editing?.criticality ?? 'normal');

  function handleSubmit() {
    const qty = parseInt(quantity);
    if (!productId || isNaN(qty) || qty <= 0) return;

    if (editing) {
      dispatch(updateRequest({ id: editing.id, quantity: qty, criticality }));
    } else {
      const id = `r-${Date.now()}`;
      dispatch(addRequest({
        id,
        pointId,
        productId,
        quantity: qty,
        criticality,
        createdAt: new Date().toISOString(),
        status: 'pending',
      }));
      dispatch(addActiveRequest({ pointId, requestId: id }));
    }
    onClose();
  }

  const isValid = productId && parseInt(quantity) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Редагувати запит' : 'Новий запит на доставку'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Product */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Продукт</label>
            <Select value={productId} onValueChange={(v) => setProductId(v ?? '')} disabled={!!editing}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть продукт..." />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Кількість</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="flex-1"
              />
              {productId && (
                <span className="text-sm text-muted-foreground w-8">
                  {PRODUCTS.find((p) => p.id === productId)?.unit}
                </span>
              )}
            </div>
          </div>

          {/* Criticality */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Рівень критичності</label>
            <Select value={criticality} onValueChange={(v) => v && setCriticality(v as CriticalityLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRITICALITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Скасувати</Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {editing ? 'Зберегти' : 'Створити запит'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───
export function PointPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const point = useAppSelector((s) => s.mapPoints.points.find((p) => p.id === id));
  const requests = useAppSelector((s) =>
    s.requests.requests.filter((r) => r.pointId === id),
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<DeliveryRequest | undefined>();

  if (!point || point.type !== 'delivery') {
    return (
      <PageLayout title="Не знайдено">
        <p className="text-muted-foreground">Точку доставки не знайдено.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>На головну</Button>
      </PageLayout>
    );
  }

  const belowThresholdCount = point.stock.filter(
    (s) => s.minThreshold !== undefined && s.quantity < s.minThreshold,
  ).length;

  function handleDeleteRequest(req: DeliveryRequest) {
    dispatch(removeRequest(req.id));
    dispatch(removeActiveRequest({ pointId: point!.id, requestId: req.id }));
  }

  return (
    <PageLayout title={point.name} subtitle="Точка доставки">
      {/* Info strip */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <MapPin className="size-4 text-primary" />
        <span>{point.address}</span>
        {belowThresholdCount > 0 && (
          <Badge variant="destructive" className="ml-2">
            {belowThresholdCount} нижче порогу
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ─── Stock ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="size-4 text-primary" />
              Запаси
            </CardTitle>
            <CardDescription>
              Натисніть на значення щоб відредагувати
            </CardDescription>
          </CardHeader>
          <CardContent>
            {point.stock.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Немає товарів</p>
            ) : (
              <div className="flex flex-col">
                {/* Column headers */}
                <div className="flex items-center gap-3 pb-2 text-xs text-muted-foreground font-medium border-b mb-1">
                  <div className="size-8 shrink-0" />
                  <div className="flex-1">Товар</div>
                  <div className="min-w-[110px] text-right">Кількість</div>
                  <div className="min-w-[120px] text-right">Мін. поріг</div>
                </div>
                {point.stock.map((s) => (
                  <StockRow
                    key={s.productId}
                    pointId={point.id}
                    productId={s.productId}
                    quantity={s.quantity}
                    minThreshold={s.minThreshold}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Requests ─── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="size-4 text-primary" />
                  Запити на доставку
                </CardTitle>
                <CardDescription className="mt-1">
                  {requests.length === 0 ? 'Немає активних запитів' : `${requests.length} запит(ів)`}
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingRequest(undefined); setDialogOpen(true); }}>
                <Plus className="size-4" data-icon="inline-start" />
                Новий
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Запитів немає</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Натисніть «Новий» щоб створити запит
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {requests.map((req) => {
                  const product = PRODUCTS.find((p) => p.id === req.productId);
                  const statusCfg = STATUS_CONFIG[req.status];
                  const StatusIcon = statusCfg.icon;
                  const canEdit = req.status === 'pending';

                  return (
                    <div
                      key={req.id}
                      className="rounded-lg border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product?.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {req.quantity.toLocaleString()} {product?.unit}
                          </p>
                        </div>
                        <CriticalityBadge level={req.criticality} />
                      </div>

                      <Separator className="my-2" />

                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-1.5 text-xs ${statusCfg.classes}`}>
                          <StatusIcon className="size-3" />
                          <span>{statusCfg.label}</span>
                          <span className="text-muted-foreground ml-1">
                            {new Date(req.createdAt).toLocaleTimeString('uk-UA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {canEdit && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7"
                              onClick={() => { setEditingRequest(req); setDialogOpen(true); }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteRequest(req)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RequestDialog
        pointId={point.id}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingRequest(undefined); }}
        editing={editingRequest}
      />
    </PageLayout>
  );
}
