import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Landmark, TrendingUp, Users, Heart } from "lucide-react";

const Finances = () => {
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
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                                <Landmark className="w-6 h-6 text-accent" />
                            </div>
                            <h1 className="text-4xl font-display font-bold">Financial Transparency</h1>
                        </div>

                        <p className="text-xl text-muted-foreground mb-12">
                            At Nkineji Community Initiative, we believe in radical transparency. Every shilling donated is an investment in the future of Maasai women and girls.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {[
                                {
                                    icon: Users,
                                    title: "Direct Impact",
                                    description: "85% of all funds are used directly for community programs and sponsorships.",
                                    color: "text-blue-500",
                                    bg: "bg-blue-500/10"
                                },
                                {
                                    icon: TrendingUp,
                                    title: "Local Growth",
                                    description: "We source materials and labor locally to stimulate the Maasai Mara economy.",
                                    color: "text-green-500",
                                    bg: "bg-green-500/10"
                                },
                                {
                                    icon: Heart,
                                    title: "Sustainability",
                                    description: "We invest in long-term infrastructure like safe houses and mobile clinics.",
                                    color: "text-red-500",
                                    bg: "bg-red-500/10"
                                },
                                {
                                    icon: Landmark,
                                    title: "Accountability",
                                    description: "Annual audits and reports are shared with our community and partners.",
                                    color: "text-amber-500",
                                    bg: "bg-amber-500/10"
                                }
                            ].map((item, index) => (
                                <div key={index} className="p-6 rounded-2xl border bg-card/50">
                                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm">{item.description}</p>
                                </div>
                            ))}
                        </div>

                        <section className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Financial Reports</h2>
                            <p>
                                Our annual financial reports are prepared in accordance with Kenyan standards for non-profit organizations. We are committed to ensuring that our donors' contributions are utilized effectively and ethically.
                            </p>
                            <p className="mt-4">
                                For detailed financial statements or specific inquiries regarding our funding, please contact our finance department at <span className="text-foreground font-medium">nkinejiwomeninitiative@gmail.com</span>.
                            </p>
                        </section>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Finances;
