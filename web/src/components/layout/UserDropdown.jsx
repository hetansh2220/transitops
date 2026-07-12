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

// ── Mock user — replace with AuthContext once wired ───────────────────────
const MOCK_USER = {
  name: "Darsh Patel",
  email: "darsh@transitops.com",
  role: "Fleet Manager",
  initials: "DP",
};

// Derive a readable role label from the enum string
function formatRole(role) {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function UserDropdown() {
  const navigate = useNavigate();
  const user = MOCK_USER;

  const handleLogout = () => {
    // Auth service call goes here
    navigate("/login");
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
            {user.initials}
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
              {formatRole(user.role)}
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
