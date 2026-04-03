import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess, findUserByEmail } from '@/store/slices/authSlice';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Truck } from 'lucide-react';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const stored = findUserByEmail(email);
    if (!stored || stored.passwordHash !== password) {
      setError('Невірний email або пароль');
      return;
    }

    const { passwordHash: _, ...user } = stored;
    dispatch(loginSuccess(user));
    navigate(from, { replace: true });
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
            <CardTitle className="text-base">Вхід до системи</CardTitle>
            <CardDescription className="text-xs">Введіть дані для входу</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@logiflow.ua"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full">Увійти</Button>
              <p className="text-xs text-muted-foreground text-center">
                Немає акаунту?{' '}
                <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                  Зареєструватись
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Тестовий акаунт: <span className="font-mono">admin@logiflow.ua</span> / <span className="font-mono">admin123</span>
        </p>
      </div>
    </div>
  );
}
