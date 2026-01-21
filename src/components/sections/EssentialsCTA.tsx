import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function EssentialsCTA() {
    const navigate = useNavigate();

    return (
        <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button
                        onClick={() => navigate('/essentials')}
                        variant="default"
                        size="lg"
                        className="h-16 px-10 rounded-2xl text-lg font-bold group w-full sm:w-auto"
                    >
                        Donate Essentials
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        onClick={() => navigate('/essentials')}
                        variant="outline"
                        size="lg"
                        className="h-16 px-10 rounded-2xl text-lg font-bold w-full sm:w-auto"
                    >
                        View All Items
                    </Button>
                </div>
            </div>
        </section>
    );
}
