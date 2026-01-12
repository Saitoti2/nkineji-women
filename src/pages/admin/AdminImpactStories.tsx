import { DynamicNavbar } from "@/components/layout/DynamicNavbar";
import { Footer } from "@/components/layout/Footer";
import { ImpactStoriesManager } from "@/components/admin/ImpactStoriesManager";

export default function AdminImpactStories() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <DynamicNavbar />
            <main className="flex-grow container mx-auto px-4 py-8 pt-32">
                <ImpactStoriesManager />
            </main>
            <Footer />
        </div>
    );
}
