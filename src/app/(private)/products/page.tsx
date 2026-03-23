"use client";

import { useState, useEffect, useMemo } from "react";

import { columns, Product } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { ProductEditSheet } from "@/components/products/ProductEditSheet";

import { Fee } from "@/app/(private)/finance/fees/columns";
import { Tax } from "@/app/(private)/finance/taxes/columns";
import { getFees } from "@/actions/fees";
import { getTaxes } from "@/actions/taxes";

import { Button } from "@/components/ui/button";
import { DownloadButton } from "@/components/download-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Store,
  Tag,
  Activity,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// 👇 IMPORTANDO AS ACTIONS REAIS DO BACKEND
import {
  getProducts,
  saveProduct,
  deleteProduct,
  generateTestProducts,
} from "@/actions/products";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  // --- ESTADOS ---
  const [data, setData] = useState<Product[]>([]); // Começa vazio
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

  // Estados de Edição/Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Estados de Delete
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // Estados de Filtro
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");

  // Novos estados para guardar as regras fiscais
  const [globalFees, setGlobalFees] = useState<Fee[]>([]);
  const [globalTaxes, setGlobalTaxes] = useState<Tax[]>([]);

  // Atualize o loadData para buscar tudo junto
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Busca tudo de uma vez (Paralelo = Mais rápido)
      const [productsData, feesData, taxesData] = await Promise.all([
        getProducts(),
        getFees(),
        getTaxes(),
      ]);

      // O compilador pode reclamar se o tipo do getProducts não bater exato,
      // mas vamos garantir que ele aceite
      setData(productsData);
      setGlobalFees(feesData as Fee[]);
      setGlobalTaxes(taxesData as Tax[]);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🧠 LÓGICA INTELIGENTE: Extrai categorias e lojas únicas dos dados carregados
  const uniqueCategories = useMemo(() => {
    // Pega todas as categorias, remove vazias e remove duplicadas usando Set
    const categories = data.map((p) => p.category).filter(Boolean) as string[];
    return Array.from(new Set(categories)).sort(); // Ordena alfabeticamente
  }, [data]);

  const uniqueStores = useMemo(() => {
    const stores = data.map((p) => p.store).filter(Boolean) as string[];
    return Array.from(new Set(stores)).sort();
  }, [data]);

  // Carrega ao abrir a página
  useEffect(() => {
    loadData();
  }, []);

  // --- 2. FILTRAGEM (CLIENT SIDE) ---
  const filteredData = useMemo(() => {
    return data.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.id.toLowerCase().includes(search.toLowerCase()) ||
        (product.sku &&
          product.sku.toLowerCase().includes(search.toLowerCase())); // Busca por SKU também

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;
      const matchesStore =
        storeFilter === "all" || product.store === storeFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesStore;
    });
  }, [data, search, categoryFilter, statusFilter, storeFilter]);

  // 🧹 PREPARAR DADOS PARA EXCEL (Tradução e Limpeza)
  const csvData = useMemo(() => {
    return filteredData.map((item) => ({
      Produto: item.name,
      SKU: item.sku || "-",
      Loja: item.store,
      Categoria: item.category,
      "Preço Venda (R$)": item.salePrice, // Mantemos número pro Excel somar
      "Custo (R$)": item.costPrice,
      Estoque: item.stock,
      Status: item.status === "active" ? "Ativo" : "Pausado",
      "Link Imagem": item.image || "",
    }));
  }, [filteredData]);

  // --- 3. ACTIONS DE INTERFACE ---

  // 👇 NOVA FUNÇÃO: Atualiza e mostra o Toast
  const handleRefresh = async () => {
    await loadData();
    toast.success("Produtos atualizados com sucesso!");
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsSheetOpen(true);
  };

  const handleSeedData = async () => {
    setIsLoading(true);
    await generateTestProducts();
    await loadData(); // Recarrega a tabela
    toast.success("10 Produtos de teste gerados!");
    setIsLoading(false);
  };

  // --- 4. SALVAR NO BANCO (CREATE / UPDATE) ---
  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      // Chama a Server Action
      const result = await saveProduct(updatedProduct);

      if (result.success) {
        toast.success("Produto salvo com sucesso!");
        setIsSheetOpen(false); // Fecha o modal
        loadData(); // Recarrega a tabela
      } else {
        toast.error("Erro ao salvar produto");
        console.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão");
    }
  };

  // --- 5. DELETAR DO BANCO ---
  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      const result = await deleteProduct(deletingProduct.id);

      if (result.success) {
        toast.success("Produto removido");
        loadData(); // Recarrega a tabela
      } else {
        toast.error("Erro ao remover produto");
      }
    } catch (error) {
      toast.error("Erro ao deletar");
    } finally {
      setIsDeleteAlertOpen(false);
      setDeletingProduct(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStoreFilter("all");
  };

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">
            Gerencie seu catálogo, preços e estoque.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* ... dentro da div do Header ... */}
          <div className="flex items-center gap-2">
            {/* BOTÃO MÁGICO DE TESTE (Remova depois) */}
            {/* <Button
              variant="default"
              onClick={handleSeedData}
              disabled={isLoading}
              className="text-muted-foreground"
            >
              🌱 Gerar Teste
            </Button> */}
          </div>
          <Button
            variant="default"
            onClick={handleRefresh} // 👈 ALTERADO: Agora chama a nova função com Toast
            disabled={isLoading}
            className="text-white bg-blue-600 transition-all duration-300 hover:bg-blue-700 hover:shadow-[0_0_10px_1px_rgba(37,99,235,0.6)] hover:-translate-y-0.5"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Carregando..." : "Atualizar Produtos"}
          </Button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Buscar por nome, SKU ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/*Baixar como CSV*/}
          <DownloadButton data={csvData} filename="meus-produtos.csv" />

          {/* FILTRO CATEGORIA */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag size={14} />
                <span className="text-foreground text-sm truncate">
                  {/* Mantenha o SelectValue aqui! Ele é o segredo */}
                  <SelectValue placeholder="Categoria" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>

              {/* Gera as opções baseado no que existe no banco */}
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}

              {/* Mostra um aviso se não tiver categorias ainda */}
              {uniqueCategories.length === 0 && (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  Sem categorias
                </div>
              )}
            </SelectContent>
          </Select>

          {/* FILTRO STATUS */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity size={14} />
                {/* 👇 A CORREÇÃO */}
                <span className="text-foreground text-sm truncate">
                  <SelectValue placeholder="Status" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
            </SelectContent>
          </Select>

          {/* FILTRO LOJA */}
          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Store size={14} />
                <span className="text-foreground text-sm truncate">
                  <SelectValue placeholder="Loja" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>

              {uniqueStores.map((store) => (
                <SelectItem key={store} value={store}>
                  {store}
                </SelectItem>
              ))}

              {uniqueStores.length === 0 && (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  Nenhuma loja
                </div>
              )}
            </SelectContent>
          </Select>

          {(search ||
            categoryFilter !== "all" ||
            statusFilter !== "all" ||
            storeFilter !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <XCircle size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* TABELA COM LOADING STATE */}
      <div className="flex-1 overflow-auto pr-2">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            meta={{
              onEdit: handleEditClick,
              onDelete: handleDeleteClick,
              // 👇 PASSAMOS AS REGRAS PARA AS COLUNAS AQUI | TAXA E IMPOSTO
              fees: globalFees,
              taxes: globalTaxes,
            }}
          />
        )}
      </div>

      <ProductEditSheet
        product={editingProduct}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={handleSaveProduct}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente o produto{" "}
              <span className="font-bold text-foreground">
                {deletingProduct?.name}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
