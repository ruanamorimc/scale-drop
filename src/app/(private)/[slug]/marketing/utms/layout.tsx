import { Metadata } from "next";

export const metadata: Metadata = {
  title: "UTMs",
  description: "Gerenciamento e Relatórios de UTMs",
};

export default function UtmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
