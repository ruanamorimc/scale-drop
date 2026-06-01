export async function registerNuvemshopWebhooks(
  storeId: string,
  accessToken: string,
) {
  // ATENÇÃO: Para testes locais, você precisará de um túnel como o Ngrok,
  // pois a Nuvemshop não envia webhooks para "localhost".
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const webhookUrl = `${appUrl}/api/webhooks/nuvemshop`;

  // Os eventos do "Caminho do Dinheiro" que queremos escutar
  const events = ["order/created", "order/updated"];

  for (const event of events) {
    try {
      const response = await fetch(
        `https://api.nuvemshop.com.br/v1/${storeId}/webhooks`,
        {
          method: "POST",
          headers: {
            Authentication: `bearer ${accessToken}`,
            "User-Agent": "Scale Drop (contato@scaledrop.com.br)",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: event,
            url: webhookUrl,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `[Scale Drop] Falha ao registrar webhook ${event}:`,
          errorData,
        );
      } else {
        console.log(
          `[Scale Drop] Webhook ${event} registrado com sucesso para a loja ${storeId}`,
        );
      }
    } catch (error) {
      console.error(
        `[Scale Drop] Erro na requisição do webhook ${event}:`,
        error,
      );
    }
  }
}
