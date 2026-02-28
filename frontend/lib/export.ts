/**
 * Data export utilities — CSV and PDF generation (client-side, no external deps).
 */

/* ------------------------------------------------------------------ */
/*  CSV Export                                                         */
/* ------------------------------------------------------------------ */

/**
 * Convert an array of objects to a CSV string and trigger a download.
 * @param data    Array of objects (each object = one row).
 * @param filename  File name (without extension).
 * @param columns Optional ordered list of column keys. Defaults to all keys from the first object.
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: (keyof T)[],
): void {
  if (!data.length) return;

  const keys = (columns ?? Object.keys(data[0])) as string[];

  const header = keys.map(escapeCSV).join(",");
  const rows = data.map((row) =>
    keys.map((k) => escapeCSV(String(row[k] ?? ""))).join(","),
  );

  const csv = [header, ...rows].join("\n");
  downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/* ------------------------------------------------------------------ */
/*  PDF Export (HTML → print)                                          */
/* ------------------------------------------------------------------ */

/**
 * Generate a simple PDF by opening a styled HTML document in a print dialog.
 * This avoids any third-party PDF library while producing clean output.
 *
 * @param title   Document title.
 * @param html    Inner HTML content (tables, paragraphs, etc.).
 */
export function exportToPDF(title: string, html: string): void {
  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #1a1a1a; }
    h1 { font-size: 22px; margin-bottom: 8px; }
    h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-yellow { background: #fef9c3; color: #854d0e; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Generated on ${new Date().toLocaleString()} &mdash; Annadata OS</div>
  ${html}
</body>
</html>`);

  win.document.close();
  // Small delay to let styles render before triggering print
  setTimeout(() => {
    win.print();
  }, 300);
}

/* ------------------------------------------------------------------ */
/*  Table HTML helper                                                  */
/* ------------------------------------------------------------------ */

/**
 * Build a simple HTML table from data — useful for PDF export content.
 */
export function tableToHTML<T extends Record<string, unknown>>(
  data: T[],
  columns?: { key: keyof T; label: string }[],
): string {
  if (!data.length) return "<p>No data available.</p>";

  const cols =
    columns ??
    Object.keys(data[0]).map((k) => ({ key: k as keyof T, label: k as string }));

  const headerRow = cols.map((c) => `<th>${c.label}</th>`).join("");
  const bodyRows = data
    .map(
      (row) =>
        `<tr>${cols.map((c) => `<td>${String(row[c.key] ?? "")}</td>`).join("")}</tr>`,
    )
    .join("\n");

  return `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

function downloadBlob(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
