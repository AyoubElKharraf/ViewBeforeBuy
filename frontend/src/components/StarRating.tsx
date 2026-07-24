"use client";

import { Star } from "lucide-react";

export function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
}) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? "cursor-default" : "hover:scale-110 transition"}
          aria-label={`${n} étoiles`}
        >
          <Star
            className={`${cls} ${
              n <= value
                ? "fill-[color:var(--color-client-gold)] text-[color:var(--color-client-gold)]"
                : "text-[color:var(--color-client-border)]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
