import { useState, useCallback } from 'react';
import { Users, Warehouse, MapPin, ShieldCheck, User, ChevronRight } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import {
  getLevel,
  levelToArray,
  type Profile,
  type UserPermission,
  type PermissionLevel,
  type ResourceType,
} from '@/lib/permissions';

// ─── Mock data ───
const MOCK_PROFILES: Profile[] = [
  { id: 'u2', email: 'warehouse1@logiflow.ua', display_name: 'Іван Мельник', role: 'user' },
  { id: 'u3', email: 'warehouse2@logiflow.ua', display_name: 'Олена Бондар', role: 'user' },
  { id: 'u4', email: 'delivery1@logiflow.ua', display_name: 'Петро Савченко', role: 'user' },
  { id: 'u5', email: 'delivery2@logiflow.ua', display_name: 'Марія Коваленко', role: 'user' },
  { id: 'u6', email: 'delivery3@logiflow.ua', display_name: 'Дмитро Поліщук', role: 'user' },
];

const MOCK_PERMISSIONS: Record<string, UserPermission[]> = {
  u2: [
    { id: 1, user_id: 'u2', resource_type: 'warehouse', resource_id: 'w1', permissions: ['read', 'write'] },
    { id: 2, user_id: 'u2', resource_type: 'warehouse', resource_id: 'w2', permissions: ['read'] },
  ],
  u3: [{ id: 3, user_id: 'u3', resource_type: 'warehouse', resource_id: 'w2', permissions: ['read', 'write'] }],
  u4: [
    { id: 4, user_id: 'u4', resource_type: 'point', resource_id: 'd1', permissions: ['read', 'write'] },
    { id: 5, user_id: 'u4', resource_type: 'point', resource_id: 'd2', permissions: ['read'] },
  ],
  u5: [
    { id: 6, user_id: 'u5', resource_type: 'point', resource_id: 'd3', permissions: ['read', 'write'] },
    { id: 7, user_id: 'u5', resource_type: 'point', resource_id: 'd4', permissions: ['read', 'write'] },
  ],
  u6: [],
};

let nextPermId = 100;

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
  address,
  type,
  resourceId,
  perm,
  onChanged,
}: {
  name: string;
  address: string;
  type: ResourceType;
  resourceId: string;
  perm: UserPermission | undefined;
  onChanged: (resourceType: ResourceType, resourceId: string, newPerms: string[]) => void;
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
        <p className="text-xs text-muted-foreground truncate">{address}</p>
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
  profile: Profile;
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
        <p className="text-sm font-medium leading-tight truncate">{profile.display_name ?? profile.email}</p>
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
  const warehouses = points.filter((p) => p.type === 'warehouse');
  const deliveryPoints = points.filter((p) => p.type === 'delivery');

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  // Local copy of mock permissions (mutable during session)
  const [allPerms, setAllPerms] = useState<Record<string, UserPermission[]>>(() => structuredClone(MOCK_PERMISSIONS));

  const permissions = selectedUserId ? (allPerms[selectedUserId] ?? []) : [];
  const selectedProfile = MOCK_PROFILES.find((p) => p.id === selectedUserId);

  function findPerm(type: ResourceType, resourceId: string) {
    return permissions.find((p) => p.resource_type === type && p.resource_id === resourceId);
  }

  const handlePermissionChanged = useCallback(
    (userId: string, resourceType: ResourceType, resourceId: string, newPerms: string[]) => {
      setAllPerms((prev) => {
        const userPerms = [...(prev[userId] ?? [])];
        const idx = userPerms.findIndex((p) => p.resource_type === resourceType && p.resource_id === resourceId);
        if (newPerms.length === 0) {
          // Remove
          if (idx !== -1) userPerms.splice(idx, 1);
        } else if (idx !== -1) {
          // Update
          userPerms[idx] = { ...userPerms[idx], permissions: newPerms };
        } else {
          // Insert
          userPerms.push({
            id: nextPermId++,
            user_id: userId,
            resource_type: resourceType,
            resource_id: resourceId,
            permissions: newPerms,
          });
        }
        return { ...prev, [userId]: userPerms };
      });
    },
    [],
  );

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
                {MOCK_PROFILES.length}
              </Badge>
            </div>

            {MOCK_PROFILES.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">Інших користувачів не знайдено</p>
            )}

            {MOCK_PROFILES.length > 0 && (
              <ScrollArea className="max-h-[420px]">
                <div className="p-2 flex flex-col gap-1">
                  {MOCK_PROFILES.map((profile) => (
                    <UserCard
                      key={profile.id}
                      profile={profile}
                      selected={selectedUserId === profile.id}
                      permCount={(allPerms[profile.id] ?? []).length}
                      onClick={() => setSelectedUserId(profile.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
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
                      {selectedProfile?.display_name ?? selectedProfile?.email}
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
                          address={wh.address}
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
                          address={pt.address}
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
