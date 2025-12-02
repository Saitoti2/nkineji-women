import { Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stories = [
  {
    id: 1,
    name: "Nashipai M.",
    age: 24,
    program: "Education → Micro-Enterprise",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=800&fit=crop&crop=face&q=80&auto=format",
    quote: "I was rescued at 12, sponsored through school, and now I run my own beadwork business employing 8 other women. My daughters will never face what I did.",
    impact: "Business owner, 8 employees, supporting 3 siblings through school",
  },
  {
    id: 2,
    name: "Grace K.",
    age: 35,
    program: "Savings Group → Healthcare",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=800&fit=crop&crop=face&q=80&auto=format",
    quote: "The savings group changed everything. When I needed cancer treatment, my sisters contributed. Now I help other women access healthcare they couldn't afford alone.",
    impact: "Cancer survivor, savings group leader, 45 women in her network",
  },
  {
    id: 3,
    name: "Faith N.",
    age: 19,
    program: "Rescue → University",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=800&fit=crop&crop=face&q=80&auto=format",
    quote: "I'm the first girl in my village to attend university. I'm studying nursing so I can return and help other women in my community.",
    impact: "First-generation university student, future healthcare worker",
  },
];

export function StoriesSection() {
  return (
    <section id="stories" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 float-card p-5 sm:p-6 md:p-8 lg:p-10">
          <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Impact Stories
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            Voices of <span className="text-secondary">Transformation</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
            Real stories from women whose lives have been transformed through your generosity. Names changed for privacy; shared with consent.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {stories.map((story) => (
            <div key={story.id} className="float-card p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col min-h-[300px] sm:min-h-[320px]">
              {/* Quote Icon */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>

              {/* Quote */}
              <blockquote className="text-foreground font-medium leading-relaxed mb-4 sm:mb-5 md:mb-6 flex-grow text-sm sm:text-base">
                "{story.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-5 md:pt-6 border-t border-border">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm sm:text-base">{story.name}, {story.age}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">{story.program}</div>
                </div>
              </div>

              {/* Impact Badge */}
              <div className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-muted text-muted-foreground text-[10px] sm:text-xs leading-relaxed">
                <span className="font-semibold text-foreground">Impact:</span> {story.impact}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <Button variant="secondary" size="lg" className="min-h-[48px] sm:min-h-[56px] text-sm sm:text-base">
            Read More Stories
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
