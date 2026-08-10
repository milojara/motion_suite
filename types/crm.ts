export interface Client {
  id: string;
  name: string; // Nombre comercial
  legalName?: string; // Razón Social
  nit: string; // NIT / Documento
  phone: string; // WhatsApp
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string; // Reference to Client
  projectId: string; // Reference to Project
  amount: number;
  status: 'No Facturado' | 'Cuenta Enviada' | 'Pagado';
  sentAt?: Date | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
