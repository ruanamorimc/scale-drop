// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  // 1. Extrair os cabeçalhos (chaves do primeiro objeto)
  const headers = Object.keys(data[0]);

  // 2. Criar as linhas do CSV
  const rows = data.map(row =>
    headers
      .map(fieldName => {
        // Tratamento para aspas e vírgulas dentro do conteúdo
        let cellData = row[fieldName] === null || row[fieldName] === undefined ? "" : String(row[fieldName]);
        cellData = cellData.replace(/"/g, '""'); // Escapar aspas duplas
        return `"${cellData}"`; // Envolver tudo em aspas
      })
      .join(",")
  );

  // 3. Juntar tudo (Adiciona BOM \uFEFF para Excel abrir UTF-8 corretamente)
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");

  // 4. Criar o Blob e o link de download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  
  // 5. Clicar e limpar
  link.click();
  document.body.removeChild(link);
}