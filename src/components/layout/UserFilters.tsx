import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface FilterOption {
    label: string;
    value: string;
}

interface UserFiltersProps {
    onSearchChange: (query: string) => void;
    onCategoryChange: (category: string) => void;
    categories: FilterOption[];
    searchPlaceholder?: string;
    className?: string;
}

export function UserFilters({
    onSearchChange,
    onCategoryChange,
    categories,
    searchPlaceholder = "Search...",
    className
}: UserFiltersProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, onSearchChange]);

    const handleCategorySelect = (value: string) => {
        setSelectedCategory(value);
        onCategoryChange(value);
    };

    const currentCategoryLabel = categories.find(c => c.value === selectedCategory)?.label || 'All Categories';

    return (
        <div className={cn(
            "flex flex-col md:flex-row gap-6 p-6 bg-card/60 backdrop-blur-xl rounded-[2.5rem] border border-border/40 shadow-2xl shadow-black/5 animate-in fade-in slide-in-from-bottom-6 duration-700",
            className
        )}>
            {/* Search Input */}
            <div className="relative flex-grow group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-300 group-hover:scale-110" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 h-14 bg-background/50 border-none rounded-2xl shadow-inner focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-300 group-hover:bg-background"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/80 transition-colors"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                )}
            </div>

            {/* Desktop Categories (Horizontal scroll or buttons) */}
            <div className="hidden lg:flex items-center gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => handleCategorySelect(cat.value)}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-500 hover:scale-105 active:scale-95",
                            selectedCategory === cat.value
                                ? "bg-primary text-white shadow-xl shadow-primary/25"
                                : "bg-background/40 text-muted-foreground hover:bg-background hover:text-foreground"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Tablet/Large Mobile View (Dropdown) */}
            <div className="lg:hidden w-full md:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full md:w-60 h-14 rounded-2xl border-none bg-background/50 shadow-inner flex justify-between items-center px-6 hover:bg-background transition-all duration-300"
                        >
                            <span className="flex items-center gap-2 font-bold text-muted-foreground">
                                <Filter className="w-4 h-4 text-primary" />
                                {currentCategoryLabel}
                            </span>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 border-none shadow-2xl bg-card/95 backdrop-blur-xl">
                        {categories.map((cat) => (
                            <DropdownMenuItem
                                key={cat.value}
                                onClick={() => handleCategorySelect(cat.value)}
                                className={cn(
                                    "rounded-xl px-4 py-3 cursor-pointer mb-1 last:mb-0 font-medium transition-all",
                                    selectedCategory === cat.value
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "hover:bg-muted"
                                )}
                            >
                                {cat.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
