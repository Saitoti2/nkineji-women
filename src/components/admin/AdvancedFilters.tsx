import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface FilterOption {
    label: string;
    value: string;
}

export interface AdvancedFiltersProps {
    onFilterChange: (filters: any) => void;
    searchPlaceholder?: string;
    statusOptions?: FilterOption[];
    categoryOptions?: FilterOption[];
    showDateFilter?: boolean;
    className?: string;
}

export function AdvancedFilters({
    onFilterChange,
    searchPlaceholder = "Search...",
    statusOptions = [],
    categoryOptions = [],
    showDateFilter = true,
    className
}: AdvancedFiltersProps) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [category, setCategory] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilterUpdate();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterUpdate = () => {
        onFilterChange({
            search: search.trim() || undefined,
            status: status === 'all' ? undefined : status,
            category: category === 'all' ? undefined : category,
            startDate: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
            endDate: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
        });
    };

    // Update when status or category changes
    useEffect(() => {
        handleFilterUpdate();
    }, [status, category, dateRange]);

    const activeFilterCount = [
        status !== 'all',
        category !== 'all',
        dateRange.from !== undefined,
        dateRange.to !== undefined
    ].filter(Boolean).length;

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setCategory('all');
        setDateRange({ from: undefined, to: undefined });
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Main Action Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary/20"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                        className={cn(
                            "h-12 px-6 rounded-2xl font-bold bg-card border-none shadow-sm gap-2 shrink-0 md:hidden flex-grow",
                            activeFilterCount > 0 && "text-primary border-primary/20 bg-primary/5"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center bg-primary text-white border-none">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>

                    <div className="hidden md:flex items-center gap-2">
                        {statusOptions.length > 0 && (
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-12 min-w-[140px] rounded-2xl bg-card border-none shadow-sm font-medium">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-xl">
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statusOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {categoryOptions.length > 0 && (
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-12 min-w-[140px] rounded-2xl bg-card border-none shadow-sm font-medium">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-xl">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categoryOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {showDateFilter && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "h-12 px-4 rounded-2xl bg-card border-none shadow-sm font-medium gap-2",
                                            (dateRange.from || dateRange.to) && "text-primary"
                                        )}
                                    >
                                        <CalendarIcon className="w-4 h-4" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                <span className="text-xs">
                                                    {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                                                </span>
                                            ) : (
                                                <span className="text-xs">{format(dateRange.from, "MMM d")}</span>
                                            )
                                        ) : (
                                            <span>Date Range</span>
                                        )}
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange.from}
                                        selected={{ from: dateRange.from, to: dateRange.to }}
                                        onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}

                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                onClick={clearFilters}
                                className="h-12 px-4 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Dropdown */}
            {isMobileFiltersOpen && (
                <div className="md:hidden p-6 bg-card rounded-[2rem] border border-border shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold">Advanced Filters</h4>
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {statusOptions.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-12 w-full rounded-xl bg-muted/30 border-none shadow-inner">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all">All Status</SelectItem>
                                        {statusOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {categoryOptions.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Category</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="h-12 w-full rounded-xl bg-muted/30 border-none shadow-inner">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categoryOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showDateFilter && (
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Date Range</label>
                                <div className="p-4 bg-muted/30 rounded-xl shadow-inner">
                                    <Calendar
                                        mode="range"
                                        selected={{ from: dateRange.from, to: dateRange.to }}
                                        onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                                        numberOfMonths={1}
                                        className="mx-auto"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            className="flex-grow h-12 rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold"
                            onClick={() => setIsMobileFiltersOpen(false)}
                        >
                            Apply Filters
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-none bg-muted font-bold"
                            onClick={clearFilters}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
