import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Heart, Clock, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL;

/** How long to keep checking while PesaPal has not settled the payment yet. */
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 5;

type DonationStatus = "succeeded" | "pending" | "failed" | "refunded";

interface StatusResponse {
    id: string;
    status: DonationStatus;
    amount: number;
    currency: string;
    isRecurring: boolean;
}

const DonationSuccess = () => {
    const [searchParams] = useSearchParams();
    const donationId = searchParams.get("donationId");

    const [data, setData] = useState<StatusResponse | null>(null);
    const [phase, setPhase] = useState<"checking" | "done" | "unavailable">("checking");
    const pollCount = useRef(0);

    const check = useCallback(async (): Promise<DonationStatus | null> => {
        if (!donationId) return null;
        try {
            const res = await fetch(`${API_BASE}/donations/${donationId}/status`);
            if (!res.ok) return null;
            const body = await res.json();
            if (!body?.success || !body.data) return null;
            setData(body.data);
            return body.data.status as DonationStatus;
        } catch {
            return null;
        }
    }, [donationId]);

    useEffect(() => {
        if (!donationId) {
            setPhase("unavailable");
            return;
        }

        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;

        const run = async () => {
            const status = await check();
            if (cancelled) return;

            if (status === null) {
                setPhase("unavailable");
                return;
            }

            // A payment can still be settling when the donor lands here, so keep
            // looking for a short while before telling them it is pending.
            if (status === "pending" && pollCount.current < MAX_POLLS) {
                pollCount.current += 1;
                timer = setTimeout(run, POLL_INTERVAL_MS);
                return;
            }

            setPhase("done");
        };

        run();
        return () => { cancelled = true; clearTimeout(timer); };
    }, [donationId, check]);

    const retry = () => {
        pollCount.current = 0;
        setPhase("checking");
        check().then((s) => setPhase(s === null ? "unavailable" : "done"));
    };

    const status = data?.status;
    const amountLabel = data ? formatMoney(data.amount, data.currency) : null;

    // Only a confirmed payment gets a thank-you; anything else says what is true.
    const view = (() => {
        if (phase === "checking") {
            return {
                icon: <Loader2 className="w-12 h-12 text-primary animate-spin" />,
                ring: "bg-primary/10 ring-primary/5",
                title: "Confirming your donation…",
                body: "We are checking with PesaPal. This usually takes a few seconds.",
            };
        }
        if (phase === "unavailable" || !status) {
            return {
                icon: <Clock className="w-12 h-12 text-muted-foreground" />,
                ring: "bg-muted ring-muted/40",
                title: "We could not confirm this yet",
                body: "If you completed the payment, it will still be recorded once PesaPal notifies us. Your reference is below — keep it if you need to contact us.",
            };
        }
        if (status === "succeeded") {
            return {
                icon: <ShieldCheck className="w-12 h-12 text-green-500" />,
                ring: "bg-green-500/10 ring-green-500/5",
                title: "Thank you for your support!",
                body: `Your donation${amountLabel ? ` of ${amountLabel}` : ""} has been received.${data?.isRecurring ? " Your monthly gift is now set up — PesaPal will email you before each payment, and you can cancel at any time." : ""} Your generosity helps us continue our work in the Maasai community.`,
            };
        }
        if (status === "pending") {
            return {
                icon: <Clock className="w-12 h-12 text-amber-500" />,
                ring: "bg-amber-500/10 ring-amber-500/5",
                title: "Your payment is still processing",
                body: "PesaPal has not confirmed this one yet. Mobile money can take a minute or two. You do not need to pay again — we will record it as soon as it clears.",
            };
        }
        if (status === "refunded") {
            return {
                icon: <RefreshCw className="w-12 h-12 text-muted-foreground" />,
                ring: "bg-muted ring-muted/40",
                title: "This payment was reversed",
                body: "PesaPal reports this payment as reversed, so nothing has been collected.",
            };
        }
        return {
            icon: <XCircle className="w-12 h-12 text-destructive" />,
            ring: "bg-destructive/10 ring-destructive/5",
            title: "That payment did not go through",
            body: "PesaPal did not complete this payment, so you have not been charged. You are welcome to try again whenever suits you.",
        };
    })();

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
                        <div className={`inline-flex w-24 h-24 rounded-full items-center justify-center ring-8 ${view.ring}`}>
                            {view.icon}
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-display font-bold">{view.title}</h1>
                            <p className="text-xl text-muted-foreground">{view.body}</p>
                            {donationId && (
                                <p className="text-sm text-muted-foreground font-mono">
                                    Ref: {donationId}
                                </p>
                            )}
                        </div>

                        {status === "succeeded" && (
                            <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/10 space-y-4">
                                <Heart className="w-8 h-8 text-accent mx-auto" />
                                <h3 className="text-xl font-semibold">What happens next?</h3>
                                <p className="text-muted-foreground">
                                    You will receive an email receipt shortly. Your contribution will be directly applied to our active programs.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {(status === "pending" || phase === "unavailable") && (
                                <Button size="lg" variant="outline" onClick={retry} className="w-full sm:w-auto rounded-xl gap-2">
                                    <RefreshCw className="w-4 h-4" /> Check again
                                </Button>
                            )}
                            {(status === "failed" || status === "refunded") && (
                                <Link to="/#donate" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto rounded-xl gap-2">
                                        Try again <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            )}
                            {status === "succeeded" && (
                                <Link to="/impact" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto rounded-xl gap-2">
                                        See Your Impact <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            )}
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
