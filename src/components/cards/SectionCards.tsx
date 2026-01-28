import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "../ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function SectionCards() {
  return (
    <main className="space-y-4">
      {/* --- TOPO: 4 CARDS PRINCIPAIS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4 mb-2">
        <Card className="bg-primary">
          <CardHeader>
            <CardDescription>Receita líquida</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              R$ 57.456,23
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +35.5%
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Custo dos Produtos</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              R$ 19.152,08
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +25.5%
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Marketing</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              R$ 14.364,05
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingDown />
                -50%
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Taxas e impostos</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              R$ 11.491,24
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +36%
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      </div>

      {/* --- ÁREA PRINCIPAL DIVIDIDA (GRÁFICO ESQUERDA | LUCRO DIREITA) --- */}
      {/* Usamos items-start para que a altura da direita não estique a esquerda */}
      <div className="grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              Resumo Financeiro
            </CardTitle>
            <CardDescription>
              Acompanhe o resumo financeiro do seu negócio no período
              selecionado.
            </CardDescription>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +36%
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Lucro Líquido</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              R$ 11.491,24
              <Badge variant="outline" className="ml-2">
                <IconTrendingUp />
                +36%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">a mais nesse período</div>
          </CardFooter>
        </Card>
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Pedidos Aprovados</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                R$ 57,456,23 (725)
                <Badge variant="outline" className="ml-2">
                  <IconTrendingUp />
                  +36%
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Pedidos Pendentes</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                R$ 17,456,23 (225)
                <Badge variant="outline" className="ml-2">
                  <IconTrendingUp />
                  -22%
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Tiecket Médio</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                R$ 297,00
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Margem de Lucro</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                22%
                <Badge variant="outline" className="ml-2">
                  <IconTrendingUp />
                  +20%
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>CAC</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                R$ 19,81
                <Badge variant="outline" className="ml-2">
                  <IconTrendingDown />
                  +40%
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>ROI</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                300%
                <Badge variant="outline" className="ml-2">
                  <IconTrendingUp />
                  +136%
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
