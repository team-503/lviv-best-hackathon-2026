import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CriticalityBadge } from '@/components/ui/criticality-badge';
import { getPoint, updatePointStock } from '@/lib/api/points';
import { createDeliveryRequest, updateDeliveryRequest, deleteDeliveryRequest } from '@/lib/api/delivery-requests';
import type {
  PointDetailResponseDto,
  PointStockItemResponseDto,
  DeliveryRequestResponseDto,
  ProductResponseDto,
} from '@/types/api';
import { useAppSelector } from '@/store/hooks';
import { Package, MapPin, Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, Clock, Save, X, Loader2 } from 'lucide-react';

type CriticalityLevel = 'normal' | 'medium' | 'high' | 'critical' | 'urgent';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; classes: string }> = {
  active: { label: 'Активний', icon: Clock, classes: 'text-muted-foreground' },
  completed: { label: 'Виконано', icon: CheckCircle2, classes: 'text-emerald-500' },
  cancelled: { label: 'Скасовано', icon: X, classes: 'text-destructive' },
};

const CRITICALITY_OPTIONS: { value: CriticalityLevel; label: string }[] = [
  { value: 'urgent', label: 'Терміново' },
  { value: 'critical', label: 'Критично' },
  { value: 'high', label: 'Високий' },
  { value: 'medium', label: 'Середній' },
  { value: 'normal', label: 'Нормально' },
];

// ─── Request Dialog ───
function RequestDialog({
  pointId,
  products,
  request,
  onSaved,
  onClose,
}: {
  pointId: number;
  products: ProductResponseDto[];
  request?: DeliveryRequestResponseDto;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [productId, setProductId] = useState<number>(request?.product.id ?? products[0]?.id ?? 0);
  const [quantity, setQuantity] = useState<string>(request ? String(request.quantity) : '');
  const [criticality, setCriticality] = useState<CriticalityLevel>((request?.criticality as CriticalityLevel) ?? 'normal');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0 || productId === 0) return;
    setSaving(true);
    try {
      if (request) {
        await updateDeliveryRequest(pointId, request.id, {
          productId,
          quantity: qty,
          criticality,
        });
      } else {
        await createDeliveryRequest(pointId, {
          productId,
          quantity: qty,
          criticality,
        });
      }
      onSaved();
    } catch {
      // keep dialog open on error
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{request ? 'Редагувати запит' : 'Новий запит на доставку'}</CardTitle>
          <Button size="icon" variant="ghost" className="size-7" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Товар</label>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Кількість</label>
          <Input
            type="number"
            min={1}
            placeholder="Введіть кількість"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSubmit();
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Критичність</label>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={criticality}
            onChange={(e) => setCriticality(e.target.value as CriticalityLevel)}
          >
            {CRITICALITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Скасувати
          </Button>
          <Button size="sm" onClick={() => void handleSubmit()} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin mr-1" />}
            Зберегти
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Stock Row ───
function StockRow({
  item,
  pointId,
  onThresholdSaved,
}: {
  item: PointStockItemResponseDto;
  pointId: number;
  onThresholdSaved: () => void;
}) {
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [thresholdVal, setThresholdVal] = useState(String(item.minThreshold));

  const isBelowThreshold = item.quantity < item.minThreshold;

  async function saveThreshold() {
    const num = parseInt(thresholdVal);
    if (isNaN(num) || num < 0) return;
    try {
      await updatePointStock(pointId, [{ productId: item.product.id, minThreshold: num }]);
      setEditingThreshold(false);
      onThresholdSaved();
    } catch {
      // keep editing open on error
    }
  }

  return (
    <div
      className={`flex items-center gap-3 py-3 border-b last:border-0 ${isBelowThreshold ? 'bg-destructive/5 -mx-4 px-4 rounded' : ''}`}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Package className="size-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{item.product.name}</p>
        {isBelowThreshold && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
            <AlertTriangle className="size-3" /> Нижче мінімального порогу
          </p>
        )}
      </div>

      {/* Quantity (read-only — quantity is managed by deliveries) */}
      <div className="flex items-center gap-1.5 min-w-[110px] justify-end">
        <span className={`text-sm font-mono ${isBelowThreshold ? 'text-destructive font-semibold' : ''}`}>
          {item.quantity.toLocaleString()}
        </span>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') void saveThreshold();
                if (e.key === 'Escape') setEditingThreshold(false);
              }}
              autoFocus
            />
            <Button size="icon" variant="ghost" className="size-6" onClick={() => void saveThreshold()}>
              <Save className="size-3" />
            </Button>
            <Button size="icon" variant="ghost" className="size-6" onClick={() => setEditingThreshold(false)}>
              <X className="size-3" />
            </Button>
          </div>
        ) : (
          <button
            className="flex items-center gap-1 text-xs font-mono hover:text-primary transition-colors group"
            onClick={() => {
              setThresholdVal(String(item.minThreshold));
              setEditingThreshold(true);
            }}
            title="Редагувати мінімальний поріг"
          >
            <span>{item.minThreshold.toLocaleString()}</span>
            <Pencil className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───
export function PointPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [point, setPoint] = useState<PointDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [editingRequest, setEditingRequest] = useState<DeliveryRequestResponseDto | undefined>(undefined);

  const products = useAppSelector((s) => s.products.products);

  const fetchPoint = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await getPoint(Number(id));
      setPoint(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити дані точки');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchPoint();
  }, [fetchPoint]);

  function openCreateDialog() {
    setEditingRequest(undefined);
    setDialogMode('create');
  }

  function openEditDialog(req: DeliveryRequestResponseDto) {
    setEditingRequest(req);
    setDialogMode('edit');
  }

  function closeDialog() {
    setDialogMode(null);
    setEditingRequest(undefined);
  }

  function handleSaved() {
    closeDialog();
    void fetchPoint();
  }

  async function handleDelete(requestId: number) {
    if (!point) return;
    try {
      await deleteDeliveryRequest(point.id, requestId);
      void fetchPoint();
    } catch {
      // silently fail for now
    }
  }

  if (loading) {
    return (
      <PageLayout title="Завантаження...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !point) {
    return (
      <PageLayout title="Помилка">
        <p className="text-muted-foreground">{error ?? 'Точку доставки не знайдено.'}</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          На головну
        </Button>
      </PageLayout>
    );
  }

  const requests = point.deliveryRequests;

  const belowThresholdCount = point.stock.filter((s) => s.quantity < s.minThreshold).length;

  return (
    <PageLayout title={point.name} subtitle="Точка доставки">
      {/* Info strip */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <MapPin className="size-4 text-primary" />
        <span>
          {point.location.lat.toFixed(4)}, {point.location.lng.toFixed(4)}
        </span>
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
            <CardDescription>Натисніть на значення щоб відредагувати</CardDescription>
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
                  <StockRow key={s.product.id} item={s} pointId={point.id} onThresholdSaved={() => void fetchPoint()} />
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
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="size-4" data-icon="inline-start" />
                Новий
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dialogMode !== null && (
              <RequestDialog
                pointId={point.id}
                products={products}
                request={dialogMode === 'edit' ? editingRequest : undefined}
                onSaved={handleSaved}
                onClose={closeDialog}
              />
            )}

            {requests.length === 0 && dialogMode === null ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Запитів немає</p>
                <p className="text-xs text-muted-foreground mt-1">Натисніть &quot;Новий&quot; щоб створити запит</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {requests.map((req) => {
                  const statusCfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.active;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <div key={req.id} className="rounded-lg border bg-card p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{req.product.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{req.quantity.toLocaleString()}</p>
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

                        {req.status === 'active' && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7"
                              onClick={() => openEditDialog(req)}
                              title="Редагувати"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-destructive hover:text-destructive"
                              onClick={() => void handleDelete(req.id)}
                              title="Видалити"
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
    </PageLayout>
  );
}
