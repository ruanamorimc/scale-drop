export interface AutomationRule {
  id: string;
  name: string;
  product: string;
  account: string;
  scope: string;
  action: string;
  actionValue?: number | string | null;
  actionUnit?: string | null;
  conditions: string;
  frequency: string;
  period: string;
  status: boolean;
  rawConfig?: Record<string, unknown> | null;
}
