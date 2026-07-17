import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/landing/Footer";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingNav } from "@/components/landing/LandingNav";
import { LiveSnapshot } from "@/components/landing/LiveSnapshot";
import { ScreenshotPreview } from "@/components/landing/ScreenshotPreview";
import { WhyRedline } from "@/components/landing/WhyRedline";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REDLINE | Know before the market moves" },
      {
        name: "description",
        content:
          "REDLINE tracks the macro calendar that moves markets across Forex, crypto, metals, and global indices, then delivers precisely timed alerts before the print.",
      },
      { property: "og:title", content: "REDLINE | Know before the market moves" },
      {
        property: "og:description",
        content:
          "Precisely timed alerts for the economic events that move Forex, crypto, gold, silver, and global indices.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="app-terminal min-h-screen bg-background">
      <LandingNav />
      <Hero />
      <LiveSnapshot />
      <HowItWorks />
      <WhyRedline />
      <ScreenshotPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
}
