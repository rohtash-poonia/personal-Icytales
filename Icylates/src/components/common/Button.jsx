import React from "react";

export default function Button({
  height, width, leading, theme, variant, size, icons, children, iconposition,
  className = "", loading = false, disabled = false, type = "button", as: Component = "button", ...props
}) {
  const themeClass = variant === "outline"
    ? "border border-slate-300 bg-white text-slate-700 hover:border-pink hover:text-pink"
    : theme === "secondary"
      ? "bg-darkpurple text-white shadow-[0_3px_22px_3px_rgba(104,50,146,0.31)] border border-transparent hover:bg-transparent hover:border-darkpurple hover:text-darkpurple"
      : theme === "primary"
        ? "bg-pink text-white shadow-[0_3px_22px_3px_rgba(248,61,142,0.31)] border border-transparent hover:bg-transparent hover:border-pink hover:text-pink"
        : "";
  const sizeClass = size === "sm" ? "min-h-9 px-3 py-1.5 text-xs" : "";
  return (
    <Component
      {...props}
      type={Component === "button" ? type : undefined}
      disabled={Component === "button" ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={`${themeClass} ${sizeClass} max-md:text-sm font-semibold rounded-full flex items-center justify-center duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink ${height || ""} ${width || ""} ${leading || ""} ${iconposition || ""} ${className}`}
    >
      {children}
      {icons && !loading && <span className={children ? "ml-2" : ""} aria-hidden="true">{icons}</span>}
    </Component>
  );
}
