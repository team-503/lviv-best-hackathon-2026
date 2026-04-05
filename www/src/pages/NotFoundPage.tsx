import { Button } from '@/components/ui/button';
import { Home, PackageX, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
        {/* Animated truck scene */}
        <div className="relative">
          <div className="text-[10rem] font-black leading-none tracking-tighter text-primary/10">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <PackageX className="size-8 text-primary" />
              </div>
              <Truck className="size-6 text-muted-foreground/40 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Сторінку не знайдено</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Схоже, ця вантажівка заїхала не туди. Сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>
        </div>

        {/* Action */}
        <Button size="lg" onClick={() => navigate('/')}>
          <Home className="size-4 mr-2" />
          На головну
        </Button>
      </div>
    </div>
  );
}
