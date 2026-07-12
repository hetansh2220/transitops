import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isPending = false,
  onConfirm,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
        <AlertDialogAction
          disabled={isPending}
          onClick={(event) => {
            // Keep the dialog mounted while the mutation runs so the pending
            // state is visible; the caller closes it on success.
            event.preventDefault();
            onConfirm();
          }}
          className={cn(
            destructive &&
              buttonVariants({ variant: "destructive" }),
          )}
        >
          {isPending ? "Working…" : confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmDialog;
