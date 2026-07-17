import { LogOut } from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { Button } from "@/components/ui/button";

/** Sticky top bar shown only on small screens. */
export function MobileTopBar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-sidebar px-4 md:hidden">
      <BrandMark variant="terminal" size="sm" />
      <Button variant="outline" size="sm" onClick={onSignOut}>
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </header>
  );
}
