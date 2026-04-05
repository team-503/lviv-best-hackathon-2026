import { useState, useEffect, useMemo } from 'react';
import { Users, Warehouse, MapPin, ShieldCheck, User, ChevronRight, Loader2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { getLevel, levelToArray } from '@/lib/permissions';
import type { PermissionLevel, ResourceType } from '@/lib/permissions';
import { getUsers } from '@/lib/api/profiles';
import { getPermissions, createPermission, updatePermission, deletePermission } from '@/lib/api/permissions';
import type { UserResponseDto, PermissionResponseDto } from '@/types/api';

// ─── Permission toggle ───
const LEVELS: { value: PermissionLevel; label: string }[] = [
  { value: 'none', label: 'Немає' },
  { value: 'read', label: 'Читання' },
  { value: 'write', label: 'Читання + Запис' },
];

function PermissionToggle({
  level,
  disabled,
  onChange,
}: {
  level: PermissionLevel;
  disabled?: boolean;
  onChange: (level: PermissionLevel) => void;
}) {
  return (
    <div className="flex rounded-lg border overflow-hidden shrink-0">
      {LEVELS.map((l, idx) => (
        <button
          key={l.value}
          disabled={disabled}
          onClick={() => onChange(l.value)}
          className={cn(
            'px-2.5 py-1 text-xs font-medium transition-colors',
            idx < LEVELS.length - 1 && 'border-r',
            level === l.value
              ? l.value === 'none'
                ? 'bg-muted text-foreground'
                : l.value === 'read'
                  ? 'bg-primary/15 text-primary'
                  : 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted/60',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

// ─── Resource row ───
function ResourceRow({
  name,
  type,
  resourceId,
  perm,
  onChanged,
}: {
  name: string;
  type: ResourceType;
  resourceId: number;
  perm: PermissionResponseDto | undefined;
  onChanged: (resourceType: ResourceType, resourceId: number, newPerms: string[]) => void;
}) {
  const level = getLevel(perm?.permissions);

  function handleChange(newLevel: PermissionLevel) {
    if (newLevel === level) return;
    onChanged(type, resourceId, levelToArray(newLevel));
  }

  const isWarehouse = type === 'warehouse';

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md',
          isWarehouse ? 'bg-indigo-500/15' : 'bg-primary/15',
        )}
      >
        {isWarehouse ? (
          <Warehouse className="size-4 text-indigo-600 dark:text-indigo-400" />
        ) : (
          <MapPin className="size-4 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{isWarehouse ? 'Склад' : 'Точка доставки'}</p>
      </div>

      <PermissionToggle level={level} onChange={handleChange} />
    </div>
  );
}

// ─── User card ───
const ROLE_LABELS: Record<string, string> = {
  admin: 'Адміністратор',
  user: 'Користувач',
  warehouse: 'Склад',
  delivery: 'Точка доставки',
};

function UserCard({
  profile,
  selected,
  permCount,
  onClick,
}: {
  profile: UserResponseDto;
  selected: boolean;
  permCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
        selected ? 'bg-primary/10 border border-primary/30' : 'border border-transparent hover:bg-muted/50',
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">{profile.displayName ?? profile.email}</p>
        <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="secondary" className="text-xs">
          {ROLE_LABELS[profile.role] ?? profile.role}
        </Badge>
        {permCount > 0 && (
          <Badge variant="outline" className="text-xs">
            <ShieldCheck className="size-3 mr-1" />
            {permCount}
          </Badge>
        )}
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </button>
  );
}

// ─── Main page ───
export function PermissionsPage() {
  const points = useAppSelector((s) => s.mapPoints.points);
  const warehouses = useMemo(() => points.filter((p) => p.type === 'warehouse'), [points]);
  const deliveryPoints = useMemo(() => points.filter((p) => p.type === 'point'), [points]);

  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [allPerms, setAllPerms] = useState<PermissionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [fetchedUsers, fetchedPerms] = await Promise.all([getUsers(), getPermissions()]);
        if (!cancelled) {
          setUsers(fetchedUsers);
          setAllPerms(fetchedPerms);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Помилка завантаження даних');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const userPerms = selectedUserId ? allPerms.filter((p) => p.userId === selectedUserId) : [];
  const selectedProfile = users.find((u) => u.id === selectedUserId);

  function findPerm(type: ResourceType, resourceId: number) {
    return userPerms.find((p) => p.resourceType === type && p.resourceId === resourceId);
  }

  const permCountByUser = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allPerms) {
      map.set(p.userId, (map.get(p.userId) ?? 0) + 1);
    }
    return map;
  }, [allPerms]);

  async function handlePermissionChanged(userId: string, resourceType: ResourceType, resourceId: number, newPerms: string[]) {
    const existing = allPerms.find((p) => p.userId === userId && p.resourceType === resourceType && p.resourceId === resourceId);

    try {
      if (newPerms.length === 0) {
        // Delete
        if (existing) {
          await deletePermission(existing.id);
          setAllPerms((prev) => prev.filter((p) => p.id !== existing.id));
        }
      } else if (existing) {
        // Update
        const updated = await updatePermission(existing.id, newPerms);
        setAllPerms((prev) => prev.map((p) => (p.id === existing.id ? updated : p)));
      } else {
        // Create
        const created = await createPermission({
          userId,
          resourceType,
          resourceId,
          permissions: newPerms,
        });
        setAllPerms((prev) => [...prev, created]);
      }
    } catch (err) {
      console.error('Failed to update permission:', err);
    }
  }

  if (loading) {
    return (
      <PageLayout title="LogiFlow" subtitle="Доступи користувачів">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="LogiFlow" subtitle="Доступи користувачів">
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="LogiFlow" subtitle="Доступи користувачів">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Управління доступами</h1>
            <p className="text-sm text-muted-foreground">Налаштуйте права читання та запису для кожного користувача</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Users list */}
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm font-semibold">Користувачі</span>
              <Badge variant="secondary" className="text-xs">
                {users.length}
              </Badge>
            </div>

            {users.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">Інших користувачів не знайдено</p>
            )}

            {users.length > 0 && (
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-2 flex flex-col gap-1">
                {users.map((profile) => (
                  <UserCard
                    key={profile.id}
                    profile={profile}
                    selected={selectedUserId === profile.id}
                    permCount={permCountByUser.get(profile.id) ?? 0}
                    onClick={() => setSelectedUserId(profile.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Permissions panel */}
          <div className="rounded-xl border bg-card">
            {!selectedUserId ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <ShieldCheck className="size-10 opacity-30" />
                <p className="text-sm">Оберіть користувача зліва</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate">
                      {selectedProfile?.displayName ?? selectedProfile?.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{selectedProfile?.email}</p>
                  </div>
                </div>

                <div className="p-4 space-y-5">
                  {/* Warehouses */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Warehouse className="size-4 text-indigo-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Склади</span>
                    </div>
                    <div className="flex flex-col divide-y">
                      {warehouses.map((wh) => (
                        <ResourceRow
                          key={wh.id}
                          name={wh.name}
                          type="warehouse"
                          resourceId={wh.id}
                          perm={findPerm('warehouse', wh.id)}
                          onChanged={(rt, rid, perms) => handlePermissionChanged(selectedUserId, rt, rid, perms)}
                        />
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Delivery points */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="size-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Точки доставки</span>
                    </div>
                    <div className="flex flex-col divide-y">
                      {deliveryPoints.map((pt) => (
                        <ResourceRow
                          key={pt.id}
                          name={pt.name}
                          type="point"
                          resourceId={pt.id}
                          perm={findPerm('point', pt.id)}
                          onChanged={(rt, rid, perms) => handlePermissionChanged(selectedUserId, rt, rid, perms)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
