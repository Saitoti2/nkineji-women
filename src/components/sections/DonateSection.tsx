import { useState } from "react";
import { Heart, Check, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDonationStore } from "@/stores/donationStore";

const amounts = [25, 50, 100, 250, 500, 1000];

const impactExamples = [
  { amount: 25, impact: "School supplies for one girl for a term" },
  { amount: 50, impact: "One month of maternal care visits" },
  { amount: 100, impact: "Emergency rescue and transport" },
  { amount: 250, impact: "Full school sponsorship for one term" },
  { amount: 500, impact: "Seed capital for a micro-business" },
  { amount: 1000, impact: "Complete rescue and rehabilitation" },
];

export function DonateSection() {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [isRecurring, setIsRecurring] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const { openDonationModal } = useDonationStore();

  const activeAmount = customAmount ? parseInt(customAmount) : selectedAmount;
  const currentImpact = impactExamples.find(ex => ex.amount <= activeAmount)?.impact || impactExamples[0].impact;

  const handleDonateClick = () => {
    // In a future iteration, we could pass selectedAmount/isRecurring to the modal via the store
    openDonationModal();
  };

  return (
    <section id="donate" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Floating Card */}
          <div className="float-card-static p-8 sm:p-12 shadow-float-xl">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
                <Heart className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Make Your Impact Today
              </h2>
              <p className="text-muted-foreground">
                100% of your donation goes directly to supporting Maasai women and girls.
              </p>
            </div>

            {/* Donation Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-2xl bg-muted p-1.5">
                <button
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${!isRecurring
                    ? "bg-card text-foreground shadow-float"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  onClick={() => setIsRecurring(false)}
                >
                  One-Time
                </button>
                <button
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${isRecurring
                    ? "bg-card text-foreground shadow-float"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  onClick={() => setIsRecurring(true)}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  className={`py-4 rounded-xl font-semibold transition-all ${selectedAmount === amount && !customAmount
                    ? "bg-primary text-primary-foreground shadow-float"
                    : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground font-medium"
                />
              </div>
            </div>

            {/* Impact Preview */}
            <div className="mb-8 p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    ${activeAmount || 0} {isRecurring && "/month"} can provide:
                  </div>
                  <div className="text-muted-foreground text-sm">{currentImpact}</div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 mb-8">
              <Button variant="donate" size="xl" className="w-full" onClick={handleDonateClick}>
                <CreditCard className="w-5 h-5 mr-2" />
                Donate with Card
              </Button>
              <Button variant="secondary" size="lg" className="w-full" onClick={handleDonateClick}>
                <Smartphone className="w-5 h-5 mr-2" />
                Donate with M-PESA
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary" />
                Tax-deductible
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary" />
                Secure payment
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary" />
                Instant receipt
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
