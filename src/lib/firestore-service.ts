import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import type { Certificate } from '@/types/certificate';
import { withTimeout } from '@/lib/async-timeout';

const PAGE_SIZE_DEFAULT = 20;

function mapCertificate(snapshot: QueryDocumentSnapshot<DocumentData>): Certificate {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Certificate;
}

export type CertificateSearchField = 'all' | 'certificateNumber' | 'userName' | 'courseName' | 'issueDate';

export interface ListCertificatesParams {
  field?: CertificateSearchField;
  search?: string;
  cursorId?: string;
  pageSize?: number;
}

export interface ListCertificatesResult {
  items: Certificate[];
  nextCursorId: string | null;
  hasMore: boolean;
}

function prefixBounds(value: string): { start: string; end: string } {
  return { start: value, end: `${value}\uf8ff` };
}

/**
 * Save a certificate to Firestore only if it does not already exist.
 * Returns whether a new record was created.
 */
export async function saveCertificateIfNotExists(
  certificateNumber: string,
  userName: string,
  courseName: string,
  issueDate: string,
  qrCodeUrl: string
): Promise<{ saved: boolean; docId: string }> {
  const existing = await getCertificateByNumber(certificateNumber);
  if (existing) {
    return { saved: false, docId: existing.id };
  }

  const docId = await saveCertificateToFirestore(
    certificateNumber,
    userName,
    courseName,
    issueDate,
    qrCodeUrl
  );
  return { saved: true, docId };
}

/**
 * Save a certificate to Firestore
 */
export async function saveCertificateToFirestore(
  certificateNumber: string,
  userName: string,
  courseName: string,
  issueDate: string,
  qrCodeUrl: string
): Promise<string> {
  try {
    const certificatesRef = collection(db, 'certificates');
    
    const docRef = await addDoc(certificatesRef, {
      certificateNumber,
      userId: certificateNumber,
      userName,
      userNameLower: userName.trim().toLowerCase(),
      courseName,
      courseNameLower: courseName.trim().toLowerCase(),
      issueDate,
      qrCodeUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: true,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving certificate:', error);
    throw error;
  }
}

/**
 * Get certificate by certificate number
 */
export async function getCertificateByNumber(
  certificateNumber: string
): Promise<Certificate | null> {
  try {
    const q = query(
      collection(db, 'certificates'),
      where('certificateNumber', '==', certificateNumber)
    );

    const querySnapshot = await withTimeout(
      getDocs(q),
      12000,
      'Could not reach Firebase. Check your internet connection and try again.'
    );
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as Certificate;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
}

/**
 * Get all certificates for a user
 */
export async function getCertificatesByUser(userName: string): Promise<Certificate[]> {
  try {
    const q = query(
      collection(db, 'certificates'),
      where('userName', '==', userName)
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Certificate[];
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
}

/**
 * Paginated certificate history using only single-field Firestore queries
 * (no composite indexes). Search/filter uses one field at a time.
 */
export async function listCertificates(
  params: ListCertificatesParams
): Promise<ListCertificatesResult> {
  const pageSize = params.pageSize || PAGE_SIZE_DEFAULT;
  const field: CertificateSearchField = params.field || 'all';
  const search = (params.search || '').trim();
  const certificatesRef = collection(db, 'certificates');
  const constraints: QueryConstraint[] = [];

  if (field === 'certificateNumber' && search) {
    const { start, end } = prefixBounds(search);
    constraints.push(where('certificateNumber', '>=', start));
    constraints.push(where('certificateNumber', '<=', end));
    constraints.push(orderBy('certificateNumber'));
  } else if (field === 'userName' && search) {
    const term = search.toLowerCase();
    const { start, end } = prefixBounds(term);
    constraints.push(where('userNameLower', '>=', start));
    constraints.push(where('userNameLower', '<=', end));
    constraints.push(orderBy('userNameLower'));
  } else if (field === 'courseName' && search) {
    const term = search.toLowerCase();
    const { start, end } = prefixBounds(term);
    constraints.push(where('courseNameLower', '>=', start));
    constraints.push(where('courseNameLower', '<=', end));
    constraints.push(orderBy('courseNameLower'));
  } else if (field === 'issueDate' && search) {
    constraints.push(where('issueDate', '==', search));
    constraints.push(orderBy('issueDate'));
  } else {
    constraints.push(orderBy('createdAt', 'desc'));
  }

  if (params.cursorId) {
    const cursorSnap = await getDoc(doc(db, 'certificates', params.cursorId));
    if (cursorSnap.exists()) {
      constraints.push(startAfter(cursorSnap));
    }
  }

  constraints.push(limit(pageSize + 1));

  let snapshot = await withTimeout(
    getDocs(query(certificatesRef, ...constraints)),
    12000,
    'Could not reach Firebase. Check your internet connection and try again.'
  );

  if (
    snapshot.empty &&
    !params.cursorId &&
    search &&
    (field === 'userName' || field === 'courseName')
  ) {
    const firestoreField = field === 'userName' ? 'userName' : 'courseName';
    const { start, end } = prefixBounds(search);
    snapshot = await withTimeout(
      getDocs(
        query(
          certificatesRef,
          where(firestoreField, '>=', start),
          where(firestoreField, '<=', end),
          orderBy(firestoreField),
          limit(pageSize + 1)
        )
      ),
      12000,
      'Could not reach Firebase. Check your internet connection and try again.'
    );
  }

  const docs = snapshot.docs;
  const hasMore = docs.length > pageSize;
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const last = pageDocs[pageDocs.length - 1];

  return {
    items: pageDocs.map(mapCertificate),
    nextCursorId: hasMore && last ? last.id : null,
    hasMore,
  };
}

/**
 * Verify a certificate
 */
export async function verifyCertificate(certificateNumber: string): Promise<boolean> {
  try {
    const cert = await getCertificateByNumber(certificateNumber);
    return cert !== null && cert.verified === true;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return false;
  }
}
