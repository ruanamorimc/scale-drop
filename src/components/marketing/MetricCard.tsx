"use client";

import { forwardRef } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  value?: string | number;
  trend?: "positive" | "negative" | "neutral";
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  isEditing?: boolean;
  children?: React.ReactNode;
  contentClassName?: string;
  innerPadding?: string;
  showValues?: boolean;
}

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      title,
      subtitle,
      value,
      trend = "neutral",
      description,
      headerAction,
      isEditing,
      className,
      children,
      contentClassName,
      innerPadding = "p-[21px]",
      showValues = true,
      style,
      ...props
    },
    ref,
  ) => {
    const isPositive = trend === "positive";
    const isNegative = trend === "negative";

    const titleColor = isPositive
      ? "text-emerald-500 dark:text-emerald-400 font-semibold"
      : isNegative
        ? "text-red-500 dark:text-red-400 font-semibold"
        : "text-muted-foreground font-medium";

    const valueColor = isPositive
      ? "text-emerald-500 dark:text-emerald-400"
      : isNegative
        ? "text-red-500 dark:text-red-400"
        : "text-foreground";

    const iconColor = isPositive
      ? "text-emerald-500/60 hover:text-emerald-500"
      : isNegative
        ? "text-red-500/60 hover:text-red-500"
        : "text-muted-foreground/50 hover:text-foreground";

    return (
      <div
        ref={ref}
        style={style}
        {...props}
        className={cn(
          "h-full relative group rounded-xl transition-all select-none",
          !isEditing && "p-[1px]",
          !isEditing &&
            "bg-gradient-to-b from-border/60 via-border/30 to-transparent dark:from-white/20 dark:via-white/10 dark:to-transparent",
          !isEditing && "shadow-sm hover:shadow-md",
          isEditing
            ? "cursor-move border-2 border-blue-500/50 bg-blue-500/5 hover:border-blue-500 z-50"
            : "cursor-default",
          className,
        )}
      >
        <div
          className={cn(
            "relative h-full w-full rounded-xl overflow-hidden flex flex-col",
            innerPadding,
            !isEditing && [
              "bg-background bg-gradient-to-br from-gray-50/50 to-transparent",
              "dark:bg-zinc-950 dark:from-zinc-800/50 dark:to-black",
            ],
          )}
        >
          {!isEditing && (
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-30 dark:via-white/10" />
          )}

          <div className="flex items-start justify-between relative z-10 shrink-0">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "text-[13.5px] tracking-tight leading-none transition-colors",
                    titleColor,
                  )}
                >
                  {title}
                </h3>
                {subtitle && (
                  <span className="text-[10.5px] text-muted-foreground/40 font-medium tracking-wide">
                    {subtitle}
                  </span>
                )}
              </div>

              {value !== undefined && (
                <div
                  className={cn(
                    "text-2xl font-bold tracking-tight leading-none mt-1 transition-all duration-300",
                    valueColor,
                    !showValues && "blur-[6px] opacity-60 select-none",
                  )}
                >
                  {value}
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-2 shrink-0"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {headerAction && (
                <div className="flex items-center">{headerAction}</div>
              )}

              {description && (
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "transition-colors p-1 cursor-help",
                          iconColor,
                        )}
                      >
                        <Info size={14} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className="bg-popover border-border text-popover-foreground max-w-[320px] text-xs"
                    >
                      <p className="whitespace-pre-line leading-relaxed">
                        {description}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {children && (
            <div
              className={cn(
                "flex-1 flex flex-col justify-end min-h-0 relative z-10 w-full mt-2",
                contentClassName,
              )}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    );
  },
);

MetricCard.displayName = "MetricCard";

// ============================================================================
// COMPONENTE DE LISTA
// ============================================================================
interface MetricListItemProps {
  label: string;
  value?: string | number;
  percentage: number;
  color?: string;
  blurLabel?: boolean;
  blurValue?: boolean;
}

export function MetricListItem({
  label,
  value,
  percentage,
  color = "#2563eb",
  blurLabel = false,
  blurValue = false,
}: MetricListItemProps) {
  const radius = 6.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center justify-between py-[11px] border-b border-border/40 last:border-0 group/item hover:bg-muted/10 transition-colors w-full pr-2">
      <span
        className={cn(
          "text-[13px] font-medium text-muted-foreground group-hover/item:text-foreground transition-all duration-300 truncate pr-3",
          blurLabel && "blur-[5px] opacity-60 select-none",
        )}
      >
        {label}
      </span>

      <div className="flex items-center gap-3 shrink-0">
        {value !== undefined && (
          <span
            className={cn(
              "text-[13px] text-foreground font-semibold tracking-tight transition-all duration-300",
              blurValue && "blur-[5px] opacity-60 select-none",
            )}
          >
            {value}
          </span>
        )}

        <div className="flex items-center gap-2.5 w-[65px] justify-end">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            className="shrink-0 -rotate-90"
          >
            <circle
              cx="9"
              cy="9"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3.5"
              className="text-muted/20"
            />
            <circle
              cx="9"
              cy="9"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="text-[12px] font-bold text-foreground w-[38px] text-right">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
