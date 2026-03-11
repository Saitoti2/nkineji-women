import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Heart } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const DonationSuccess = () => {
    const [searchParams] = useSearchParams();
    const donationId = searchParams.get("donationId");
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

    useEffect(() => {
        // We could poll the backend here to verify status if we wanted to be super sure
        // For now, let's assume if they reached here after PesaPal redirect, it's a good sign
        // or we can just show a "Thank you" and tell them it's being processed.
        const timeout = setTimeout(() => setStatus('success'), 1500);
        return () => clearTimeout(timeout);
    }, [donationId]);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-16">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex w-24 h-24 bg-green-500/10 rounded-full items-center justify-center ring-8 ring-green-500/5">
                            <ShieldCheck className="w-12 h-12 text-green-500" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-display font-bold">Thank You for Your Support!</h1>
                            <p className="text-xl text-muted-foreground">
                                Your donation has been received and is being processed.
                                Your generosity helps us continue our work in the Maasai community.
                            </p>
                            {donationId && (
                                <p className="text-sm text-muted-foreground font-mono">
                                    Ref: {donationId}
                                </p>
                            )}
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/10 space-y-4">
                            <Heart className="w-8 h-8 text-accent mx-auto" />
                            <h3 className="text-xl font-semibold">What happens next?</h3>
                            <p className="text-muted-foreground">
                                You will receive an email receipt shortly. Your contribution will be directly applied to our active programs.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/impact" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto rounded-xl gap-2">
                                    See Your Impact <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link to="/" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl">
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DonationSuccess;
