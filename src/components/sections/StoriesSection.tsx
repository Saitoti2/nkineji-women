import { Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export function StoriesSection() {
  const navigate = useNavigate();

  const fetchStories = async () => {
    const res = await fetch(`${API_BASE}/impact-stories?status=published&limit=3`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch stories');
    return data.data;
  };

  const { data: stories = [] } = useQuery({
    queryKey: ['landing-stories'],
    queryFn: fetchStories,
  });

  return (
    <section id="stories" className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Impact Stories
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            Voices of <span className="text-primary italic">Transformation</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Real stories from women whose lives have been transformed through your generosity. Names changed for privacy; shared with consent.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story: any, idx: number) => (
            <div
              key={story.id}
              className="group relative bg-card p-10 rounded-[3rem] border border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-both cursor-pointer"
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => navigate(`/impact?storyId=${story.id}`)}
            >
              {/* Quote Icon */}
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Quote className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
              </div>

              {/* Quote */}
              <blockquote className="text-foreground font-medium leading-relaxed mb-10 text-lg sm:text-xl italic line-clamp-4">
                "{story.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-5 pt-8 border-t border-border/50">
                <img
                  src={getImageUrl(story.profile_image_url)}
                  alt={story.beneficiary_name}
                  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="min-w-0">
                  <div className="font-bold text-foreground text-lg">{story.beneficiary_name}, {story.beneficiary_age}</div>
                  <div className="text-sm text-muted-foreground truncate font-medium">{story.title}</div>
                </div>
              </div>

              {/* Impact Badge */}
              <div className="mt-8 px-6 py-4 rounded-2xl bg-muted/50 text-muted-foreground text-sm leading-relaxed border border-border/30 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
                <span className="font-bold text-primary uppercase tracking-wider text-[10px] block mb-1">Impact</span>
                {story.impact_summary}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button
            variant="secondary"
            size="lg"
            className="h-16 px-10 rounded-2xl text-lg font-bold group"
            onClick={() => navigate('/impact')}
          >
            Read More Impact Stories
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
