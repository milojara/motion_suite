"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { InlineEdit } from "@/components/ui/InlineEdit";
import { SocialPills } from "@/components/ui/SocialPills";
import { StatusPills } from "@/components/ui/StatusPills";
import { getContentList, createContent, updateContent, deleteContent } from "@/lib/firebase/content";
import { Content, SocialNetwork } from "@/types";
import { Search, Trash2, Clapperboard, Video, Camera, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Helper for Social Icons
const getSocialIcon = (sn: SocialNetwork) => {
  switch (sn) {
    case "YouTube Shorts": return <Video className="h-5 w-5 text-red-500" />;
    case "Instagram": return <Camera className="h-5 w-5 text-fuchsia-500" />;
    case "TikTok": return <Smartphone className="h-5 w-5 text-cyan-400" />;
    default: return null;
  }
};

const getSocialBorder = (sn: SocialNetwork) => {
  switch (sn) {
    case "YouTube Shorts": return "border-l-red-500 shadow-[inset_4px_0_0_0_rgba(239,68,68,1)]";
    case "Instagram": return "border-l-fuchsia-500 shadow-[inset_4px_0_0_0_rgba(217,70,239,1)]";
    case "TikTok": return "border-l-cyan-400 shadow-[inset_4px_0_0_0_rgba(34,211,238,1)]";
    default: return "border-l-transparent";
  }
};

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Quick Add State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickSocial, setQuickSocial] = useState<SocialNetwork | undefined>();
  const [isAdding, setIsAdding] = useState(false);

  const fetchContents = async () => {
    try {
      const data = await getContentList();
      setContents(data);
    } catch (error) {
      toast.error("Error al cargar el contenido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleQuickAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim() || !quickSocial) {
      toast.error("Ingresa un título y selecciona una red social");
      return;
    }
    
    setIsAdding(true);
    try {
      await createContent({
        title: quickTitle,
        socialNetwork: quickSocial,
        client: "Borrador",
        campaign: "",
        status: "Material Bruto",
        priority: "Media",
        description: "",
        workspace: "team",
        links: {},
      });
      toast.success("Contenido añadido rápidamente");
      setQuickTitle("");
      setQuickSocial(undefined);
      fetchContents();
    } catch (error) {
      toast.error("Error al añadir contenido");
    } finally {
      setIsAdding(false);
    }
  };

  const handleInlineUpdate = async (id: string, field: string, value: any) => {
    try {
      setContents(prev => prev.map(c => {
        if (c.id === id) {
          if (field.startsWith("links.")) {
            const linkField = field.split(".")[1];
            return { ...c, links: { ...c.links, [linkField]: value } };
          }
          return { ...c, [field]: value };
        }
        return c;
      }));
      
      if (field.startsWith("links.")) {
        const linkField = field.split(".")[1];
        await updateContent(id, { links: { [linkField]: value } });
      } else {
        await updateContent(id, { [field]: value });
      }
    } catch (error) {
      toast.error("Error al actualizar el campo");
      fetchContents();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este contenido?")) {
      try {
        await deleteContent(id);
        setContents(prev => prev.filter(c => c.id !== id));
        toast.success("Contenido eliminado");
      } catch (error) {
        toast.error("Error al eliminar el contenido");
      }
    }
  };

  const filteredContents = contents.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="flex flex-col h-full space-y-6 max-w-4xl mx-auto pb-24">
          
          <div className="flex flex-col justify-between gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 drop-shadow-sm">Contenido</h1>
            <p className="text-sm text-zinc-400">Edición rápida y fluida.</p>
          </div>

          {/* Premium Quick Add Section (Glassmorphism) */}
          <div className="relative z-10 rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  placeholder="Ej: Clip #1 Entrevista..."
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full bg-transparent min-h-[44px] px-4 py-2 text-base text-zinc-50 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
              <div className="w-full sm:w-auto h-px sm:h-8 sm:w-px bg-zinc-800" />
              <div className="flex w-full sm:w-auto items-center justify-between gap-3 px-2 pb-2 sm:pb-0 pt-2 sm:pt-0">
                <SocialPills
                  value={quickSocial}
                  onChange={setQuickSocial}
                  className="flex-1 sm:flex-none justify-center"
                />
                <Button 
                  type="submit" 
                  disabled={isAdding || !quickTitle || !quickSocial} 
                  className="min-h-[44px] rounded-xl px-6 flex-1 sm:flex-none font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 transition-transform"
                >
                  {isAdding ? "..." : "Añadir"}
                </Button>
              </div>
            </form>
          </div>

          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input 
              placeholder="Buscar por título..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-950/50 pl-12 pr-4 text-base text-zinc-50 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Content List - Mobile First (Cards Only) */}
          <div className="flex-1 flex flex-col gap-4">
            {loading ? (
              <div className="p-8 text-center text-zinc-500 animate-pulse">Cargando...</div>
            ) : filteredContents.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-12 text-center backdrop-blur-sm mt-4"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950/0 to-transparent pointer-events-none" />
                <div className="relative flex flex-col items-center justify-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900/80 shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-zinc-800 backdrop-blur-md">
                    <Clapperboard className="h-8 w-8 text-indigo-400 drop-shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-50 drop-shadow-sm">Aún no hay resultados</h3>
                  <p className="mt-2 max-w-xs mx-auto text-sm text-zinc-400">
                    Comienza utilizando el "Quick Add" de arriba.
                  </p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredContents.map((content, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    key={content.id}
                    className={cn(
                      "relative rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 sm:p-5 shadow-lg backdrop-blur-md transition-all hover:bg-zinc-900/40",
                      getSocialBorder(content.socialNetwork)
                    )}
                  >
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="shrink-0 drop-shadow-md">
                          {getSocialIcon(content.socialNetwork)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <InlineEdit 
                            value={content.title} 
                            onSave={(val) => handleInlineUpdate(content.id, "title", val)}
                            textClassName="font-semibold text-zinc-50 text-base sm:text-lg w-full min-h-[28px]"
                            inputClassName="min-h-[44px] text-base"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(content.id)} 
                        className="shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] text-zinc-600 hover:text-red-500 rounded-full hover:bg-zinc-800/50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-3 mb-5">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Red Social</span>
                        <SocialPills 
                          value={content.socialNetwork} 
                          onChange={(val) => handleInlineUpdate(content.id, "socialNetwork", val)} 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Estado</span>
                        <StatusPills 
                          status={content.status} 
                          onChange={(val) => handleInlineUpdate(content.id, "status", val)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1 rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-2 sm:p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-1">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Drive Raw</span>
                        <InlineEdit 
                          type="url"
                          value={content.links?.driveRaw || ""} 
                          onSave={(val) => handleInlineUpdate(content.id, "links.driveRaw", val)}
                          placeholder="Pegar link de Drive..."
                          className="w-full sm:text-right"
                          textClassName="text-blue-400 hover:underline min-h-[44px] flex items-center sm:justify-end"
                          inputClassName="min-h-[44px]"
                        />
                      </div>
                      <div className="h-px w-full bg-zinc-800/50" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-1">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider pl-1">Video Final</span>
                        <InlineEdit 
                          type="url"
                          value={content.links?.finalVideo || ""} 
                          onSave={(val) => handleInlineUpdate(content.id, "links.finalVideo", val)}
                          placeholder="Pegar link de publicación..."
                          className="w-full sm:text-right"
                          textClassName="text-emerald-400 hover:underline min-h-[44px] flex items-center sm:justify-end"
                          inputClassName="min-h-[44px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
