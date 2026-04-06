import { useState } from 'react';
import { Package, Trash2, Plus, Loader2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productsSlice';
import { createProduct, deleteProduct } from '@/lib/api/products';

export function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.products);

  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed || submitting) return;

    try {
      setSubmitting(true);
      await createProduct(trimmed);
      setNewName('');
      dispatch(fetchProducts());
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (deletingId !== null) return;

    try {
      setDeletingId(id);
      await deleteProduct(id);
      dispatch(fetchProducts());
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading && products.length === 0) {
    return (
      <PageLayout title="LogiFlow" subtitle="Управління продуктами">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="LogiFlow" subtitle="Управління продуктами">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Управління продуктами</h1>
            <p className="text-sm text-muted-foreground">Додавайте та видаляйте продукти</p>
          </div>
        </div>

        {/* Create form */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold">Додати продукт</span>
          </div>
          <div className="p-4">
            <form
              className="flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
            >
              <Input
                placeholder="Назва продукту"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={submitting}
                className="flex-1"
              />
              <Button type="submit" disabled={!newName.trim() || submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4 mr-1.5" />}
                Додати
              </Button>
            </form>
          </div>
        </div>

        {/* Products list */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold">Продукти</span>
            <Badge variant="secondary" className="text-xs">
              {products.length}
            </Badge>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Package className="size-10 opacity-30" />
              <p className="text-sm">Продуктів не знайдено</p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
              <div className="divide-y">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Package className="size-4 text-primary" />
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">{product.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={deletingId === product.id}
                      onClick={() => handleDelete(product.id)}
                      aria-label={`Видалити ${product.name}`}
                    >
                      {deletingId === product.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
