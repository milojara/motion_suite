export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'editor' | 'viewer'; // Basic roles for future-proofing
  createdAt: Date;
}
