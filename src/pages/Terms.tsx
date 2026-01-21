import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

const Terms = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-secondary" />
                            </div>
                            <h1 className="text-4xl font-display font-bold">Terms of Service</h1>
                        </div>

                        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                                <p>
                                    By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use of License</h2>
                                <p>
                                    Permission is granted to temporarily download one copy of the materials on Nkineji Community Initiative's website for personal, non-commercial transitory viewing only.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Disclaimer</h2>
                                <p>
                                    The materials on NKCI's website are provided on an 'as is' basis. NKCI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Limitations</h2>
                                <p>
                                    In no event shall NKCI or its partners be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Governing Law</h2>
                                <p>
                                    These terms and conditions are governed by and construed in accordance with the laws of Kenya and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Terms;
