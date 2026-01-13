import { useState, useEffect } from "react";
import { useDonationStore } from "@/stores/donationStore";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, CreditCard, Smartphone, ShieldCheck, Globe, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { StripePaymentForm } from "./StripePaymentForm";

const PRESET_AMOUNTS = {
    USD: [10, 25, 50, 100, 250, 500],
    KES: [1000, 2500, 5000, 10000, 25000, 50000]
};

const IMPACT_METRICS = {
    USD: {
        10: "Provides sanitary kits for 2 girls",
        25: "Support a child's school fees for a month",
        50: "Plant 10 indigenous trees in the Mara",
        100: "Fund a micro-loan for a woman entrepreneur",
        250: "Sponsor a rescue mission for a girl at risk",
        500: "Clean water access for a family for a year"
    },
    KES: {
        1000: "Provides sanitary kits for 2 girls",
        2500: "Support a child's school fees for a month",
        5000: "Plant 10 indigenous trees in the Mara",
        10000: "Fund a micro-loan for a woman entrepreneur",
        25000: "Sponsor a rescue mission for a girl at risk",
        50000: "Clean water access for a family for a year"
    }
};

type PaymentMethod = 'card' | 'mpesa' | 'bank';

interface PaymentInstructs {
    mpesa?: any;
    bank_transfer?: any;
}

export function DonationModal() {
    const { isOpen, closeDonationModal } = useDonationStore();
    const [currency, setCurrency] = useState<'USD' | 'KES'>('USD');
    const [amount, setAmount] = useState<number>(50);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [instructions, setInstructions] = useState<PaymentInstructs>({});

    useEffect(() => {
        if (isOpen) {
            // Fetch payment settings
            const fetchSettings = async () => {
                try {
                    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
                    const res = await fetch(`${API_BASE}/settings/payments`);
                    const data = await res.json();
                    if (data.success) {
                        setInstructions(data.data);
                    }
                } catch (e) {
                    console.error("Failed to fetch payment settings", e);
                }
            };
            fetchSettings();
        }
    }, [isOpen]);

    const handleAmountSelect = (val: number) => {
        setAmount(val);
        setCustomAmount("");
        setClientSecret(null); // Reset stripe secret on amount change
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!isNaN(Number(val))) {
            setCustomAmount(val);
            setAmount(Number(val));
            setClientSecret(null);
        }
    };

    const handleInitiatePayment = async () => {
        if (paymentMethod === 'card') {
            setPaymentStatus('processing');
            try {
                const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
                if (!stripeKey) {
                    alert('Stripe configuration missing (Key). Please contact admin.');
                    setPaymentStatus('idle');
                    return;
                }

                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
                const res = await fetch(`${API_BASE}/donations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount,
                        currency,
                        paymentMethod: 'stripe',
                        isRecurring: frequency === 'monthly'
                    })
                });
                const data = await res.json();
                if (data.success && data.data.clientSecret) {
                    setClientSecret(data.data.clientSecret);
                    setPaymentStatus('idle'); // Ready for Stripe Form
                } else {
                    alert('Failed to initiate payment');
                    setPaymentStatus('idle');
                }
            } catch (e) {
                console.error(e);
                setPaymentStatus('idle');
                alert('Connection error');
            }
        } else {
            // Manual Methods: Just show success/instructions
            // Ideally we create a 'pending' donation here too for tracking?
            // For now, let's just show the instructions as per user request "let admin be able to add mpesa details... to be cashed"
            // which implies they just want to see where to send money.
        }
    };

    const handleSuccess = () => {
        setPaymentStatus('success');
        setClientSecret(null);
    };

    const handleClose = () => {
        if (paymentStatus === 'success') {
            setTimeout(() => {
                setPaymentStatus('idle');
                setAmount(50);
                setPaymentMethod('card');
            }, 500);
        }
        closeDonationModal();
    };

    if (paymentStatus === 'success') {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-[2.5rem] bg-background/95 backdrop-blur-xl border border-white/20">
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center animate-in zoom-in duration-500 ring-8 ring-green-500/5">
                            <ShieldCheck className="w-12 h-12 text-green-500 drop-shadow-sm" />
                        </div>
                        <DialogTitle className="text-3xl font-bold">Thank You!</DialogTitle>
                        <DialogDescription className="text-lg text-muted-foreground">
                            Your donation of {currency} {amount} was successful.
                        </DialogDescription>
                        <Button size="lg" className="w-full rounded-xl" onClick={handleClose}>Done</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[90vw] max-w-[480px] max-h-[85vh] overflow-y-auto scrollbar-hide p-6 rounded-[2.5rem] bg-background/95 backdrop-blur-xl border border-white/20">

                <div className="space-y-2 text-center pb-2">
                    <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
                        Support Our Mission
                    </DialogTitle>
                </div>

                <DialogDescription className="sr-only">
                    Choose a payment method and amount to donate.
                </DialogDescription>

                {/* Amount & Frequency (Only show if not in Stripe Element mode or if we want to allow back) */}
                {!clientSecret ? (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <Tabs value={frequency} onValueChange={(v) => setFrequency(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 rounded-2xl">
                                    <TabsTrigger value="once" className="rounded-xl h-[90%] font-semibold">One-time</TabsTrigger>
                                    <TabsTrigger value="monthly" className="rounded-xl h-[90%] font-semibold">Monthly</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Currency Toggle */}
                        <div className="flex justify-center space-x-2">
                            <Button variant={currency === 'USD' ? 'default' : 'outline'} onClick={() => setCurrency('USD')} size="sm">USD</Button>
                            <Button variant={currency === 'KES' ? 'default' : 'outline'} onClick={() => setCurrency('KES')} size="sm">KES</Button>
                        </div>

                        {/* Presets */}
                        <div className="grid grid-cols-3 gap-3">
                            {PRESET_AMOUNTS[currency].map((val) => (
                                <Button
                                    key={val}
                                    variant="outline"
                                    className={cn("h-12 rounded-xl font-bold", amount === val && !customAmount && "border-primary bg-primary/10 text-primary")}
                                    onClick={() => handleAmountSelect(val)}
                                >
                                    {currency === 'USD' ? '$' : 'KSh'}{val.toLocaleString()}
                                </Button>
                            ))}
                        </div>
                        <Input
                            type="number"
                            placeholder="Custom Amount"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            className="h-14 rounded-xl text-lg font-bold text-center"
                        />

                        {/* Payment Methods */}
                        <div className="space-y-3">
                            <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Payment Method</Label>
                            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 'card', label: 'Card', icon: CreditCard },
                                    { value: 'mpesa', label: 'M-Pesa', icon: Smartphone },
                                    { value: 'bank', label: 'Bank', icon: Building },
                                ].map((method) => (
                                    <div key={method.value} className="contents">
                                        <RadioGroupItem value={method.value} id={method.value} className="peer sr-only" />
                                        <Label
                                            htmlFor={method.value}
                                            className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-border/50 cursor-pointer hover:bg-muted/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary transition-all"
                                        >
                                            <method.icon className="w-6 h-6 mb-1" />
                                            <span className="text-xs font-semibold">{method.label}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Content based on Method */}
                        {paymentMethod === 'card' && (
                            <Button
                                size="lg"
                                className="w-full h-14 rounded-xl text-lg font-bold"
                                onClick={handleInitiatePayment}
                                disabled={paymentStatus === 'processing'}
                            >
                                {paymentStatus === 'processing' ? 'Processing...' : `Donate ${currency === 'USD' ? '$' : 'KSh'} ${amount.toLocaleString()}`}
                            </Button>
                        )}

                        {paymentMethod === 'mpesa' && instructions.mpesa && (
                            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 text-sm space-y-3">
                                <h4 className="font-bold text-lg flex items-center gap-2"><Smartphone className="w-5 h-5" /> M-Pesa Instructions</h4>
                                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                    <span className="font-semibold">Paybill:</span> <span className="text-foreground font-mono">{instructions.mpesa.paybill}</span>
                                    <span className="font-semibold">Account:</span> <span className="text-foreground font-mono">{instructions.mpesa.accountNumber}</span>
                                    {instructions.mpesa.phoneNumber && <><span className="font-semibold">Phone:</span> <span className="text-foreground font-mono">{instructions.mpesa.phoneNumber}</span></>}
                                </div>
                                <p className="pt-2 italic border-t border-border/30">{instructions.mpesa.instructions}</p>
                            </div>
                        )}

                        {paymentMethod === 'bank' && instructions.bank_transfer && (
                            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 text-sm space-y-3">
                                <h4 className="font-bold text-lg flex items-center gap-2"><Building className="w-5 h-5" /> Bank Transfer</h4>
                                <div className="space-y-1 text-muted-foreground">
                                    <div className="flex justify-between border-b border-border/30 pb-1"><span>Bank Name:</span> <span className="text-foreground font-semibold">{instructions.bank_transfer.bankName}</span></div>
                                    <div className="flex justify-between border-b border-border/30 pb-1"><span>Account Name:</span> <span className="text-foreground font-semibold">{instructions.bank_transfer.accountName}</span></div>
                                    <div className="flex justify-between border-b border-border/30 pb-1"><span>Account No:</span> <span className="text-foreground font-semibold">{instructions.bank_transfer.accountNumber}</span></div>
                                    <div className="flex justify-between"><span>Swift Code:</span> <span className="text-foreground font-mono">{instructions.bank_transfer.swiftCode}</span></div>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    // Stripe Elements View
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Complete Payment</h3>
                            <Button variant="ghost" size="sm" onClick={() => setClientSecret(null)}>Change Method</Button>
                        </div>
                        <StripePaymentForm
                            clientSecret={clientSecret}
                            amount={amount}
                            onSuccess={handleSuccess}
                            onError={(msg) => alert(msg)}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
