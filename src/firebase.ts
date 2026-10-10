import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export { onAuthStateChanged };
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  Client,
  LegalCase,
  DocumentItem,
  TaskItem,
  CaseTimeline,
  InternalNote,
  StaffMember,
  SystemSettings,
  AuditLogItem,
} from './types';
import {
  INITIAL_CASES,
  INITIAL_CLIENTS,
  INITIAL_DOCUMENTS,
  INITIAL_TASKS,
  INITIAL_TIMELINES,
  INITIAL_NOTES,
  INITIAL_STAFF,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_AUDIT_LOGS,
} from './mockData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL per guidelines)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation types per SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized Firestore error handler per SKILL.md
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Check connectivity.');
    }
  }
}
testConnection();

/**
 * Seed initial data if Firestore collections are empty without deleting existing data.
 */
export async function seedInitialDataIfEmpty() {
  try {
    // 1. Staff
    const staffSnap = await getDocs(collection(db, 'staff'));
    if (staffSnap.empty) {
      console.log('Seeding initial staff to Firestore...');
      for (const member of INITIAL_STAFF) {
        await setDoc(doc(db, 'staff', member.id), member);
      }
    }

    // 2. Admins collection for RBAC
    const adminDoc = await getDoc(doc(db, 'admins', 'staff-admin'));
    if (!adminDoc.exists()) {
      await setDoc(doc(db, 'admins', 'staff-admin'), {
        email: 'admin@bigbosslaw.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Clients
    const clientsSnap = await getDocs(collection(db, 'clients'));
    if (clientsSnap.empty) {
      console.log('Seeding initial clients to Firestore...');
      for (const c of INITIAL_CLIENTS) {
        await setDoc(doc(db, 'clients', c.id), c);
      }
    }

    // 4. Cases
    const casesSnap = await getDocs(collection(db, 'cases'));
    if (casesSnap.empty) {
      console.log('Seeding initial cases to Firestore...');
      for (const cs of INITIAL_CASES) {
        await setDoc(doc(db, 'cases', cs.id), cs);
      }
    }

    // 5. Tasks
    const tasksSnap = await getDocs(collection(db, 'tasks'));
    if (tasksSnap.empty) {
      console.log('Seeding initial tasks to Firestore...');
      for (const t of INITIAL_TASKS) {
        await setDoc(doc(db, 'tasks', t.id), t);
      }
    }

    // 6. Documents
    const docsSnap = await getDocs(collection(db, 'documents'));
    if (docsSnap.empty) {
      console.log('Seeding initial documents to Firestore...');
      for (const d of INITIAL_DOCUMENTS) {
        await setDoc(doc(db, 'documents', d.id), d);
      }
    }

    // 7. Timelines
    const timeSnap = await getDocs(collection(db, 'timelines'));
    if (timeSnap.empty) {
      console.log('Seeding initial timelines to Firestore...');
      for (const tm of INITIAL_TIMELINES) {
        await setDoc(doc(db, 'timelines', tm.id), tm);
      }
    }

    // 8. Notes
    const notesSnap = await getDocs(collection(db, 'notes'));
    if (notesSnap.empty) {
      console.log('Seeding initial notes to Firestore...');
      for (const n of INITIAL_NOTES) {
        await setDoc(doc(db, 'notes', n.id), n);
      }
    }

    // 9. Settings
    const settingsSnap = await getDoc(doc(db, 'settings', 'firm_config'));
    if (!settingsSnap.exists()) {
      console.log('Seeding initial settings to Firestore...');
      await setDoc(doc(db, 'settings', 'firm_config'), INITIAL_SYSTEM_SETTINGS);
    }

    // 10. Audit logs
    const logsSnap = await getDocs(collection(db, 'auditLogs'));
    if (logsSnap.empty) {
      console.log('Seeding initial audit logs to Firestore...');
      for (const lg of INITIAL_AUDIT_LOGS) {
        await setDoc(doc(db, 'auditLogs', lg.id), lg);
      }
    }
  } catch (err) {
    console.warn('Initial seeding note (may already have records or permission):', err);
  }
}

/**
 * Subscribe to collections in Firestore
 */
export function subscribeCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docItem) => {
        items.push(docItem.data() as T);
      });
      onData(items);
    },
    (error) => {
      console.warn(`Firestore [${collectionName}]: Chế độ dùng thử/ngoại tuyến hoạt động.`, error.message);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Generic Firestore Operations with handleFirestoreError
 */
export async function saveDocumentToFirestore<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    await setDoc(doc(db, collectionName, id), data, { merge: true });
  } catch (error) {
    console.warn(`Firestore ghi [${path}] (lưu phiên làm việc):`, error);
  }
}

export async function deleteDocumentFromFirestore(
  collectionName: string,
  id: string
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.warn(`Firestore xóa [${path}] (lưu phiên làm việc):`, error);
  }
}

/**
 * Google Sign In via Firebase Auth
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user is admin (e.g. admin email)
    if (user.email && user.email.toLowerCase().includes('admin')) {
      try {
        await setDoc(doc(db, 'admins', user.uid), {
          email: user.email,
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Admin record check:', e);
      }
    }
    return user;
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  }
}

/**
 * Email/Password Sign In via Firebase Auth
 */
export async function signInWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    // If user not found, attempt to register automatically for demo convenience
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const createResult = await createUserWithEmailAndPassword(auth, email, pass);
        return createResult.user;
      } catch {
        throw error;
      }
    }
    throw error;
  }
}

/**
 * Sign Out from Firebase Auth
 */
export async function signOutFirebase() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out error:', error);
  }
}
