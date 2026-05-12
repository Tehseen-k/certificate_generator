import type { CertificateUser } from '@/types/certificate';

/**
 * Name aliases for intelligent field mapping
 * Covers variations of name fields
 */
const NAME_ALIASES = [
  ['name', 'full name', 'fullname', 'fullName', 'full_name', 'name', 'participant name', 'candidatename', 'candidate name'],
  ['first name', 'firstname', 'firstName', 'first_name', 'given name', 'givenname', 'given_name'],
  ['last name', 'lastname', 'lastName', 'last_name', 'surname', 'family name', 'familyname', 'family_name'],
];

/**
 * Normalize a string for comparison
 */
function normalizeField(field: string): string {
  return field
    .toLowerCase()
    .trim()
    .replace(/[\s_-]/g, '')
    .replace(/[^\w]/g, '');
}

/**
 * Find matching field in row based on aliases
 */
function findFieldInRow(row: Record<string, any>, aliases: string[]): string {
  const normalizedAliases = aliases.map(normalizeField);
  const rowKeys = Object.keys(row);

  // First pass: exact match
  for (const key of rowKeys) {
    if (normalizedAliases.includes(normalizeField(key))) {
      return key;
    }
  }

  // Second pass: partial match
  for (const normalizedAlias of normalizedAliases) {
    for (const key of rowKeys) {
      if (normalizeField(key).includes(normalizedAlias) || normalizedAlias.includes(normalizeField(key))) {
        return key;
      }
    }
  }

  return '';
}

/**
 * Extract full name from row
 */
function extractNameFromRow(row: Record<string, any>): string {
  // Try to get full name first
  const fullNameField = findFieldInRow(row, NAME_ALIASES[0]);
  if (fullNameField) {
    const name = String(row[fullNameField] || '').trim();
    if (name) return name;
  }

  // Try first + last name
  const firstNameField = findFieldInRow(row, NAME_ALIASES[1]);
  const lastNameField = findFieldInRow(row, NAME_ALIASES[2]);

  const firstName = firstNameField ? String(row[firstNameField] || '').trim() : '';
  const lastName = lastNameField ? String(row[lastNameField] || '').trim() : '';

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) return firstName;
  if (lastName) return lastName;

  return '';
}

/**
 * Parse Excel file and extract names
 */
export async function parseExcelFile(file: File): Promise<CertificateUser[]> {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer));

  const users: CertificateUser[] = [];
  const sheetNames = workbook.SheetNames;

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length < 2) continue;

    const headers = rows[0] as string[];
    const dataRows = rows.slice(1);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!Array.isArray(row) || row.length === 0) continue;

      const rowObj: Record<string, any> = {};
      for (let j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = row[j];
      }

      const fullName = extractNameFromRow(rowObj);
      if (fullName && fullName.trim().length > 0) {
        users.push({
          id: `user_${Date.now()}_${i}`,
          fullName: fullName.trim(),
        });
      }
    }
  }

  return users;
}

/**
 * Parse text file and extract names
 * Supports formats like:
 * - One name per line
 * - CSV format
 * - [Section] header format with key: value pairs
 */
export async function parseTextFile(file: File): Promise<CertificateUser[]> {
  const text = await file.text();
  const users: CertificateUser[] = [];
  const lines = text.split('\n').filter((line) => line.trim());

  // Check if it's CSV format
  const firstLine = lines[0];
  const hasComma = firstLine.includes(',');

  if (hasComma) {
    // Parse as CSV
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      
      // Try to find name in the values (usually first or second column)
      let fullName = '';
      for (let j = 0; j < values.length; j++) {
        const value = values[j];
        // Check if this looks like a name (has letters, reasonable length)
        if (value && /[a-zA-Z]/.test(value) && value.length < 100) {
          fullName = value;
          break;
        }
      }

      if (fullName) {
        users.push({
          id: `user_${Date.now()}_${i}`,
          fullName: fullName.trim(),
        });
      }
    }
  } else {
    // Parse as one name per line or key: value pairs
    let currentUser: Record<string, string> = {};

    for (const line of lines) {
      if (line.startsWith('[')) {
        // Section header
        if (Object.keys(currentUser).length > 0) {
          const fullName = extractNameFromRow(currentUser);
          if (fullName) {
            users.push({
              id: `user_${Date.now()}_${users.length}`,
              fullName: fullName.trim(),
            });
          }
          currentUser = {};
        }
      } else if (line.includes(':')) {
        // Key: value pair
        const [key, value] = line.split(':').map((s) => s.trim());
        currentUser[key] = value;
      } else {
        // Assume it's a name line
        const fullName = line.trim();
        if (fullName && fullName.length > 0 && /[a-zA-Z]/.test(fullName)) {
          users.push({
            id: `user_${Date.now()}_${users.length}`,
            fullName,
          });
        }
      }
    }

    // Handle last user in key:value format
    if (Object.keys(currentUser).length > 0) {
      const fullName = extractNameFromRow(currentUser);
      if (fullName) {
        users.push({
          id: `user_${Date.now()}_${users.length}`,
          fullName: fullName.trim(),
        });
      }
    }
  }

  return users;
}

/**
 * Parse uploaded file and extract names
 */
export async function parseFile(file: File): Promise<CertificateUser[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcelFile(file);
  } else if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
    return parseTextFile(file);
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}

/**
 * Remove duplicate names from list
 */
export function removeDuplicates(users: CertificateUser[]): CertificateUser[] {
  const seen = new Set<string>();
  return users.filter((user) => {
    const normalized = user.fullName.toLowerCase().trim();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

/**
 * Generate unique certificate number
 */
export function generateCertificateNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${timestamp}-${random}`;
}
