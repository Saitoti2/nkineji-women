import { DynamicNavbar } from "@/components/layout/DynamicNavbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { MissionSection } from "@/components/sections/MissionSection";
import { ImpactStats } from "@/components/sections/ImpactStats";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { EssentialsSection } from "@/components/sections/EssentialsSection";
import { CampaignsSection } from "@/components/sections/CampaignsSection";
import { StoriesSection } from "@/components/sections/StoriesSection";
import { DonateSection } from "@/components/sections/DonateSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DynamicNavbar />
      <main>
        <HeroSection />
        <MissionSection />
        <ImpactStats />
        <ProgramsSection />
        <EssentialsSection />
        <CampaignsSection />
        <StoriesSection />
        <DonateSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
