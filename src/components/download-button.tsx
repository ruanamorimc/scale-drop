// src/components/ui/download-button.tsx
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/export-to-csv";

interface DownloadButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  filename?: string;
  label?: string;
}

export function DownloadButton({ 
  data, 
  filename = "exportacao.csv", 
  label = "Exportar CSV" 
}: DownloadButtonProps) {
  
  const handleDownload = () => {
    exportToCSV(data, filename);
  };

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="mr-2 h-4 w-4" /> {label}
    </Button>
  );
}