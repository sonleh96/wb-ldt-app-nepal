"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

const countryOptions = [
  { value: "", label: "Start by selecting a country" },
  { value: "/nepal", label: "Nepal" },
  { value: "/serbia", label: "Serbia" },
  { value: "/zambia", label: "Zambia" },
] as const;

export function CountrySelector() {
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRoute) {
      return;
    }

    router.push(selectedRoute);
  }

  return (
    <div className="mt-10 w-full rounded-[1.9rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_18px_45px_rgba(39,62,71,0.08)] sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label className="sr-only" htmlFor="country-selector">
          Select a country
        </label>
        <div className="relative min-w-0 flex-1">
          <select
            id="country-selector"
            value={selectedRoute}
            onChange={(event) => setSelectedRoute(event.target.value)}
            className="h-[64px] w-full appearance-none rounded-[1.45rem] border border-[var(--border-soft)] bg-[var(--surface)] px-6 pr-14 text-lg font-medium text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] sm:text-xl"
          >
            {countryOptions.map((option) => (
              <option
                key={option.value || "placeholder"}
                value={option.value}
                disabled={option.value === ""}
              >
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-[var(--muted-foreground)]">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="h-6 w-6"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <button
          type="submit"
          disabled={!selectedRoute}
          className="inline-flex h-[64px] min-w-[12rem] items-center justify-center rounded-[1.45rem] bg-[var(--accent)] px-8 text-lg font-semibold text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-xl"
        >
          Show Data
        </button>
      </form>
    </div>
  );
}
