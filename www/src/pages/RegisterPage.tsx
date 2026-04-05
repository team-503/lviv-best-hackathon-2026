import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';
import { UserRole, USER_ROLE_LABELS } from '@/types/user-role';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck } from 'lucide-react';

const ROLES = Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({ value: value as UserRole, label }));

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.User);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль має бути не менше 6 символів');
      return;
    }

    setLoading(true);

    const result = await dispatch(registerUser({ name, email, password, role }));

    if (registerUser.rejected.match(result)) {
      setError(result.error.message ?? 'Помилка реєстрації');
      setLoading(false);
      return;
    }

    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
            <Truck className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">LogiFlow</h1>
          <p className="text-sm text-muted-foreground">Платформа управління логістикою</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Реєстрація</CardTitle>
            <CardDescription className="text-xs">Створіть обліковий запис</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col gap-4 pb-6">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Ім'я</Label>
                <Input
                  id="name"
                  placeholder="Іван Франко"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ivan@logiflow.ua"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Роль</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Завантаження...' : 'Зареєструватись'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Вже маєте акаунт?{' '}
                <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                  Увійти
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
