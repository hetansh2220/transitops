import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupText,
} from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

/**
 * SearchBar
 *
 * A reusable debounced search input built on the shadcn InputGroup composite.
 * Designed for use above data tables, list pages, and filter panels.
 *
 * Props
 * ─────
 * @param {string}   [value]          - Controlled value. When provided, the component
 *                                      runs in controlled mode. Leave undefined for
 *                                      uncontrolled mode (internal state).
 * @param {function} [onChange]        - Called with the debounced search string.
 *                                      Signature: (value: string) => void
 * @param {function} [onChangeImmediate] - Called on every keystroke (no debounce).
 *                                        Useful for controlling a local display value.
 * @param {string}   [placeholder]    - Input placeholder text. Default: "Search…"
 * @param {number}   [debounceMs]     - Debounce delay in milliseconds. Default: 300.
 * @param {boolean}  [autoFocus]      - Whether the input receives focus on mount.
 * @param {boolean}  [disabled]       - Disables the input and clear button.
 * @param {string}   [id]             - id forwarded to the underlying <input>.
 * @param {string}   [className]      - Extra classes on the InputGroup wrapper.
 * @param {string}   [inputClassName] - Extra classes on the inner InputGroupInput.
 *
 * Usage
 * ─────
 * // Uncontrolled — SearchBar manages its own display state
 * // onChange fires with the debounced value
 * <SearchBar
 *   placeholder="Search vehicles…"
 *   onChange={(val) => setQuery(val)}
 * />
 *
 * // Controlled — parent owns the value
 * const [search, setSearch] = useState("");
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   debounceMs={500}
 * />
 *
 * // Immediate + debounced (show typing instantly, fetch on debounce)
 * <SearchBar
 *   onChangeImmediate={setDisplayValue}
 *   onChange={fetchResults}
 * />
 */
export default function SearchBar({
  value: controlledValue,
  onChange,
  onChangeImmediate,
  placeholder = "Search…",
  debounceMs = 300,
  autoFocus = false,
  disabled = false,
  id,
  className,
  inputClassName,
}) {
  const isControlled = controlledValue !== undefined;

  // Internal display value — mirrors controlled prop if controlled
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const inputRef = useRef(null);

  // Keep internal state in sync when controlled value changes externally
  useEffect(() => {
    if (isControlled) setInternalValue(controlledValue);
  }, [controlledValue, isControlled]);

  // Debounced value — triggers onChange
  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Fire onChange whenever debounced value settles
  useEffect(() => {
    onChange?.(debouncedValue);
  }, [debouncedValue, onChange]);

  const handleChange = useCallback(
    (e) => {
      const next = e.target.value;
      setInternalValue(next);
      onChangeImmediate?.(next);
    },
    [onChangeImmediate]
  );

  const handleClear = useCallback(() => {
    setInternalValue("");
    onChangeImmediate?.("");
    onChange?.("");
    inputRef.current?.focus();
  }, [onChange, onChangeImmediate]);

  // Keyboard: Escape clears the field
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && internalValue) {
        e.preventDefault();
        e.stopPropagation();
        handleClear();
      }
    },
    [internalValue, handleClear]
  );

  const hasValue = internalValue.length > 0;

  return (
    <InputGroup
      className={cn(
        "h-8 w-full max-w-xs",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      aria-disabled={disabled}
    >
      {/* ── Left: search icon ──────────────────────── */}
      <InputGroupAddon align="inline-start">
        <InputGroupText>
          <Search
            size={14}
            aria-hidden="true"
            className="text-muted-foreground/70 shrink-0"
          />
        </InputGroupText>
      </InputGroupAddon>

      {/* ── Input ─────────────────────────────────── */}
      <InputGroupInput
        ref={inputRef}
        id={id}
        type="search"
        role="searchbox"
        aria-label={placeholder}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        // Suppress native clear button — we render our own
        className={cn(
          "[&::-webkit-search-cancel-button]:hidden",
          "[&::-webkit-search-decoration]:hidden",
          inputClassName
        )}
      />

      {/* ── Right: clear button (shown only when there's a value) ─── */}
      {hasValue && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            aria-label="Clear search"
            onClick={handleClear}
            tabIndex={0}
            className="text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <X size={13} aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
