"use client";

import React, { useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Plus,
  MoreHorizontal,
  Search,
  Edit,
  Trash,
  Upload,
  Download,
  Facebook,
  Filter,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
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

import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { CreateRuleModal } from "@/components/marketing/CreateRuleModal";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

interface AutomationRule {
  id: string;
  name: string;
  product: string;
  account: string;
  scope: string; 
  action: string;
  conditions: string; 
  frequency: string;
  period: string;
  status: boolean;
  rawConfig: any; // 🔥 Guarda as configs brutas para alimentar a Edição
}

const MOCK_RULES: AutomationRule[] = [
  {
    id: "1",
    name: "Pausar campanhas com CPA alto",
    product: "Qualquer",
    account: "Todas",
    scope: "Campanhas Ativas",
    action: "Pausar",
    conditions: "CPA > R$ 50,00",
    frequency: "15 min",
    period: "Hoje",
    status: true,
    rawConfig: {
      name: "Pausar campanhas com CPA alto",
      product: "qualquer", account: "todas", scope: "active_campaigns",
      nameFilterType: "any", action: "pause", conditionLevel: "object",
      conditions: [{ metric: "cpa", operator: "greater_than", value: "50" }],
      period: "today", frequency: "15min", executionInterval: "any", dailyLimit: "no_limit"
    }
  },
];

export default function RegrasPage() {
  const [rules, setRules] = useState<AutomationRule[]>(MOCK_RULES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 🔥 ESTADO DE EDIÇÃO
  const [ruleToEdit, setRuleToEdit] = useState<AutomationRule | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]); 

  const { data: session } = authClient.useSession();
  const currentUser = { name: session?.user?.name || "Usuário", email: session?.user?.email || "", image: "" };

  // 🔥 FUNÇÃO PARA ABRIR EDIÇÃO
  const openEditModal = (rule: AutomationRule) => {
    setRuleToEdit(rule);
    setIsCreateModalOpen(true);
  };

  // 🔥 FUNÇÃO PARA ABRIR CRIAÇÃO
  const openCreateModal = () => {
    setRuleToEdit(null); // Reseta a regra
    setIsCreateModalOpen(true);
  };

  const handleSaveRule = (data: any) => {
    const conditionText = data.conditions.map((c: any) => {
       const op = c.operator === 'greater_than' ? '>' : '<';
       return `${c.metric.toUpperCase()} ${op} ${c.value}`;
    }).join(" E ");

    const newRule: AutomationRule = {
      id: ruleToEdit ? ruleToEdit.id : Math.random().toString(36).substr(2, 9),
      name: data.name,
      product: data.product === 'qualquer' ? "Qualquer" : "Específico",
      account: data.account === 'todas' ? "Todas" : "Específica",
      scope: data.scope.replace("_", " ").toUpperCase(),
      action: data.action,
      conditions: conditionText || "Sem condições",
      frequency: data.frequency,
      period: data.period,
      status: ruleToEdit ? ruleToEdit.status : true,
      rawConfig: data // Guarda a config para editar depois
    };

    if (ruleToEdit) {
      setRules(rules.map(r => r.id === ruleToEdit.id ? newRule : r));
      toast.success("Regra atualizada com sucesso!");
    } else {
      setRules([...rules, newRule]);
      toast.success("Regra criada com sucesso!");
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) toast.success("Arquivo importado com sucesso!");
  };

  const toggleRuleStatus = (id: string) => {
    setRules(rules.map((rule) => rule.id === id ? { ...rule, status: !rule.status } : rule));
    toast.success("Status atualizado.");
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRuleIds(checked ? rules.map(r => r.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedRuleIds(checked ? [...selectedRuleIds, id] : selectedRuleIds.filter(itemId => itemId !== id));
  };

  const confirmSingleDelete = (id: string) => setItemsToDelete([id]);
  const confirmBulkDelete = () => {
    if (selectedRuleIds.length === 0) { toast.error("Nenhuma regra selecionada."); return; }
    setItemsToDelete(selectedRuleIds);
  };

  const executeDelete = () => {
    setRules(rules.filter(r => !itemsToDelete.includes(r.id)));
    setSelectedRuleIds(selectedRuleIds.filter(id => !itemsToDelete.includes(id)));
    setItemsToDelete([]); 
    toast.success(itemsToDelete.length > 1 ? "Regras excluídas com sucesso." : "Regra excluída com sucesso.");
  };

  const filteredRules = rules.filter((rule) => rule.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const isAllSelected = filteredRules.length > 0 && selectedRuleIds.length === filteredRules.length;

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
      <div className="sticky top-0 shrink-0 w-full px-6 pt-6 pb-4 border-b border-border/30 transition-all backdrop-blur-md shadow-sm z-30">
        <MarketingHeader user={currentUser} hideControls={true} />
      </div>

      <div className="flex-1 p-6 min-h-0 w-full flex flex-col transition-all duration-300">
        <input type="file" ref={fileInputRef} className="hidden" accept=".json,.csv" onChange={handleFileChange} />

        <PremiumCard className="w-full h-full flex flex-col overflow-hidden relative z-0 p-0 shadow-sm rounded-xl">
          <Tabs defaultValue="meta" className="w-full h-full flex flex-col">
            
            {/* 🔥 TABS HEADER COM ESTILO PREMIUM DA IMAGEM 4 */}
            <div className="shrink-0 border-b border-border/40 w-full relative z-10 px-4 bg-transparent">
              <TabsList className="bg-transparent border-none w-full flex justify-start rounded-none p-0 h-auto">
                <TabsTrigger 
                  value="meta" 
                  className={cn(
                    "relative rounded-none border-b-0 py-4 px-6 font-semibold flex items-center gap-2.5 bg-transparent shadow-none transition-all duration-300 z-10 text-[14px] text-muted-foreground hover:text-foreground",
                    "data-[state=active]:text-foreground",
                    "data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-600/10 data-[state=active]:to-transparent",
                    "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
                    "after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-out",
                    "data-[state=active]:after:scale-x-100",
                    "data-[state=active]:after:bg-blue-600 dark:data-[state=active]:after:bg-blue-500",
                    "data-[state=active]:after:shadow-[0_-2px_15px_1px_rgba(59,130,246,0.6)]"
                  )}
                >
                  <Facebook size={16} color="#1778F2" /> Meta
                </TabsTrigger>
                <TabsTrigger 
                  value="google" 
                  className={cn(
                    "relative rounded-none border-b-0 py-4 px-6 font-semibold flex items-center gap-2.5 bg-transparent shadow-none transition-all duration-300 z-10 text-[14px] text-muted-foreground hover:text-foreground",
                    "data-[state=active]:text-foreground",
                    "data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-600/10 data-[state=active]:to-transparent",
                    "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
                    "after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-out",
                    "data-[state=active]:after:scale-x-100",
                    "data-[state=active]:after:bg-blue-600 dark:data-[state=active]:after:bg-blue-500",
                    "data-[state=active]:after:shadow-[0_-2px_15px_1px_rgba(59,130,246,0.6)]"
                  )}
                >
                  <GoogleIcon className="w-4 h-4" /> Google (Beta)
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="meta" className="flex-1 flex flex-col min-h-0 m-0 data-[state=inactive]:hidden bg-transparent">
                <div className="shrink-0 border-b border-border/40 w-full p-4 flex items-center justify-between bg-transparent">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground">Regras</h2>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={14} className="text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-zinc-950 border-zinc-800 text-white max-w-sm p-3 text-xs shadow-xl">
                              <p>Atualize campanhas, conjuntos de anúncios ou anúncios em massa automaticamente criando regras automatizadas</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      <div className="h-4 w-px bg-border/60" />
                      
                      <div className="relative w-72">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                          <Input placeholder="Pesquisar regras..." className="h-9 pl-9 bg-background/50 border-border text-xs focus-visible:ring-1 focus-visible:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs px-4">Mais</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover border-border text-popover-foreground shadow-md rounded-md">
                            <DropdownMenuItem onClick={handleImportClick} className="gap-2 cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground"><Upload size={14} /> Importar</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground"><Download size={14} /> Exportar Meta</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem onClick={confirmBulkDelete} className="gap-2 cursor-pointer text-xs text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950 focus:text-red-700 dark:focus:text-red-400">
                                <Trash size={14} /> Excluir selecionadas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 🔥 CHAMA O openCreateModal */}
                    <Button size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 rounded-md shadow-sm" onClick={openCreateModal}>
                        <Plus size={14} /> Criar regra
                    </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-transparent relative w-full custom-scrollbar">
                    <table className="w-full text-left text-xs text-muted-foreground">
                    <thead className="bg-transparent sticky top-0 z-10 text-[11px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border/40 backdrop-blur-md">
                        <tr>
                          <th className="px-4 py-3 w-[40px] text-center">
                            <Checkbox checked={isAllSelected} onCheckedChange={(val) => handleSelectAll(!!val)} className="translate-y-[2px]"/>
                          </th>
                          <th className="px-6 py-3 w-[60px] text-center">Status</th>
                          <th className="px-6 py-3">Nome e Produto</th>
                          <th className="px-6 py-3">Aplicada A</th>
                          <th className="px-6 py-3">Ação e Condição</th>
                          <th className="px-6 py-3">Frequência e Período</th>
                          <th className="px-6 py-3 text-right pr-8">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {filteredRules.length > 0 ? (
                        filteredRules.map((rule) => (
                            <tr key={rule.id} className={cn("hover:bg-muted/20 transition-colors group", selectedRuleIds.includes(rule.id) && "bg-muted/30")}>
                              <td className="px-4 py-4 text-center">
                                <Checkbox checked={selectedRuleIds.includes(rule.id)} onCheckedChange={(val) => handleSelectOne(rule.id, !!val)} className="translate-y-[2px]" />
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <Switch checked={rule.status} onCheckedChange={() => toggleRuleStatus(rule.id)} className="scale-75 data-[state=checked]:bg-blue-600" />
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium text-foreground">{rule.name}</span>
                                  <span className="text-[11px] text-muted-foreground">Produto: {rule.product}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-500/20 font-medium whitespace-nowrap text-[11px]">
                                  {rule.scope}
                                  </span>
                                  <div className="text-[10px] mt-1 text-muted-foreground">Conta: {rule.account}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1">
                                  <span className={cn("font-medium", rule.action.toLowerCase().includes("pausar") ? "text-orange-600 dark:text-orange-400" : "text-emerald-700 dark:text-emerald-400")}>
                                      {rule.action}
                                  </span>
                                  <span className="text-muted-foreground font-mono text-[11px] bg-muted/50 px-2 py-0.5 rounded border border-border/40 w-fit">
                                      SE: {rule.conditions}
                                  </span>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex flex-col text-foreground">
                                  <span>{rule.frequency}</span>
                                  <span className="text-[10px] text-muted-foreground">Base: {rule.period}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-right pr-8">
                                  <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                      <MoreHorizontal size={16} />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40 bg-popover border-border text-popover-foreground shadow-md rounded-md">
                                      {/* 🔥 CHAMA O openEditModal */}
                                      <DropdownMenuItem onClick={() => openEditModal(rule)} className="text-xs cursor-pointer focus:bg-accent focus:text-accent-foreground gap-2"><Edit size={14} /> Editar</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => confirmSingleDelete(rule.id)} className="text-xs cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950 focus:text-red-700 dark:focus:text-red-400 gap-2"><Trash size={14} /> Excluir</DropdownMenuItem>
                                  </DropdownMenuContent>
                                  </DropdownMenu>
                              </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={7} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground/50 gap-2 p-10">
                                <Filter size={32} strokeWidth={1} />
                                <p className="text-sm font-medium">Nenhuma regra encontrada.</p>
                                <p className="text-xs max-w-xs">Crie sua primeira regra personalizada clicando em "Criar regra" acima.</p>
                            </div>
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </TabsContent>

            <TabsContent value="google" className="flex-1 flex flex-col items-center justify-center min-h-0 m-0 data-[state=inactive]:hidden bg-transparent">
                <div className="text-center space-y-3 p-10">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border border-border">
                        <GoogleIcon className="w-8 h-8 opacity-50 grayscale" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Regras para Google Ads</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">Esta funcionalidade está em desenvolvimento e estará disponível em breve para automatizar suas campanhas de Search e Youtube.</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-500 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-500/20">EM BREVE</span>
                </div>
            </TabsContent>
          </Tabs>
        </PremiumCard>
      </div>

      <CreateRuleModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
        onSave={handleSaveRule}
        initialData={ruleToEdit?.rawConfig} // 🔥 PASSANDO OS DADOS BRUTOS DA REGRA PARA O MODAL LER
      />

      <AlertDialog open={itemsToDelete.length > 0} onOpenChange={(open) => !open && setItemsToDelete([])}>
        <AlertDialogContent className="bg-popover border-border text-popover-foreground rounded-lg shadow-lg max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-foreground">Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              {itemsToDelete.length > 1 
                ? `Isso excluirá permanentemente ${itemsToDelete.length} regras. `
                : "Isso excluirá permanentemente esta regra. "
              }
              As automações pararão de funcionar imediatamente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md px-4 py-2 text-sm font-medium transition-colors">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors shadow-sm">
              Sim, excluir {itemsToDelete.length > 1 ? "regras" : "regra"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}