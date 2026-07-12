import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNavGroups } from "@/hooks/useNavGroups";
import { NavItem } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export default function MobileSidebar({ open, onOpenChange }) {
  const location = useLocation();
  const navGroups = useNavGroups();

  // Close sheet on navigation
  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Hamburger trigger — only visible on mobile */}
      <SheetTrigger asChild>
        <button
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="mobile-sidebar"
          className={cn(
            "md:hidden flex h-9 w-9 items-center justify-center rounded-md",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
          )}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      </SheetTrigger>

      {/* Drawer — slides from left */}
      <SheetContent
        id="mobile-sidebar"
        side="left"
        showCloseButton={true}
        className="flex w-72 flex-col gap-0 p-0 bg-sidebar border-r border-border"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground"
            >
              <span className="text-[11px] font-black tracking-tight text-background">
                TO
              </span>
            </div>
            <SheetTitle className="font-heading text-sm font-bold tracking-tight">
              TransitOps
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-5"
          aria-label="Mobile navigation"
        >
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-0.5">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavItem key={item.href} item={item} collapsed={false} />
              ))}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
