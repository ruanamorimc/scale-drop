export interface MetaCampaign {
  // Campos obrigatórios que o sistema usa para ID e Status
  id: string;
  name: string;
  status: boolean | string; // Aceita boolean (do mock) ou string (da API 'ACTIVE')

  // Campos opcionais comuns (para o autocomplete ajudar)
  budget?: number | null;
  spent?: number;
  revenue?: number;
  roas?: number;

  // 🔥 O TRUQUE MÁGICO:
  // Isso diz ao TypeScript: "Aceite qualquer outra propriedade com nome de string"
  // Assim, 'video_hook', 'cpa', 'cpi' funcionam sem dar erro vermelho.
  // 🔥 O TRUQUE MÁGICO 100% TIPADO:
  // Aceite propriedades extras dinâmicas (que a API do Facebook mandar),
  // mas restrinja aos tipos normais de dados (sem usar 'any'!).
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, unknown>
    | unknown[];
}
