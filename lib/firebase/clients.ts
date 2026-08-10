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
} from 'firebase/firestore';
import { Client } from '@/types';

const COLLECTION_NAME = 'clients';

const mapToClient = (docId: string, data: any): Client => {
  return {
    id: docId,
    name: data.name,
    legalName: data.legalName || '',
    nit: data.nit || '',
    phone: data.phone || '',
    email: data.email || '',
    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
  } as Client;
};

export const getClients = async (): Promise<Client[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapToClient(doc.id, doc.data()));
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return mapToClient(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error("Error fetching client by id:", error);
    throw error;
  }
};

export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...clientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

export const updateClient = async (id: string, updateData: Partial<Client>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const dataToUpdate = { ...updateData, updatedAt: serverTimestamp() };
    delete dataToUpdate.id;
    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
};
