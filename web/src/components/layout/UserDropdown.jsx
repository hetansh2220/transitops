import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/permissions";

// "Test Manager" → "TM"
function initialsOf(name) {
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

  if (!user) return null;

  const handleLogout = async () => {
    // Clears the httpOnly refresh cookie server-side, then drops the session.
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id="user-menu-trigger"
        aria-label={`User menu for ${user.name}`}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5",
          "text-sm font-medium text-foreground",
          "hover:bg-accent transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1",
          "aria-expanded:bg-accent"
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
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-56"
      >
        {/* Identity block */}
        <DropdownMenuLabel className="px-2 py-2">
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
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            id="menu-profile"
            onClick={() => navigate("/settings")}
            className="gap-2 cursor-pointer"
          >
            <User size={14} aria-hidden="true" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            id="menu-settings"
            onClick={() => navigate("/settings")}
            className="gap-2 cursor-pointer"
          >
            <Settings size={14} aria-hidden="true" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          id="menu-logout"
          variant="destructive"
          onClick={handleLogout}
          className="gap-2 cursor-pointer"
        >
          <LogOut size={14} aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
