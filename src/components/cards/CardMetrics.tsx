import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { Badge } from "../ui/badge";

export function CardMetrics() {
  return (
    <main>
      {/* 2. O GRID DE MÉTRICAS ABAIXO DO GRÁFICO (3 Colunas) */}
      <div
        className="grid grid-cols-3 md-grid-cols-2 xl-grid-cols-3 gap-4"
        /* style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }} */
      >
        {/* Card Pedidos Aprovados */}
        <Card>
          <CardHeader>
            <CardDescription>Pedidos Aprovados</CardDescription>
            <CardTitle className="text-xl font-semibold">
              R$ 57.456,23 (725)
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Card Pedidos Pendentes */}
        <Card>
          <CardHeader>
            <CardDescription>
              Pedidos Pendentes
              <Badge variant="outline" className="ml-2">
                <IconTrendingDown className="text-red-500 dark:text-red-400" />
                -22%
              </Badge>
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              R$ 17,456,23 (225)
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Card Ticket Médio */}
        <Card>
          <CardHeader>
            <CardDescription>Ticket Médio</CardDescription>
            <CardTitle className="text-xl font-semibold">R$ 297,00</CardTitle>
          </CardHeader>
        </Card>

        {/* Card Margem de Lucro */}
        <Card>
          <CardHeader>
            <CardDescription>
              Margem de Lucro
              <Badge variant="outline" className="ml-2">
                <IconTrendingUp className="text-emerald-500 dark:text-emerald-400" />
                +20%
              </Badge>
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              22%
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Card CAC */}
        <Card>
          <CardHeader>
            <CardDescription>
              CAC
              <Badge variant="outline" className="ml-2 ">
                <IconTrendingUp className="text-emerald-500 dark:text-emerald-400" />
                +40%
              </Badge>
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              R$ 19,81
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Card ROI */}
        <Card>
          <CardHeader>
            <CardDescription>
              ROI
              <Badge variant="outline" className="ml-2">
                <IconTrendingUp className="text-emerald-500 dark:text-emerald-400" />
                +40%
              </Badge>
            </CardDescription>
            <CardTitle className="text-xl font-semibold">300%</CardTitle>
          </CardHeader>
        </Card>

        {/* Card Cartão de Crédito */}
        <Card>
          <CardHeader>
            <CardDescription>
              Cartão de Crédito
              <Badge variant="outline" className="ml-2">
                <IconTrendingUp className="text-emerald-500 dark:text-emerald-400" />
                +40%
              </Badge>
            </CardDescription>
            <CardTitle className="text-xl font-semibold">300%</CardTitle>
          </CardHeader>
        </Card>

        {/* Card Boleto Bancário */}
        <Card>
          <CardHeader>
            <CardDescription>
              Boleto Bancário
              <Badge variant="outline" className="ml-2">
                <IconTrendingUp className="text-emerald-500 dark:text-emerald-400" />
                +40%
              </Badge>
            </CardDescription>
            <CardTitle className="text-xl font-semibold">300%</CardTitle>
          </CardHeader>
        </Card>

        {/* Card PIX */}
        <Card>
          <CardHeader>
            <CardDescription>
              PIX
              <Badge variant="outline" className="ml-2">
                <IconTrendingUp className="text-emerald-500 dark:text-emerald-400" />
                +40%
              </Badge>
            </CardDescription>
            <CardTitle className="text-xl font-semibold">300%</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
