import { fetchWithTimeout } from '@/lib/async-timeout';
import { firebaseConfig } from '@/lib/firebase-config';
import type { Certificate } from '@/types/certificate';
import type { CertificateSearchField, ListCertificatesParams, ListCertificatesResult } from '@/lib/firestore-service';

type FirestoreValue = {
  stringValue?: string;
  booleanValue?: boolean;
  timestampValue?: string;
  integerValue?: string;
};

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
};

function documentsUrl(collectionId: string, documentId?: string): string {
  const base = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
  const path = documentId ? `${base}/${collectionId}/${encodeURIComponent(documentId)}` : `${base}/${collectionId}`;
  return `${path}?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
}

function runQueryUrl(): string {
  return `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents:runQuery?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
}

function documentIdFromName(name = ''): string {
  return name.split('/').pop() || '';
}

function stringField(fields: Record<string, FirestoreValue> | undefined, key: string): string {
  return fields?.[key]?.stringValue || '';
}

function dateField(fields: Record<string, FirestoreValue> | undefined, key: string): Date {
  const value = fields?.[key]?.timestampValue;
  return value ? new Date(value) : new Date(0);
}

export async function restGetDocument(collectionId: string, documentId: string): Promise<FirestoreDocument | null> {
  const response = await fetchWithTimeout(documentsUrl(collectionId, documentId), {
    method: 'GET',
    timeoutMs: 8000,
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body?.error?.message || `Firestore read failed (${response.status}).`;
    throw new Error(message);
  }
  return response.json();
}

export async function restSetDocument(
  collectionId: string,
  documentId: string,
  fields: Record<string, FirestoreValue>
): Promise<void> {
  const response = await fetchWithTimeout(documentsUrl(collectionId, documentId), {
    method: 'PATCH',
    timeoutMs: 8000,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Firestore write failed (${response.status}): ${text.slice(0, 200)}`);
  }
}

function fieldRef(fieldPath: string) {
  return { fieldPath };
}

function stringValue(value: string) {
  return { stringValue: value };
}

function toCertificate(document: FirestoreDocument): Certificate {
  const fields = document.fields || {};
  return {
    id: documentIdFromName(document.name),
    certificateNumber: stringField(fields, 'certificateNumber'),
    userId: stringField(fields, 'userId') || stringField(fields, 'certificateNumber'),
    userName: stringField(fields, 'userName'),
    courseName: stringField(fields, 'courseName'),
    issueDate: stringField(fields, 'issueDate'),
    qrCodeUrl: stringField(fields, 'qrCodeUrl'),
    verified: fields.verified?.booleanValue ?? true,
    createdAt: dateField(fields, 'createdAt'),
    updatedAt: dateField(fields, 'updatedAt'),
  };
}

function matchesContains(item: Certificate, field: CertificateSearchField, term: string): boolean {
  const needle = term.toLowerCase();
  if (field === 'certificateNumber') return item.certificateNumber.toLowerCase().includes(needle);
  if (field === 'userName') return item.userName.toLowerCase().includes(needle);
  if (field === 'courseName') return item.courseName.toLowerCase().includes(needle);
  if (field === 'issueDate') return item.issueDate.toLowerCase().includes(needle);
  return (
    item.certificateNumber.toLowerCase().includes(needle) ||
    item.userName.toLowerCase().includes(needle) ||
    item.courseName.toLowerCase().includes(needle) ||
    item.issueDate.toLowerCase().includes(needle)
  );
}

async function queryCertificates(
  structuredQuery: Record<string, unknown>
): Promise<FirestoreDocument[]> {
  const response = await fetchWithTimeout(runQueryUrl(), {
    method: 'POST',
    timeoutMs: 20000,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Firestore query failed (${response.status}): ${text.slice(0, 200)}`);
  }
  const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return rows.map((row) => row.document).filter((doc): doc is FirestoreDocument => Boolean(doc?.name));
}

async function queryByCreatedAt(
  limit: number,
  startAfterDoc?: FirestoreDocument | null
): Promise<FirestoreDocument[]> {
  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: 'certificates' }],
    limit,
    orderBy: [{ field: fieldRef('createdAt'), direction: 'DESCENDING' }],
  };
  if (startAfterDoc?.fields?.createdAt) {
    structuredQuery.startAt = {
      before: false,
      values: [startAfterDoc.fields.createdAt],
    };
  }
  return queryCertificates(structuredQuery);
}

const CONTAINS_BATCH = 250;
const CONTAINS_MAX_SCAN = 1000;

export async function restListCertificates(
  params: ListCertificatesParams
): Promise<ListCertificatesResult> {
  const pageSize = params.pageSize || 20;
  const field: CertificateSearchField = params.field || 'all';
  const search = (params.search || '').trim();
  const useContains = Boolean(search) && field !== 'issueDate';

  if (field === 'issueDate' && search) {
    const structuredQuery: Record<string, unknown> = {
      from: [{ collectionId: 'certificates' }],
      limit: pageSize + 1,
      where: {
        fieldFilter: {
          field: fieldRef('issueDate'),
          op: 'EQUAL',
          value: stringValue(search),
        },
      },
      orderBy: [{ field: fieldRef('issueDate'), direction: 'ASCENDING' }],
    };
    if (params.cursorId) {
      const cursorDoc = await restGetDocument('certificates', params.cursorId);
      if (cursorDoc?.fields?.issueDate) {
        structuredQuery.startAt = { before: false, values: [cursorDoc.fields.issueDate] };
      }
    }
    const documents = await queryCertificates(structuredQuery);
    const hasMore = documents.length > pageSize;
    const pageDocs = hasMore ? documents.slice(0, pageSize) : documents;
    const last = pageDocs[pageDocs.length - 1];
    return {
      items: pageDocs.map(toCertificate),
      nextCursorId: hasMore && last ? documentIdFromName(last.name) : null,
      hasMore,
    };
  }

  if (useContains) {
    let cursorDoc = params.cursorId ? await restGetDocument('certificates', params.cursorId) : null;
    const matches: Certificate[] = [];
    let scanned = 0;

    while (scanned < CONTAINS_MAX_SCAN && matches.length <= pageSize) {
      const documents = await queryByCreatedAt(CONTAINS_BATCH, cursorDoc);
      if (documents.length === 0) break;
      scanned += documents.length;
      cursorDoc = documents[documents.length - 1];

      for (const document of documents) {
        const item = toCertificate(document);
        if (!matchesContains(item, field, search)) continue;
        matches.push(item);
        if (matches.length > pageSize) break;
      }

      if (documents.length < CONTAINS_BATCH) break;
    }

    const hasMore = matches.length > pageSize;
    const pageItems = hasMore ? matches.slice(0, pageSize) : matches;
    const last = pageItems[pageItems.length - 1];
    return {
      items: pageItems,
      nextCursorId: hasMore && last ? last.id : null,
      hasMore,
    };
  }

  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: 'certificates' }],
    limit: pageSize + 1,
    orderBy: [{ field: fieldRef('createdAt'), direction: 'DESCENDING' }],
  };
  if (params.cursorId) {
    const cursorDoc = await restGetDocument('certificates', params.cursorId);
    if (cursorDoc?.fields?.createdAt) {
      structuredQuery.startAt = { before: false, values: [cursorDoc.fields.createdAt] };
    }
  }
  const documents = await queryCertificates(structuredQuery);
  const hasMore = documents.length > pageSize;
  const pageDocs = hasMore ? documents.slice(0, pageSize) : documents;
  const last = pageDocs[pageDocs.length - 1];
  return {
    items: pageDocs.map(toCertificate),
    nextCursorId: hasMore && last ? documentIdFromName(last.name) : null,
    hasMore,
  };
}
