import { useState } from "react";
import { Heart, Check, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const activeAmount = customAmount ? parseInt(customAmount) : selectedAmount;
  const currentImpact = impactExamples.find(ex => ex.amount <= activeAmount)?.impact || impactExamples[0].impact;

  return (
<<<<<<< HEAD
    <section id="donate" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-secondary via-secondary/95 to-secondary">
      <div className="container mx-auto px-4 sm:px-6">
=======
    <section id="donate" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
>>>>>>> main
        <div className="max-w-4xl mx-auto">
          {/* Floating Card */}
          <div className="float-card p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 shadow-float-xl hover:shadow-float-xl hover:scale-[1.01] transition-all duration-500">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-accent/10 mb-3 sm:mb-4">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3 leading-tight">
                Make Your Impact Today
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base px-2">
                100% of your donation goes directly to supporting Maasai women and girls.
              </p>
            </div>

            {/* Donation Type Toggle */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="inline-flex rounded-xl sm:rounded-2xl bg-muted p-1 sm:p-1.5">
                <button
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
                    !isRecurring 
                      ? "bg-card text-foreground shadow-float" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsRecurring(false)}
                >
                  One-Time
                </button>
                <button
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
                    isRecurring 
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
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  className={`py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm min-h-[44px] ${
                    selectedAmount === amount && !customAmount
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
            <div className="mb-6 sm:mb-8">
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm sm:text-base">$</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-muted border-2 border-transparent focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground font-medium text-sm sm:text-base min-h-[44px]"
                />
              </div>
            </div>

            {/* Impact Preview */}
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm sm:text-base">
                    ${activeAmount || 0} {isRecurring && "/month"} can provide:
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{currentImpact}</div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 mb-6 sm:mb-8">
              <Button variant="donate" size="xl" className="w-full min-h-[52px] sm:min-h-[56px] md:min-h-[64px] text-sm sm:text-base md:text-lg">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Donate with Card
              </Button>
              <Button variant="secondary" size="lg" className="w-full min-h-[48px] sm:min-h-[52px] md:min-h-[56px] text-sm sm:text-base">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                Donate with M-PESA
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
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
