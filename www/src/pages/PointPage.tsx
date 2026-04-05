import { PageLayout } from '@/components/layout/PageLayout';
import { NearestLocations } from '@/components/point/NearestLocations';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CriticalityBadge } from '@/components/ui/criticality-badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';
import type { CriticalityLevel } from '@/data/criticality';
import { createDeliveryRequest, deleteDeliveryRequest, updateDeliveryRequest } from '@/lib/api/delivery-requests';
import { deletePoint, getPoint, updatePointStock } from '@/lib/api/points';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMapPoints } from '@/store/slices/mapPointsSlice';
import { fetchRequests } from '@/store/slices/requestsSlice';
import type {
  DeliveryRequestResponseDto,
  PointDetailResponseDto,
  PointStockItemResponseDto,
  ProductResponseDto,
} from '@/types/api';
import { AlertTriangle, CheckCircle2, Clock, Loader2, MapPin, Package, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{request ? 'Редагувати запит' : 'Новий запит на доставку'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Товар</label>
            <NativeSelect className="w-full" value={productId} onChange={(e) => setProductId(Number(e.target.value))}>
              {products.map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Кількість</label>
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
            <label className="text-sm font-medium">Критичність</label>
            <NativeSelect
              className="w-full"
              value={criticality}
              onChange={(e) => setCriticality(e.target.value as CriticalityLevel)}
            >
              {CRITICALITY_OPTIONS.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Скасувати
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin mr-1" />}
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const dispatch = useAppDispatch();

  const [point, setPoint] = useState<PointDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const user = useAppSelector((s) => s.auth.user);

  const [dialogState, setDialogState] = useState<
    { mode: 'create' } | { mode: 'edit'; request: DeliveryRequestResponseDto } | null
  >(null);

  const products = useAppSelector((s) => s.products.products);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      try {
        setError(null);
        const data = await getPoint(Number(id));
        if (!cancelled) setPoint(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не вдалося завантажити дані точки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function refetchPoint() {
    if (!id) return;
    try {
      setError(null);
      const data = await getPoint(Number(id));
      setPoint(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити дані точки');
    }
  }

  function handleSaved() {
    setDialogState(null);
    void refetchPoint();
    dispatch(fetchRequests());
  }

  async function handleDeletePoint() {
    if (!id) return;
    setDeleting(true);
    try {
      await deletePoint(Number(id));
      await dispatch(fetchMapPoints());
      navigate('/');
    } finally {
      setDeleting(false);
    }
  }

  async function handleDelete(requestId: number) {
    if (!point) return;
    try {
      await deleteDeliveryRequest(point.id, requestId);
      void refetchPoint();
      dispatch(fetchRequests());
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
    return <NotFoundPage />;
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
        {user?.role === 'admin' && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
            title="Видалити точку"
          >
            <Trash2 className="size-4" />
          </Button>
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
                  <StockRow key={s.product.id} item={s} pointId={point.id} onThresholdSaved={() => void refetchPoint()} />
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
              <Button size="sm" onClick={() => setDialogState({ mode: 'create' })}>
                <Plus className="size-4" data-icon="inline-start" />
                Новий
              </Button>
            </div>
          </CardHeader>
          {dialogState !== null && (
            <RequestDialog
              pointId={point.id}
              products={products}
              request={dialogState.mode === 'edit' ? dialogState.request : undefined}
              onSaved={handleSaved}
              onClose={() => setDialogState(null)}
            />
          )}

          <CardContent>
            {requests.length === 0 ? (
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
                              onClick={() => setDialogState({ mode: 'edit', request: req })}
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

      {point.stock.length > 0 && (
        <div className="mt-6">
          <NearestLocations pointId={point.id} />
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити точку доставки?</AlertDialogTitle>
            <AlertDialogDescription>Точку буде архівовано. Цю дію не можна скасувати.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void handleDeletePoint();
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
