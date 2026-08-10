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
  Timestamp,
  where
} from 'firebase/firestore';
import { Content, Workspace } from '@/types';

const COLLECTION_NAME = 'content';

// Helper to convert Firestore Timestamp to JS Date
const mapToContent = (docId: string, data: any): Content => {
  return {
    id: docId,
    ...data,
    workspace: data.workspace || 'team',
    recordDate: data.recordDate ? data.recordDate.toDate() : null,
    deliveryDate: data.deliveryDate ? data.deliveryDate.toDate() : null,
    publishDate: data.publishDate ? data.publishDate.toDate() : null,
    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
  } as Content;
};

export const getContentList = async (workspace: Workspace = 'team'): Promise<Content[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const allContent = snapshot.docs.map(doc => mapToContent(doc.id, doc.data()));
    return allContent.filter(c => c.workspace === workspace || (workspace === 'team' && !c.workspace));
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
};

export const getContentById = async (id: string): Promise<Content | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return mapToContent(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error("Error fetching content by id:", error);
    throw error;
  }
};

export const createContent = async (contentData: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...contentData,
      workspace: contentData.workspace || 'team',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};

export const updateContent = async (id: string, updateData: Partial<Content>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const dataToUpdate = { ...updateData, updatedAt: serverTimestamp() };
    // Remove id from update payload just in case
    delete dataToUpdate.id;
    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
};

export const deleteContent = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
};
