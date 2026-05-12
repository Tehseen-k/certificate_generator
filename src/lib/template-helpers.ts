/**
 * Create and download a sample Excel template
 */
export function downloadExcelTemplate() {
  const csvContent = `Full Name,Certificate Date
John Doe,2026-05-12
Jane Smith,2026-05-12
Robert Johnson,2026-05-12
Mary Williams,2026-05-12
Michael Brown,2026-05-12`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'certificate_sample_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Create and download a sample TXT template
 */
export function downloadTxtTemplate() {
  const txtContent = `Certificate Template - Names List
=====================================

One name per line:

John Doe
Jane Smith
Robert Johnson
Mary Williams
Michael Brown

OR use Key: Value format:

[Certificate 1]
name: John Doe

[Certificate 2]
name: Jane Smith

[Certificate 3]
name: Robert Johnson`;

  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'certificate_sample_template.txt');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
