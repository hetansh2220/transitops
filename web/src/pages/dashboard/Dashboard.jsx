import { Plus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's an overview of your fleet operations."
        action={
          <Button size="sm">
            <Plus />
            New Trip
          </Button>
        }
      />

      {/* Page content goes here */}
      <p className="text-sm text-muted-foreground">Dashboard content coming soon.</p>
    </div>
  );
};

export default DashboardPage;
