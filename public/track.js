(function () {
  // 1. AS CONFIGURAÇÕES INICIAIS
  const apiEndpoint = "/api/events";

  // Aqui nós listamos quais são os links de "Checkout" que precisam receber as UTMs.
  // Se o seu lojista usa Yampi, o botão dele vai pra 'seguro.yampi.com.br'.
  // O script vai procurar links que contenham essas palavras:
  const checkoutDomains = [
    "yampi.com.br",
    "cartpanda.com.br",
    "kiwify.com.br",
    "hotmart.com",
    "kirvano.com.br",
    "pay.appmax.com.br",
    "mercadopago.com.br",
  ];

  // Extrai o ID do cliente da URL do script (ex: track.js?id=123)
  const scriptTag = document.currentScript;
  let userId = "UNKNOWN";
  if (scriptTag && scriptTag.src) {
    const urlParams = new URL(scriptTag.src).searchParams;
    userId = urlParams.get("id") || "UNKNOWN";
  }

  // 2. SALVANDO AS UTMS DA URL PARA A MEMÓRIA
  function captureUTMs() {
    const urlParams = new URLSearchParams(window.location.search);
    const utms = {};

    // Lista de parâmetros que queremos salvar
    const paramsToSave = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "utm_id",
      "src",
      "sck",
      "ref", // Adicionamos esses porque a Hotmart/Kiwify usam muito
    ];

    let hasUTMs = false;
    paramsToSave.forEach((param) => {
      if (urlParams.has(param)) {
        utms[param] = urlParams.get(param);
        hasUTMs = true;
      }
    });

    // Se achou alguma UTM na URL, salva no localStorage do navegador
    if (hasUTMs) {
      localStorage.setItem("sd_utms", JSON.stringify(utms));
    }
  }

  // 3. RECUPERANDO AS UTMS DA MEMÓRIA
  function getUTMs() {
    const stored = localStorage.getItem("sd_utms");
    return stored ? JSON.parse(stored) : {};
  }

  // 4. O NOVO SUPERPODER: LINK DECORATION (Reescrever Botões)
  function decorateCheckoutLinks() {
    const utms = getUTMs();

    // Se não tem UTM salva, não faz nada
    if (Object.keys(utms).length === 0) return;

    // Constrói a string final das UTMs (ex: utm_source=FB&utm_campaign=Teste)
    const queryString = new URLSearchParams(utms).toString();

    // Pega todos os links da página <a>
    const links = document.querySelectorAll("a");

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      // Verifica se o link do botão vai para algum dos nossos Checkouts
      const isCheckoutLink = checkoutDomains.some((domain) =>
        href.includes(domain),
      );

      if (isCheckoutLink) {
        try {
          const urlObj = new URL(href);

          // Se o botão da Yampi já tiver uma utm_source lá, a gente não mexe.
          // Se estiver limpo, a gente injeta as nossas!
          Object.keys(utms).forEach((key) => {
            if (!urlObj.searchParams.has(key)) {
              urlObj.searchParams.set(key, utms[key]);
            }
          });

          // Atualiza o botão silenciosamente
          link.setAttribute("href", urlObj.toString());
        } catch (e) {
          // Ignora links inválidos silenciosamente
        }
      }
    });
  }

  // 5. ENVIANDO EVENTOS PARA NOSSA API (CAPI)
  function sendEvent(eventName, customData = {}) {
    const payload = {
      userId: userId,
      eventName: eventName,
      eventUrl: window.location.href,
      utms: getUTMs(), // Manda as UTMs salvas pro nosso servidor também
      timestamp: new Date().toISOString(),
      customData: customData,
    };

    // Usamos sendBeacon para garantir o envio mesmo se a pessoa fechar a aba
    if (navigator.sendBeacon) {
      navigator.sendBeacon(apiEndpoint, JSON.stringify(payload));
    } else {
      fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  }

  // 6. EXECUÇÃO DO SCRIPT (O Motor)
  function init() {
    captureUTMs();
    sendEvent("PageView"); // Avisa o servidor que alguém acessou

    // Procura os botões e injeta as UTMs neles
    decorateCheckoutLinks();
  }

  // Roda assim que o arquivo é carregado
  init();

  // Expõe uma função global caso o lojista queira disparar eventos manuais
  window.ScaleDropTracker = {
    track: sendEvent,
    decorate: decorateCheckoutLinks, // Permite forçar a decoração de links de novo
  };
})();
