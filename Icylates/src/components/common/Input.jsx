"use client";
import { useId } from "react";

export default function Input({
  label, id, name, type = "text", options, className = "",
  containerClassName = "", error, ref, "aria-describedby": describedBy, ...props
}) {
  const generatedId = useId();
  const inputId = id || name || generatedId;
  const errorId = `${inputId}-error`;
  const styles = `w-full rounded-[25px] border bg-white px-4 py-3 text-sm text-[#0F0200] outline-none transition focus:border-pink focus:ring-2 focus:ring-pink/20 ${error ? "border-red-500" : "border-[#E3E4E5]"} ${className}`;
  const common = {
    ...props, ref, id: inputId, name, className: styles,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [describedBy, error ? errorId : null].filter(Boolean).join(" ") || undefined,
  };
  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && <label htmlFor={inputId} className="text-base text-lightbrown font-medium">{label}</label>}
      {type === "select"
        ? <select {...common}>{options?.map(option => <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>)}</select>
        : <input {...common} type={type} />}
      {error && <p id={errorId} className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
