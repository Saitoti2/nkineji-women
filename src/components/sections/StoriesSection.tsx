import { Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stories = [
  {
    id: 1,
    name: "Nashipai M.",
    age: 24,
    program: "Education → Micro-Enterprise",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face",
    quote: "I was rescued at 12, sponsored through school, and now I run my own beadwork business employing 8 other women. My daughters will never face what I did.",
    impact: "Business owner, 8 employees, supporting 3 siblings through school",
  },
  {
    id: 2,
    name: "Grace K.",
    age: 35,
    program: "Savings Group → Healthcare",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face",
    quote: "The savings group changed everything. When I needed cancer treatment, my sisters contributed. Now I help other women access healthcare they couldn't afford alone.",
    impact: "Cancer survivor, savings group leader, 45 women in her network",
  },
  {
    id: 3,
    name: "Faith N.",
    age: 19,
    program: "Rescue → University",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    quote: "I'm the first girl in my village to attend university. I'm studying nursing so I can return and help other women in my community.",
    impact: "First-generation university student, future healthcare worker",
  },
];

export function StoriesSection() {
  return (
    <section id="stories" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Impact Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Voices of <span className="text-secondary">Transformation</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real stories from women whose lives have been transformed through your generosity. Names changed for privacy; shared with consent.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {stories.map((story) => (
            <div key={story.id} className="float-card p-6 sm:p-8 flex flex-col">
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Quote className="w-5 h-5 text-accent" />
              </div>

              {/* Quote */}
              <blockquote className="text-foreground font-medium leading-relaxed mb-6 flex-grow">
                "{story.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground">{story.name}, {story.age}</div>
                  <div className="text-sm text-muted-foreground">{story.program}</div>
                </div>
              </div>

              {/* Impact Badge */}
              <div className="mt-4 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs">
                <span className="font-semibold text-foreground">Impact:</span> {story.impact}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button variant="secondary" size="lg">
            Read More Stories
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
