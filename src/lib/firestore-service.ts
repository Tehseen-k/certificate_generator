import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import type { Certificate } from '@/types/certificate';

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
      courseName,
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

    const querySnapshot = await getDocs(q);
    
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
