import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    className?: string;
    label?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function BackButton({ className, label = "Back", variant = "ghost" }: BackButtonProps) {
    const navigate = useNavigate();

    return (
        <Button
            variant={variant}
            className={cn("gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors", className)}
            onClick={() => navigate(-1)}
        >
            <ArrowLeft className="w-4 h-4" />
            {label}
        </Button>
    );
}
