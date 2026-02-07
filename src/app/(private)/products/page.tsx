import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, ArrowUpDown, MoreHorizontal, RefreshCw, Search } from "lucide-react";
import Image from "next/image";

// --- DADOS FALSOS (MOCK) ---
// Simulam o que virá do Banco de Dados + API do ML
const MOCK_PRODUCTS = [
  {
    id: "MLB123456",
    image: "https://http2.mlstatic.com/D_NQ_NP_606760-MLB49392230678_032022-O.webp", // Link real do ML para teste
    title: "Relógio Smartwatch D20 Bluetooth Monitor Cardíaco",
    status: "active", // active, paused
    stock: 154,
    salePrice: 89.90,
    costPrice: 35.00, // Custo do Produto (CMV)
    taxML: 16.00,     // Taxa do ML
    shipping: 0.00,   // Frete por conta do comprador
  },
  {
    id: "MLB987654",
    image: "https://http2.mlstatic.com/D_NQ_NP_796578-MLB52244976450_112022-O.webp",
    title: "Fone de Ouvido Bluetooth Sem Fio TWS i12 Touch",
    status: "paused",
    stock: 0,
    salePrice: 45.00,
    costPrice: 28.00,
    taxML: 11.50,
    shipping: 18.90, // Frete Grátis (Vendedor pagou) -> Prejuízo provável!
  },
  {
    id: "MLB555666",
    title: "Kit 5 Camisetas Básicas Algodão Premium",
    image: "https://http2.mlstatic.com/D_NQ_NP_638053-MLB48842666795_012022-O.webp",
    status: "active",
    stock: 50,
    salePrice: 149.90,
    costPrice: 60.00,
    taxML: 28.00,
    shipping: 22.90,
  }
];

// Função auxiliar para formatar dinheiro
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* 1. Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos, custos e margens de lucro.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar
          </Button>
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* 2. Cards de Resumo Rápido (Opcional, mas fica bonito) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_PRODUCTS.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {MOCK_PRODUCTS.reduce((acc, p) => acc + p.stock, 0)} itens
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos sem Custo</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">0</div>
            <p className="text-xs text-muted-foreground">Todos precificados</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. A Tabela Principal */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagem</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Venda</TableHead>
              <TableHead className="text-right text-muted-foreground">Custo (CMV)</TableHead>
              <TableHead className="text-right text-muted-foreground">Taxas</TableHead>
              <TableHead className="text-right">Lucro Líq.</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PRODUCTS.map((product) => {
              // Cálculo de Lucro em Tempo Real
              const totalCost = product.costPrice + product.taxML + product.shipping;
              const profit = product.salePrice - totalCost;
              const margin = (profit / product.salePrice) * 100;
              const isProfitPositive = profit > 0;

              return (
                <TableRow key={product.id}>
                  {/* Imagem */}
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                         {/* Usando img normal por enquanto para facilitar testar URLs externas */}
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img 
                            src={product.image} 
                            alt={product.title} 
                            className="object-cover h-full w-full"
                         />
                    </div>
                  </TableCell>
                  
                  {/* Título e SKU */}
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium line-clamp-1">{product.title}</span>
                        <span className="text-xs text-muted-foreground">{product.id} • Estoque: {product.stock}</span>
                    </div>
                  </TableCell>

                  {/* Preço Venda */}
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.salePrice)}
                  </TableCell>

                  {/* Custo */}
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(product.costPrice)}
                  </TableCell>

                  {/* Taxas (Soma ML + Frete) */}
                  <TableCell className="text-right text-muted-foreground text-xs">
                    <div className="flex flex-col">
                        <span>{formatCurrency(product.taxML)} (Taxa)</span>
                        {product.shipping > 0 && <span>+ {formatCurrency(product.shipping)} (Frete)</span>}
                    </div>
                  </TableCell>

                  {/* Lucro (A Mágica) */}
                  <TableCell className="text-right">
                    <div className={`flex flex-col ${isProfitPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span className="font-bold">{formatCurrency(profit)}</span>
                        <span className="text-xs">{margin.toFixed(1)}%</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status === "active" ? "Ativo" : "Pausado"}
                    </Badge>
                  </TableCell>

                  {/* Ações */}
                  <TableCell>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}