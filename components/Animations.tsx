"use client";

import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { ReactNode, useEffect } from "react";

// =========================================================
// 1. SCROLL REVEAL (Corrigido o Bug de Layout)
// =========================================================
interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "w-full",
}: ScrollRevealProps) {
  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      // A classe w-full resolve o problema das seções espremidas!
      className={className}
      initial={{ opacity: 0, ...directions[direction], filter: "blur(10px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.1 }} // 0.1 garante que a animação dispare rápido
      transition={{ duration: 0.8, delay: delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// =========================================================
// 2. PRESETS DE TEXTO (Corrigido o Bug do Gradiente)
// =========================================================

export function EffectPerCharacter({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const letters = text.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay * i },
    }),
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  };

  return (
    <motion.span
      style={{ display: "flex", overflow: "hidden" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {letters.map((letter, index) => (
        // Passamos a className aqui para o gradiente pegar em cada letra
        <motion.span
          variants={childVariants as any}
          key={index}
          className={`inline-block whitespace-pre ${className}`}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function EffectPerWord({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  };

  return (
    <motion.span
      style={{ display: "inline-flex", flexWrap: "wrap" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {words.map((word, index) => (
        // Passamos a className aqui para o gradiente pegar em cada palavra perfeitamente
        <motion.span
          variants={childVariants as any}
          key={index}
          className={`inline-block mr-[0.25em] ${className}`}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function EffectWithSpeed({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay * i },
    }),
  };

  const childVariants = {
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", damping: 20, stiffness: 100 },
    },
    hidden: { opacity: 0, x: -20 },
  };

  return (
    <motion.span
      style={{ display: "inline-flex", flexWrap: "wrap" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
    >
      {words.map((word, index) => (
        <motion.span
          variants={childVariants as any}
          key={index}
          className={`inline-block mr-[0.25em] ${className}`}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// =========================================================
// 3. CORREÇÃO DO PREÇO (Roleta com Centavos)
// =========================================================

function CountingNumber({ value }: { value: number }) {
  const spring = useSpring(value, { bounce: 0, duration: 1200 });
  const velocity = useVelocity(spring);
  const blur = useTransform(
    velocity,
    [-300, 0, 300],
    ["blur(3px)", "blur(0px)", "blur(3px)"],
  );

  const display = useTransform(spring, (current) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(current);
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span
      style={{ filter: blur }}
      className="inline-block tabular-nums tracking-tight"
    >
      {display}
    </motion.span>
  );
}

export function AnimatedPriceCentavos({ price }: { price: string }) {
  const numericPrice = parseFloat(price);
  const isNumeric = !isNaN(numericPrice);

  if (!isNumeric) {
    return <span>{price}</span>;
  }

  return <CountingNumber value={numericPrice} />;
}
