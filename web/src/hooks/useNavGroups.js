import { useMemo } from "react";
import { NAV_GROUPS } from "@/constants/sidebar";
import { useAuth } from "@/context/AuthContext";
import { canView } from "@/lib/permissions";

/**
 * The nav groups this user's role can see, with empty groups dropped so we
 * don't render a heading with nothing under it.
 */
export const useNavGroups = () => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return [];

    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.resource || canView(user, item.resource),
      ),
    })).filter((group) => group.items.length > 0);
  }, [user]);
};
