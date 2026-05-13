/**
 * Download a real .xlsx workbook (uses the same `xlsx` package as upload parsing).
 */
export async function downloadExcelTemplate(): Promise<void> {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  const participants = [
    ['Participant full name', 'Course name', 'Issue date (YYYY-MM-DD)'],
    ['John Doe', 'IOSH Managing Safely', '2026-05-13'],
    ['Jane Smith', 'IOSH Working Safely', '2026-05-13'],
    ['Robert Johnson', 'IOSH Managing Safely', '2026-06-01'],
    ['Mary Williams', 'IOSH Risk Assessment', '2026-06-15'],
    ['Michael Brown', 'IOSH Managing Safely', '2026-05-13'],
  ];

  const wsParticipants = XLSX.utils.aoa_to_sheet(participants);
  wsParticipants['!cols'] = [{ wch: 28 }, { wch: 42 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsParticipants, 'Participants');

  const help = [
    ['Column guide (headers are matched loosely — spaces and case ignored)'],
    [''],
    ['Participant full name — REQUIRED. Also accepted: Name, Full Name, Candidate Name, Student Name, or separate First Name + Last Name columns.'],
    ['Course name — OPTIONAL. Examples: Course Name, Course, Training Course, Programme Name, Module Name, Course Title, Class Name…'],
    [
      'Issue date — OPTIONAL (YYYY-MM-DD). Examples: Certificate Date, Issued Date, Award Date, Completion Date… Excel numeric date cells convert automatically.',
    ],
    [''],
    ['Extra columns are ignored if the name / course / date columns are still recognizable.'],
    ['Delete the sample rows and add your own. Keep row 1 as the header.'],
  ];

  const wsHelp = XLSX.utils.aoa_to_sheet(help);
  wsHelp['!cols'] = [{ wch: 110 }];
  XLSX.utils.book_append_sheet(wb, wsHelp, 'How parsing works');

  XLSX.writeFile(wb, 'certificate_participants_template.xlsx');
}

/**
 * Plain-text template: start with machine-readable rows, then human notes.
 * (The parser uses the first non-comment line that contains , or tab or | as the header row.)
 */
export function downloadTxtTemplate() {
  const txtContent = `Participant full name,Course name,Issue date (YYYY-MM-DD)
John Doe,IOSH Managing Safely,2026-05-13
Jane Smith,IOSH Working Safely,2026-06-01
Robert Johnson,IOSH Managing Safely,2026-06-15

---
NOTES — free-form text below this line is NOT imported when you use the comma/tab/pipe table above.

Put all participant rows BEFORE the --- line. To use Tab or Pipe instead of commas, replace commas with Tab or | in those rows only (keep one delimiter type per file).

Examples (create your own file — do not paste these bullets into the data section):
- CSV row: Name, Course, 2026-05-13
- TSV row: same three fields separated by Tab
- Pipe row: Name | Course | 2026-05-13

Do not mix comma, tab, and pipe in the same table.

More header names that map to COURSE (partial match):
Course • Training course • Programme / Program name • Module name • Class name • Course title • Qualification

More header names that map to DATE:
Issue date • Issued date • Certificate date • Award date • Completion date • Course date • Training date

Key : value blocks (alternative format — repeat per person):

[certificate — person 1]
Full name: John Doe
Course name: IOSH Managing Safely
Issue date: 2026-05-13

[certificate — person 2]
name: Jane Smith
course: IOSH Working Safely
certificate date: 2026-06-01

Simple list (no course or date — app defaults apply):
Alex Moore
Taylor Singh
`;

  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'certificate_participants_template.txt');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
