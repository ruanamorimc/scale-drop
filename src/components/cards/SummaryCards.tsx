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

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4 mb-2">
      <Card className="">
        <CardHeader>
          <CardDescription>Receita líquida</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            R$ 57.456,23
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="text-emerald-500 dark:text-emerald-400" />
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
              <IconTrendingUp className="text-emerald-500 dark:text-emerald-400" />
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
              <IconTrendingDown className="text-red-500 dark:text-red-400" />
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
              <IconTrendingUp className="text-emerald-500 dark:text-emerald-400" />
              +36%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
