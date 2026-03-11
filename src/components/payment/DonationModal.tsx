import { useState, useEffect, useCallback } from "react";
import { useDonationStore } from "@/stores/donationStore";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, RefreshCw, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { currencyService } from "@/services/currencyService";

// Base preset amounts defined in USD
const BASE_PRESET_AMOUNTS_USD = [10, 25, 50, 100, 250, 500];

type Currency = 'USD' | 'KES';

export function DonationModal() {
    const { isOpen, closeDonationModal } = useDonationStore();
    const [currency, setCurrency] = useState<Currency>('USD');
    const [amount, setAmount] = useState<number>(50);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [selectedPresetUSD, setSelectedPresetUSD] = useState<number>(50);
    const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing'>('idle');
    const [kesRate, setKesRate] = useState<number>(128); // fallback rate
    const [rateLoading, setRateLoading] = useState(true);

    // Fetch live KES rate on mount
    useEffect(() => {
        const loadRate = async () => {
            try {
                setRateLoading(true);
                const rates = await currencyService.getExchangeRates();
                if (rates['KES']) setKesRate(rates['KES']);
            } catch {
                // silently use fallback rate
            } finally {
                setRateLoading(false);
            }
        };
        loadRate();
    }, []);

    // Convert USD amount to KES
    const toKES = useCallback((usdAmount: number) => Math.round(usdAmount * kesRate), [kesRate]);

    // Preset amounts shown in active currency
    const presetAmounts = BASE_PRESET_AMOUNTS_USD.map(usd => ({
        usd,
        display: currency === 'USD' ? usd : toKES(usd),
    }));

    const handlePresetSelect = (usd: number) => {
        setSelectedPresetUSD(usd);
        setCustomAmount("");
        setAmount(currency === 'USD' ? usd : toKES(usd));
    };

    const handleCurrencySwitch = (newCurrency: Currency) => {
        setCurrency(newCurrency);
        setCustomAmount("");
        if (newCurrency === 'USD') {
            setAmount(selectedPresetUSD);
        } else {
            setAmount(toKES(selectedPresetUSD));
        }
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!isNaN(Number(val))) {
            setCustomAmount(val);
            setAmount(Number(val));
        }
    };

    // The backend always needs USD amount + currency for PesaPal conversion
    const getPayloadAmount = () => amount;
    const getPayloadCurrency = () => currency;

    const handleInitiatePayment = async () => {
        if (!amount || amount <= 0) return;
        setPaymentStatus('processing');
        try {
            const API_BASE = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_BASE}/donations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: getPayloadAmount(),
                    currency: getPayloadCurrency(),
                    paymentMethod: 'pesapal',
                    isRecurring: frequency === 'monthly',
                })
            });
            const data = await res.json();
            if (data.success && data.data.clientSecret) {
                window.location.href = data.data.clientSecret;
            } else {
                const errorMsg = data.error || data.message || 'Unknown error';
                if (errorMsg.includes('IPN ID')) {
                    alert('PesaPal Configuration Error: IPN ID is missing. Contact support.');
                } else {
                    alert('PesaPal payment failed: ' + errorMsg);
                }
                setPaymentStatus('idle');
            }
        } catch {
            setPaymentStatus('idle');
            alert('Connection error. Please try again.');
        }
    };

    const handleClose = () => {
        setPaymentStatus('idle');
        closeDonationModal();
    };

    const symbol = currency === 'USD' ? '$' : 'KSh';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[90vw] max-w-[480px] max-h-[90vh] overflow-y-auto scrollbar-hide p-6 rounded-[2.5rem] bg-background/95 backdrop-blur-xl border border-white/20">

                <div className="space-y-2 text-center pb-2">
                    <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
                        Support Our Mission
                    </DialogTitle>
                </div>

                <DialogDescription className="sr-only">
                    Donate via PesaPal securely in USD or KES.
                </DialogDescription>

                {/* Live Rate Badge */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-full px-3 py-1.5 w-fit mx-auto mb-1">
                    {rateLoading
                        ? <><RefreshCw className="w-3 h-3 animate-spin" /> Fetching live rate...</>
                        : <><TrendingUp className="w-3 h-3 text-emerald-500" /> 1 USD ≈ KES {kesRate.toLocaleString()}</>
                    }
                </div>

                <div className="space-y-5">
                    {/* Frequency tabs */}
                    <Tabs value={frequency} onValueChange={(v) => setFrequency(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 rounded-2xl">
                            <TabsTrigger value="once" className="rounded-xl h-[90%] font-semibold">One-time</TabsTrigger>
                            <TabsTrigger value="monthly" className="rounded-xl h-[90%] font-semibold">Monthly</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Currency switch */}
                    <div className="flex justify-center space-x-2">
                        <Button
                            variant={currency === 'USD' ? 'default' : 'outline'}
                            onClick={() => handleCurrencySwitch('USD')}
                            size="sm"
                            className="min-w-[70px]"
                        >
                            🇺🇸 USD
                        </Button>
                        <Button
                            variant={currency === 'KES' ? 'default' : 'outline'}
                            onClick={() => handleCurrencySwitch('KES')}
                            size="sm"
                            className="min-w-[70px]"
                        >
                            🇰🇪 KES
                        </Button>
                    </div>

                    {/* Preset amount grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {presetAmounts.map(({ usd, display }) => (
                            <Button
                                key={usd}
                                variant="outline"
                                className={cn(
                                    "h-12 rounded-xl font-bold text-sm",
                                    selectedPresetUSD === usd && !customAmount
                                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                                        : ""
                                )}
                                onClick={() => handlePresetSelect(usd)}
                            >
                                {symbol}{display.toLocaleString()}
                            </Button>
                        ))}
                    </div>

                    {/* Custom amount */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">
                            {symbol}
                        </span>
                        <Input
                            type="number"
                            placeholder="Custom Amount"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            className="h-14 rounded-xl text-lg font-bold text-center pl-10"
                        />
                    </div>

                    {/* Equivalent display */}
                    {amount > 0 && (
                        <p className="text-center text-xs text-muted-foreground">
                            {currency === 'USD'
                                ? `≈ KES ${toKES(amount).toLocaleString()} at today's rate`
                                : `≈ USD ${(amount / kesRate).toFixed(2)} at today's rate`}
                        </p>
                    )}

                    {/* Payment method */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Payment Method</Label>
                        <div className="p-4 rounded-2xl border-2 border-primary bg-white flex items-center justify-center min-h-[70px] cursor-pointer overflow-hidden shadow-sm">
                            <img
                                src="/pesapal-logo.png"
                                alt="PesaPal"
                                className="w-full object-contain max-h-[40px] px-4"
                            />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                            Accepts M-PESA, Airtel Money, Visa, Mastercard
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 rounded-xl text-lg font-bold"
                        onClick={handleInitiatePayment}
                        disabled={paymentStatus === 'processing' || !amount || amount <= 0}
                    >
                        {paymentStatus === 'processing'
                            ? 'Redirecting to PesaPal...'
                            : `Donate ${symbol}${amount.toLocaleString()}`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
