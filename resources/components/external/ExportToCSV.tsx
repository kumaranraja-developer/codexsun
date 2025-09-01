// utils/csvExport.ts
export function exportToCSV<T extends Record<string, any>>(data: T[], headers: string[], filename = "export.csv") {
  const filteredHeaders = headers.filter(h => h.toLowerCase() !== "action");
  const csvHeaders = filteredHeaders.join(",");

  const csvRows = data.map(row =>
    filteredHeaders.map(h => {
      const key = h.toLowerCase();
      const value = row[key] ?? "";
      return `"${value.toString().replace(/"/g, '""')}"`;
    }).join(",")
  );

  const csvContent = [csvHeaders, ...csvRows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
