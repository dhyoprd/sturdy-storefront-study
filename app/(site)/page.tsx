import Hero from "@/components/home/Hero";
import { getActiveHero } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export default function Page() {
  return <Hero hero={getActiveHero()} />;
}
