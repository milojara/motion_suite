"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Sparkles } from "lucide-react";

export default function PlaceholderPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Card className="flex max-w-md flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 mb-6">
              <Sparkles className="h-8 w-8 text-zinc-500" />
            </div>
            <CardTitle className="text-2xl mb-2">Próximamente</CardTitle>
            <CardDescription className="text-base">
              Esta sección estará disponible en futuras actualizaciones. Estamos trabajando para traerte las mejores herramientas de producción.
            </CardDescription>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
