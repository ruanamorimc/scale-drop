import { IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "../ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartBarInteractive } from "../chart/ChartBarInteractive";

export function SideMetrics() {
  return (
    <div className="space-y-4">
      {/* Card Lucro Líquido */}
      <Card>
        <CardHeader>
          <CardDescription>Lucro Líquido</CardDescription>
          <CardTitle className="text-2xl font-semibold">R$ 11.491,24</CardTitle>
          <div className="mt-2">
            <Badge variant="outline">
              <IconTrendingUp
                size={14}
                className="mr-1 text-emerald-500 dark:text-emerald-400"
              />
              +36%
            </Badge>
          </div>
        </CardHeader>
        <ChartBarInteractive />
        <CardFooter className="text-xs text-muted-foreground">
          a mais nesse período
        </CardFooter>
      </Card>

      {/* Futuro Ranking de Produtos */}
      <Card className="min-h-[200px] flex items-center justify-center border-dashed">
        <span className="text-muted-foreground">Ranking de Produtos</span>
      </Card>
    </div>
  );
}
