import { db } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { Invoice } from '@/types';

const COLLECTION_NAME = 'invoices';

const mapToInvoice = (docId: string, data: any): Invoice => {
  return {
    id: docId,
    clientId: data.clientId,
    projectId: data.projectId || '',
    amount: data.amount || 0,
    status: data.status || 'No Facturado',
    sentAt: data.sentAt ? data.sentAt.toDate() : null,
    paidAt: data.paidAt ? data.paidAt.toDate() : null,
    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
  } as Invoice;
};

export const getInvoicesByClient = async (clientId: string): Promise<Invoice[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapToInvoice(doc.id, doc.data()));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...invoiceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

export const updateInvoice = async (id: string, updateData: Partial<Invoice>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const dataToUpdate = { ...updateData, updatedAt: serverTimestamp() };
    delete dataToUpdate.id;
    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};
