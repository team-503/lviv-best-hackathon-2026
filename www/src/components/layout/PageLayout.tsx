import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme } from '@/store/slices/uiSlice';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);

  return (
    <div className="flex flex-col min-h-svh bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="size-4" />
            <span className="sr-only">Назад</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="size-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold leading-none">{title}</span>
              {subtitle && (
                <p className="text-xs text-muted-foreground leading-none mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => dispatch(toggleTheme())} aria-label="Змінити тему">
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
