"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-url-filters";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search recipes...",
  className,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const debouncedQuery = useDebounce(value, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["autocomplete", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];
      const res = await fetch(
        `/api/recipes/autocomplete?q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!res.ok) return [];
      return res.json() as Promise<
        { id: string; title: string; slug: string; imageUrl: string | null }[]
      >;
    },
    enabled: debouncedQuery.length >= 2,
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
          setFocused(false);
        }}
        role="search"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={placeholder}
            className="pl-10 pr-10"
            aria-label="Search recipes"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={focused && suggestions.length > 0}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {focused && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-border bg-surface shadow-lg"
        >
          {suggestions.map((s) => (
            <li key={s.id} role="option" aria-selected={false}>
              <Link
                href={`/recipes/${s.id}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-surface-hover"
                onClick={() => setFocused(false)}
              >
                {s.imageUrl && (
                  <Image
                    src={s.imageUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                )}
                <span className="text-sm">{s.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
