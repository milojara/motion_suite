"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Client } from "@/types";
import { getClients, createClient } from "@/lib/firebase/clients";
import { Plus, Users, Building, Phone, Mail, FolderOpen, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function PrivateClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setIsAdding(true);
    try {
      await createClient({
        name: newClientName,
        legalName: "",
        nit: "",
        phone: "",
        email: "",
      });
      setNewClientName("");
      await fetchClients();
      toast.success("Cliente añadido");
    } catch (error) {
      toast.error("Error al añadir cliente");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="flex min-h-screen flex-col space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-50 flex items-center gap-3">
                <Users className="h-8 w-8 text-indigo-500" />
                CRM Clientes
              </h1>
              <p className="text-zinc-400 mt-2">Gestiona tus clientes, facturación y producciones de forma privada.</p>
            </div>
          </div>

          {/* Quick Add Client */}
          <div className="relative z-10 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-2 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleAddClient} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-indigo-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nombre del nuevo cliente..."
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-zinc-50 placeholder-zinc-500 outline-none transition-all focus:bg-white/5 rounded-xl border border-transparent focus:border-indigo-500/30"
                  autoComplete="off"
                />
              </div>
              <div className="w-full sm:w-auto h-px sm:h-8 sm:w-px bg-indigo-500/20" />
              <div className="flex w-full sm:w-auto items-center justify-end px-2 pb-2 sm:pb-0 pt-2 sm:pt-0">
                <Button 
                  type="submit" 
                  disabled={isAdding || !newClientName.trim()} 
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all active:scale-95 px-6 min-h-[44px]"
                >
                  {isAdding ? "..." : "Añadir Cliente"}
                </Button>
              </div>
            </form>
          </div>

          {/* Clients List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full py-20 text-center text-zinc-500">Cargando...</div>
            ) : clients.length === 0 ? (
              <div className="col-span-full py-20 text-center text-zinc-500">
                Aún no tienes clientes. Crea uno arriba.
              </div>
            ) : (
              clients.map((client) => (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 transition-all hover:border-indigo-500/30 hover:bg-zinc-900/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold text-xl">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <button className="text-zinc-500 hover:text-zinc-300">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-100">{client.name}</h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-zinc-400">
                        <Phone className="mr-2 h-4 w-4 opacity-70" />
                        {client.phone || "Sin teléfono"}
                      </div>
                      <div className="flex items-center text-sm text-zinc-400">
                        <Mail className="mr-2 h-4 w-4 opacity-70" />
                        {client.email || "Sin email"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      Añadido {client.createdAt.toLocaleDateString()}
                    </span>
                    <Button variant="secondary" size="sm" className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Proyectos
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
