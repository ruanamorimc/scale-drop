// tailwind.config.ts
const config = {
  // ...
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // <--- CERTIFIQUE-SE QUE ESTA LINHA EXISTE
  ],
  theme: {
    extend: {
      boxShadow: {
        // x  y  blur  spread  color
        "glow": "0 0 20px 5px rgba(37, 99, 235, 0.7)",
        "glow-sm": "0 0 10px 2px rgba(37, 99, 235, 0.5)",
      },
    },
  },
};


/* Opção 1: Glow Sutil (Mais elegante)
Menos opacidade (0.4) e um pouco menos de espalhamento.
hover:shadow-[0_0_15px_2px_rgba(37,99,235,0.4)]

Opção 2: Glow Médio (Equilibrado)
Um pouco mais visível, mas sem parecer um "sabre de luz".
hover:shadow-[0_0_18px_3px_rgba(37,99,235,0.55)]

Opção 3: Glow Focado (Apenas nas bordas)
Menos blur, fica parecendo uma borda brilhante.
hover:shadow-[0_0_10px_1px_rgba(37,99,235,0.6)] */