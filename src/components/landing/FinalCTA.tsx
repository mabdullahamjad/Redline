import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Get started
      </p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        Ready to stay ahead of the market?
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Create your free account — no credit card required.
      </p>
      <div className="mt-8">
        <Button
          asChild
          size="lg"
          className="rounded-sm bg-destructive px-8 font-mono text-xs uppercase tracking-wide text-destructive-foreground hover:bg-destructive/90"
        >
          <Link to="/auth" search={{ mode: "register" } as never}>
            Create your free account <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
