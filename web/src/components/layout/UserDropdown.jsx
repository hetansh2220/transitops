import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, ChevronDown, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/permissions";

// "Test Manager" → "TM"
function initialsOf(name) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function UserDropdown() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    // Clears the httpOnly refresh cookie server-side, then drops the session.
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`User menu for ${user.name}`}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer",
          "text-sm font-medium text-foreground",
          "hover:bg-accent transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1",
          isOpen && "bg-accent"
        )}
      >
        {/* Avatar */}
        <Avatar size="sm">
          <AvatarFallback className="bg-foreground text-background text-[10px] font-bold">
            {initialsOf(user.name)}
          </AvatarFallback>
        </Avatar>

        {/* Name — hidden on mobile */}
        <span className="hidden sm:block max-w-[120px] truncate">
          {user.name}
        </span>

        <ChevronDown
          size={14}
          aria-hidden="true"
          className="shrink-0 text-muted-foreground"
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 w-56 z-50 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 focus:outline-none"
          )}
        >
          {/* Identity block */}
          <div className="px-2.5 py-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <Shield size={10} aria-hidden="true" />
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
          </div>

          <div className="-mx-1 my-1 h-px bg-border" />

          <div className="flex flex-col gap-0.5">
            {/* Profile removed — it pointed at /settings, same as Settings below. */}
            <button
              id="menu-settings"
              onClick={() => {
                setIsOpen(false);
                navigate("/settings");
              }}
              className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-150"
            >
              <Settings size={14} aria-hidden="true" />
              Settings
            </button>
          </div>

          <div className="-mx-1 my-1 h-px bg-border" />

          <button
            id="menu-logout"
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left   cursor-pointer transition-colors duration-150"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

