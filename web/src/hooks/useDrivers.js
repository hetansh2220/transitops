import { useQuery } from "@tanstack/react-query";
import { listDrivers, getDriver } from "@/api/drivers";

const KEY = "drivers";

export const useDrivers = () =>
  useQuery({
    queryKey: [KEY],
    queryFn: listDrivers,
  });

export const useDriver = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => getDriver(id),
    enabled: Boolean(id),
  });
