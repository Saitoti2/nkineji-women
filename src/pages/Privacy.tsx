import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield } from "lucide-react";

const Privacy = () => {
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
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-4xl font-display font-bold">Privacy Policy</h1>
                        </div>

                        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
                                <p>
                                    Nkineji Community Initiative (NKCI) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or interact with our programs.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
                                <p>
                                    We may collect personal information such as your name, email address, phone number, and mailing address when you:
                                </p>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>Inquire about our programs or services.</li>
                                    <li>Sign up for our newsletter.</li>
                                    <li>Make a donation.</li>
                                    <li>Volunteer or apply for opportunities.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
                                <p>
                                    Your information is used to:
                                </p>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>Provide and improve our community services.</li>
                                    <li>Communicate updates about our mission and impact.</li>
                                    <li>Process donations and provide receipts.</li>
                                    <li>Comply with legal and regulatory requirements.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
                                <p>
                                    We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us at:
                                    <br />
                                    Email: nkinejiwomeninitiative@gmail.com
                                    <br />
                                    Phone: +254 792 848 665
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

export default Privacy;
