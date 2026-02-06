// src/services/mercadolivre.ts

interface MLItemSearchResponse {
  results: string[]; // Lista de IDs (ex: "MLB12345678")
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

// Interface para os dados COMPLETOS que vamos salvar depois
export interface MLItem {
  id: string;
  title: string;
  price: number;
  base_price: number;
  original_price: number | null;
  currency_id: string;
  initial_quantity: number;
  available_quantity: number;
  sold_quantity: number;
  permalink: string;
  thumbnail: string;
  pictures: { url: string }[];
  status: string;
  listing_type_id: string; // "gold_pro" (Premium) ou "gold_special" (Clássico)
}

/**
 * Busca todos os produtos do vendedor
 * ATENÇÃO: O Mercado Livre só devolve IDs na busca.
 * Precisamos fazer uma segunda chamada (multiget) para pegar Título, Preço e Fotos.
 */
export async function getSellerItems(accessToken: string, userId: string) {
  try {
    // 1. Buscar os IDs dos anúncios (Pega os primeiros 50 ativos)
    // Dica: Depois podemos adicionar paginação para pegar mais de 50
    const searchUrl = `https://api.mercadolibre.com/users/${userId}/items/search?status=active&limit=50`;
    
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!searchRes.ok) {
      throw new Error(`Erro ao buscar IDs: ${searchRes.statusText}`);
    }

    const searchData: MLItemSearchResponse = await searchRes.json();
    const itemIds = searchData.results;

    if (itemIds.length === 0) {
      return []; // Nenhum produto encontrado
    }

    // 2. Buscar os DETALHES desses IDs (Multiget)
    // O ML permite buscar até 20 itens por vez na URL. Vamos juntar tudo.
    const detailsUrl = `https://api.mercadolibre.com/items?ids=${itemIds.join(",")}`;

    const detailsRes = await fetch(detailsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!detailsRes.ok) {
      throw new Error(`Erro ao buscar detalhes: ${detailsRes.statusText}`);
    }

  // A resposta do multiget é um array de objetos com "code" e "body"
    const detailsData = await detailsRes.json();

    // 3. Limpar os dados (Pegar só o que interessa dentro do "body")
    // 👇 ADICIONE ESTA LINHA ABAIXO PARA O ESLINT IGNORAR O ERRO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanItems: MLItem[] = detailsData.map((item: any) => {
        if (item.code === 200) {
            return item.body as MLItem;
        }
        return null;
    // 👇 ADICIONE AQUI TAMBÉM SE PRECISAR
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).filter((item: any) => item !== null);

    return cleanItems;

  } catch (error) {
    console.error("Erro no serviço do Mercado Livre:", error);
    throw error;
  }
}