import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNearestForPoint } from '@/lib/api/geo';
import type { ProductNearestLocationsResponseDto } from '@/types/api';
import { MapPin, Warehouse, Loader2 } from 'lucide-react';

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} м`;
  return `${(meters / 1000).toFixed(1)} км`;
}

export function NearestLocations({ pointId }: { pointId: number }) {
  const [data, setData] = useState<ProductNearestLocationsResponseDto[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getNearestForPoint(pointId);
        if (!cancelled) setData(result);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [pointId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          Найближчі локації з товарами
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data.map((group) => (
          <div key={group.product.id}>
            <p className="text-sm font-medium mb-2">{group.product.name}</p>
            {group.nearestLocations.length === 0 ? (
              <p className="text-xs text-muted-foreground">Немає доступних локацій</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {group.nearestLocations.map((loc) => (
                  <div
                    key={`${loc.locationType}-${loc.id}`}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    {loc.locationType === 'warehouse' ? (
                      <Warehouse className="size-4 text-indigo-500 shrink-0" />
                    ) : (
                      <MapPin className="size-4 text-emerald-500 shrink-0" />
                    )}
                    <span className="flex-1 min-w-0 truncate">{loc.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDistance(loc.distanceMeters)}</span>
                    <Badge variant="secondary" className="shrink-0">
                      {loc.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
