import type { CertificateUser } from '@/types/certificate';

/**
 * Name aliases for intelligent field mapping
 * Covers variations of name fields
 */
const NAME_ALIASES = [
  [
    'name',
    'full name',
    'fullname',
    'fullName',
    'full_name',
    'participant name',
    'participant full name',
    'student name',
    'candidatename',
    'candidate name',
  ],
  ['first name', 'firstname', 'firstName', 'first_name', 'given name', 'givenname', 'given_name'],
  ['last name', 'lastname', 'lastName', 'last_name', 'surname', 'family name', 'familyname', 'family_name'],
];

const COURSE_ALIASES = [
  'course',
  'course name',
  'coursename',
  'training',
  'training name',
  'training course',
  'participant course',
  'program',
  'program name',
  'programme',
  'programme name',
  'qualification',
  'course title',
  'module',
  'module name',
  'class name',
];

const ISSUE_DATE_ALIASES = [
  'issue date',
  'issued date',
  'certificate date',
  'award date',
  'completion date',
  'training date',
  'course date',
];

function excelSerialToIsoDate(serial: number): string {
  const utcMs = Math.round((serial - 25569) * 86400 * 1000);
  const d = new Date(utcMs);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function extractIssueDateFromRow(row: Record<string, any>): string {
  const key = findFieldInRow(row, ISSUE_DATE_ALIASES);
  if (!key) return '';
  const raw = row[key];
  if (raw == null || raw === '') return '';
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (raw > 20000 && raw < 120000) {
      return excelSerialToIsoDate(raw);
    }
  }
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return '';
}

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

function extractCourseFromRow(row: Record<string, any>): string {
  const courseField = findFieldInRow(row, COURSE_ALIASES);
  if (!courseField) return '';
  return String(row[courseField] || '').trim();
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
    if (/how\s*parsing|instructions|readme|help/i.test(sheetName)) {
      continue;
    }
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length < 2) continue;

    const headers = rows[0] as string[];
    const dataRows = rows.slice(1);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!Array.isArray(row) || row.length === 0) continue;

      const firstCell = row[0];
      if (
        typeof firstCell === 'string' &&
        /column guide|how parsing|^\s*tips?\b/i.test(firstCell.trim())
      ) {
        continue;
      }

      const rowObj: Record<string, any> = {};
      for (let j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = row[j];
      }

      const fullName = extractNameFromRow(rowObj);
      const courseName = extractCourseFromRow(rowObj);
      const issueDateOverride = extractIssueDateFromRow(rowObj);
      if (fullName && fullName.trim().length > 0) {
        users.push({
          id: `user_${Date.now()}_${i}`,
          fullName: fullName.trim(),
          courseName: courseName || undefined,
          issueDateOverride: issueDateOverride || undefined,
        });
      }
    }
  }

  return users;
}

/**
 * Skip decorative / documentation lines (template tutorials, bullets, etc.)
 */
function isNoiseInstructionLine(line: string): boolean {
  const t = line.trim();
  const lower = t.toLowerCase();
  if (/^[•\u2022\u25cf\u25cb\-–—]\s/.test(t)) return true;
  if (/comma\s*\(\s*csv\s*\)/i.test(t)) return true;
  if (/tab\s*\(\s*tsv\s*\)/i.test(t)) return true;
  if (/^\s*pipe\s*[—\-–]/i.test(t)) return true;
  if (/full\s*name\s*\|\s*course\s*name/i.test(t)) return true;
  if (lower.startsWith('notes') && lower.includes('parser')) return true;
  if (lower.includes('do not mix')) return true;
  if (lower.includes('more header names')) return true;
  if (lower.includes('map to course') || lower.includes('map to date')) return true;
  if (lower.startsWith('you can also')) return true;
  if (lower.includes('optional reference')) return true;
  if (/delimiter/i.test(t) && lower.includes('same')) return true;
  return false;
}

function linesBeforeNotesSeparator(lines: string[]): string[] {
  const idx = lines.findIndex((l) => /^---+$/u.test(l.trim()));
  if (idx === -1) return lines;
  return lines.slice(0, idx);
}

/**
 * Check if a line is likely a header or metadata (not a CSV column header row)
 */
function isHeaderLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  const hasTabularColumns = line.includes(',') || line.includes('\t') || /\|/.test(line);

  return (
    lowerLine.includes('template') ||
    lowerLine.includes('names list') ||
    (lowerLine.includes('participant') && lowerLine.includes('list') && !hasTabularColumns) ||
    lowerLine.includes('generated') ||
    (!hasTabularColumns &&
      lowerLine.includes('date') &&
      lowerLine.includes('issue') &&
      line.length < 80) ||
    lowerLine.startsWith('===') ||
    lowerLine.startsWith('***') ||
    Boolean(lowerLine.match(/^={3,}/)) ||
    Boolean(lowerLine.match(/^-{3,}/)) ||
    (!hasTabularColumns &&
      lowerLine.includes('name') &&
      lowerLine.includes('date') &&
      line.length < 50)
  );
}

/**
 * Parse text file and extract names
 * Supports formats like:
 * - One name per line
 * - CSV format
 * - [Section] header format with key: value pairs
 */
function detectDelimiter(line: string): string | null {
  if (line.includes('\t')) return '\t';
  if (line.includes('|')) return '|';
  if (line.includes(',')) return ',';
  if (line.includes(':')) return ':';
  return null;
}

/**
 * Delimited table: only the section before `---` (so tutorial text after --- is never parsed as data).
 */
function parseDelimitedTableSection(lines: string[]): CertificateUser[] {
  const users: CertificateUser[] = [];
  const dataLines = linesBeforeNotesSeparator(lines);
  if (dataLines.length === 0) return users;

  const firstDelimited = dataLines.find((l) => {
    if (isNoiseInstructionLine(l) || isHeaderLine(l)) return false;
    return detectDelimiter(l) !== null;
  });
  if (!firstDelimited) return users;

  const delim = detectDelimiter(firstDelimited);
  if (!delim) return users;

  const headerValues = firstDelimited.split(delim).map((v) => v.trim());
  const hasHeaderRow =
    headerValues.some((h) =>
      NAME_ALIASES.flat().some((alias) => normalizeField(h).includes(normalizeField(alias)))
    ) ||
    headerValues.some((h) => COURSE_ALIASES.some((alias) => normalizeField(h).includes(normalizeField(alias)))) ||
    headerValues.some((h) => ISSUE_DATE_ALIASES.some((alias) => normalizeField(h).includes(normalizeField(alias))));

  const startIdx = hasHeaderRow ? dataLines.indexOf(firstDelimited) + 1 : dataLines.indexOf(firstDelimited);

  for (let i = startIdx; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (isNoiseInstructionLine(line) || isHeaderLine(line)) continue;
    if (!detectDelimiter(line)) continue;

    const values = line.split(delim).map((v) => v.trim());
    if (values.join('').length === 0) continue;

    let fullName = '';
    let courseName = '';
    let issueDateOverride = '';

    if (hasHeaderRow) {
      const rowObj: Record<string, string> = {};
      for (let j = 0; j < headerValues.length; j++) {
        rowObj[headerValues[j]] = values[j] || '';
      }
      fullName = extractNameFromRow(rowObj);
      courseName = extractCourseFromRow(rowObj);
      issueDateOverride = extractIssueDateFromRow(rowObj);
    } else {
      for (let j = 0; j < values.length; j++) {
        const value = values[j];
        if (value && /[a-zA-Z]/.test(value) && value.length < 100 && !isHeaderLine(value)) {
          if (!fullName) {
            fullName = value;
            continue;
          }
          if (!courseName) {
            courseName = value;
          }
        }
      }
    }

    if (fullName && !isNoiseInstructionLine(fullName)) {
      users.push({
        id: `user_${Date.now()}_${i}`,
        fullName: fullName.trim(),
        courseName: courseName || undefined,
        issueDateOverride: issueDateOverride || undefined,
      });
    }
  }

  return users;
}

function parseLooseLines(lines: string[]): CertificateUser[] {
  const users: CertificateUser[] = [];
  let currentUser: Record<string, string> = {};

  for (const line of lines) {
    if (isNoiseInstructionLine(line)) continue;
    if (isHeaderLine(line)) continue;

    if (line.trim().startsWith('[')) {
      if (Object.keys(currentUser).length > 0) {
        const fullName = extractNameFromRow(currentUser);
        if (fullName) {
          users.push({
            id: `user_${Date.now()}_${users.length}`,
            fullName: fullName.trim(),
            courseName: extractCourseFromRow(currentUser) || undefined,
            issueDateOverride: extractIssueDateFromRow(currentUser) || undefined,
          });
        }
        currentUser = {};
      }
      continue;
    }

    if (line.includes(':')) {
      const [key, ...rest] = line.split(':');
      const value = rest.join(':').trim();
      if (value && !isHeaderLine(value)) {
        currentUser[key.trim()] = value;
      }
      continue;
    }

    const fullName = line.trim();
    if (fullName.length > 0 && /[a-zA-Z]/.test(fullName) && fullName.length < 120) {
      users.push({
        id: `user_${Date.now()}_${users.length}`,
        fullName,
      });
    }
  }

  if (Object.keys(currentUser).length > 0) {
    const fullName = extractNameFromRow(currentUser);
    if (fullName) {
      users.push({
        id: `user_${Date.now()}_${users.length}`,
        fullName: fullName.trim(),
        courseName: extractCourseFromRow(currentUser) || undefined,
        issueDateOverride: extractIssueDateFromRow(currentUser) || undefined,
      });
    }
  }

  return users;
}

/**
 * Parse text content and extract names
 */
export function parseTextContent(text: string): CertificateUser[] {
  const lines = text.split('\n').map((line) => line.replace(/\r$/, '')).filter((line) => line.trim());

  const delimited = parseDelimitedTableSection(lines);
  if (delimited.length > 0) {
    return delimited;
  }

  const hasNotesBreak = lines.some((l) => /^---+$/u.test(l.trim()));
  const looseSource = hasNotesBreak ? linesBeforeNotesSeparator(lines) : lines;
  return parseLooseLines(looseSource);
}

export async function parseTextFile(file: File): Promise<CertificateUser[]> {
  const text = await file.text();
  return parseTextContent(text);
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

function randomDigits(length: number): string {
  let out = '';
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint32Array(length);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < length; i++) out += String(buf[i] % 10);
    return out;
  }
  for (let i = 0; i < length; i++) out += String(Math.floor(Math.random() * 10));
  return out;
}

function randomSuffix(len: number): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let out = '';
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint32Array(len);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
    return out;
  }
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * IOSH-style compact number (e.g. 66839347-01-6MGJ): 8 digits – 2 digits – 4 alphanumerics
 */
export function generateCertificateNumber(): string {
  const partA = randomDigits(8);
  const partB = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
  const partC = randomSuffix(4);
  return `${partA}-${partB}-${partC}`;
}
