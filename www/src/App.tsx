import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppSelector } from '@/store/hooks';
import { MapPage } from '@/pages/MapPage';
import { PointPage } from '@/pages/PointPage';
import { WarehousePage } from '@/pages/WarehousePage';

export default function App() {
  const theme = useAppSelector((s) => s.ui.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/point/:id" element={<PointPage />} />
        <Route path="/warehouse/:id" element={<WarehousePage />} />
      </Routes>
    </TooltipProvider>
  );
}
