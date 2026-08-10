"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { getContentList } from "@/lib/firebase/content";
import { Content } from "@/types";
import { Film, Clock, CheckCircle, AlertCircle, Calendar, Clapperboard } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "../constants";

export default function Dashboard() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const data = await getContentList();
        setContents(data);
      } catch (error) {
        console.error("Failed to fetch contents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, []);

  const stats = {
    editing: contents.filter(c => c.status === 'En Edición').length,
    pending: contents.filter(c => c.status === 'Material Bruto').length,
    published: contents.filter(c => c.status === 'Exportado').length,
    delayed: 0, // Placeholder logic for delayed
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
            <p className="text-zinc-400 mt-2">Visión general de tu producción audiovisual.</p>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-24" />
                </Card>
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-12 text-center backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950/0 to-transparent pointer-events-none" />
              <div className="relative flex flex-col items-center justify-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900/80 shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-zinc-800 backdrop-blur-md">
                  <Clapperboard className="h-10 w-10 text-indigo-400 drop-shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-50 drop-shadow-sm">Aún no hay contenido</h3>
                <p className="mt-3 max-w-sm mx-auto text-base text-zinc-400">
                  El tablero está vacío. Inicia la magia creando tu primera producción audiovisual.
                </p>
                <Link 
                  href={ROUTES.CONTENT}
                  className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-zinc-50 px-8 font-medium text-zinc-900 transition-all hover:bg-zinc-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Comenzar
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">En Edición</CardTitle>
                    <Film className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-zinc-50">{stats.editing}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Pendientes</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-zinc-50">{stats.pending}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Publicados</CardTitle>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-zinc-50">{stats.published}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Retrasados</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-zinc-50">{stats.delayed}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Entregas Próximas</CardTitle>
                    <CardDescription>Contenidos que deben entregarse pronto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contents.filter(c => c.deliveryDate).slice(0, 5).map(content => (
                        <div key={content.id} className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none text-zinc-50">{content.title}</p>
                            <p className="text-sm text-zinc-400">{content.client}</p>
                          </div>
                          <div className="flex items-center text-sm text-zinc-400">
                            <Calendar className="mr-2 h-4 w-4" />
                            {content.deliveryDate?.toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      {contents.filter(c => c.deliveryDate).length === 0 && (
                        <p className="text-sm text-zinc-500 text-center py-4">No hay entregas próximas</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Tus últimos contenidos actualizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contents.slice(0, 5).map(content => (
                        <div key={content.id} className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none text-zinc-50">{content.title}</p>
                            <p className="text-sm text-zinc-400">Actualizado {content.updatedAt.toLocaleDateString()}</p>
                          </div>
                          <div className="text-sm font-medium text-zinc-300">
                            {content.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
