import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Importante: Importar o DialogClose para criar nosso botão X
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calculator, Target, X } from "lucide-react"; // Importar ícone X
import { PremiumCard } from "../cards/PremiumCard";

interface MarkupModalProps {
  costPrice: number;
  taxRate: number;
  gatewayRate: number;
  gatewayFixed: number;
  checkoutFee: number;
  iofRate: number;
  discount: number;
}

const useCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export function MarkupModal({
  costPrice,
  taxRate,
  gatewayRate,
  gatewayFixed,
  checkoutFee,
  iofRate,
  discount,
}: MarkupModalProps) {
  
  const scenarios = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 border-dashed border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground gap-2 transition-all"
        >
            <Target size={14} />
            Não sabe o preço? Simular Markup
        </Button>
      </DialogTrigger>

      {/* [&>button]:hidden -> ISSO REMOVE O 'X' PADRÃO DESLOCADO DO SHADCN 
          bg-transparent -> Remove o fundo padrão para usarmos o nosso PremiumCard
      */}
      <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none text-foreground [&>button]:hidden">
        
        <PremiumCard className="w-full">
            <div className="p-6 relative">
                
                {/* NOSSO BOTÃO DE FECHAR PERSONALIZADO (NO LUGAR CERTO) */}
                <DialogClose className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                    <X size={18} />
                </DialogClose>

                <DialogHeader className="mb-6 pr-8"> {/* pr-8 para o texto não bater no X */}
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="relative flex items-center justify-center">
                            <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
                                <div className="p-1.5 rounded-full bg-blue-600 text-white shadow-sm flex items-center justify-center">
                                    <Calculator size={18} strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>
                        <span className="text-gray-900 dark:text-white">Simulador de Cenários</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                        Veja como diferentes Markups afetam seu Lucro e seu limite de CPA no Facebook Ads.
                    </DialogDescription>
                </DialogHeader>

                <div className="border border-gray-200 dark:border-white/5 rounded-lg overflow-hidden bg-gray-50/50 dark:bg-black/20">
                    {/* CSS Inline para esconder scrollbar mas permitir scroll */}
                    <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <Table>
                        <TableHeader className="bg-gray-100/50 dark:bg-white/[0.02]">
                            <TableRow className="hover:bg-transparent border-gray-200 dark:border-white/5 text-xs uppercase tracking-wider">
                                <TableHead className="text-center font-bold text-muted-foreground w-[80px]">Markup</TableHead>
                                <TableHead className="text-right font-bold text-gray-900 dark:text-white">Preço Venda</TableHead>
                                <TableHead className="text-right text-muted-foreground">Custos Totais</TableHead>
                                <TableHead className="text-right font-bold text-emerald-600 dark:text-emerald-500">Lucro Líq.</TableHead>
                                <TableHead className="text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/5">CPA Teto</TableHead>
                                <TableHead className="text-right text-muted-foreground">Margem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scenarios.map((markup) => {
                            const suggestedPrice = costPrice * markup;
                            const taxPercent = (taxRate + gatewayRate + checkoutFee) / 100;
                            
                            const taxValue = suggestedPrice * taxPercent;
                            const iofValue = costPrice * (iofRate / 100);
                            const totalFees = taxValue + gatewayFixed + iofValue + discount;
                            
                            const grossProfit = suggestedPrice - costPrice - totalFees;
                            const maxCPA = grossProfit; 
                            const margin = suggestedPrice > 0 ? (grossProfit / suggestedPrice) * 100 : 0;

                            return (
                                <TableRow
                                key={markup}
                                className="hover:bg-gray-100 dark:hover:bg-white/5 border-b border-gray-200 dark:border-white/5 last:border-0 transition-colors text-sm"
                                >
                                <TableCell className="text-center font-bold bg-gray-50 dark:bg-white/5 text-muted-foreground">
                                    {markup.toFixed(1)}x
                                </TableCell>
                                <TableCell className="text-right font-bold text-gray-900 dark:text-white">
                                    {useCurrency(suggestedPrice)}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-xs">
                                    - {useCurrency(totalFees + costPrice)}
                                </TableCell>
                                <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-500">
                                    {useCurrency(grossProfit)}
                                </TableCell>
                                <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/5">
                                    {useCurrency(maxCPA)}
                                </TableCell>
                                <TableCell className="text-right text-xs text-muted-foreground">
                                    {margin.toFixed(1)}%
                                </TableCell>
                                </TableRow>
                            );
                            })}
                        </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </PremiumCard>
      </DialogContent>
    </Dialog>
  );
}