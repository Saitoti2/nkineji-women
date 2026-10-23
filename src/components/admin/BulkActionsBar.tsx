import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

const API_BASE = import.meta.env.VITE_API_URL;

/** Matches the resource keys the bulk-delete endpoint accepts. */
export type BulkResource =
    | "campaigns" | "donations" | "beneficiaries"
    | "impact-stories" | "essentials" | "users";

interface BulkActionsBarProps {
    resource: BulkResource;
    /** What the rows are called, for the confirmation copy. */
    label: string;
    selectedIds: string[];
    /** Rows currently loaded, used to describe the "delete all" scope. */
    totalCount?: number;
    onDone: () => void;
    onClear: () => void;
    /** Hidden where wiping the whole table makes no sense, e.g. users. */
    allowDeleteAll?: boolean;
}

export function BulkActionsBar({
    resource, label, selectedIds, totalCount, onDone, onClear, allowDeleteAll = true,
}: BulkActionsBarProps) {
    const { accessToken } = useAuthStore();
    const [busy, setBusy] = useState(false);
    const [confirming, setConfirming] = useState<"selected" | "all" | null>(null);
    const [typed, setTyped] = useState("");

    if (selectedIds.length === 0 && !confirming) return null;

    const runDelete = async (all: boolean) => {
        setBusy(true);
        try {
            const res = await fetch(`${API_BASE}/admin/bulk-delete`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify(all ? { resource, all: true } : { resource, ids: selectedIds }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Bulk delete failed");

            toast.success(`Deleted ${data.data.deleted} ${label}${data.data.deleted === 1 ? "" : "s"}`);
            onClear();
            onDone();
        } catch (e: any) {
            toast.error(e.message || "Bulk delete failed");
        } finally {
            setBusy(false);
            setConfirming(null);
            setTyped("");
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 mb-4">
                <span className="text-sm font-semibold">
                    {selectedIds.length} selected
                </span>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onClick={onClear} className="rounded-xl">
                    <X className="w-4 h-4 mr-1" /> Clear
                </Button>
                <Button
                    variant="destructive" size="sm" className="rounded-xl"
                    disabled={busy || selectedIds.length === 0}
                    onClick={() => setConfirming("selected")}
                >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete selected
                </Button>
                {allowDeleteAll && (
                    <Button
                        variant="outline" size="sm"
                        className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
                        disabled={busy}
                        onClick={() => setConfirming("all")}
                    >
                        Delete all
                    </Button>
                )}
            </div>

            <AlertDialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
                <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirming === "all"
                                ? `Delete every ${label}?`
                                : `Delete ${selectedIds.length} ${label}${selectedIds.length === 1 ? "" : "s"}?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirming === "all" ? (
                                <>
                                    This removes <strong>every {label}</strong>
                                    {typeof totalCount === "number" ? ` (${totalCount} loaded)` : ""}, not just the
                                    ones selected. Type <strong>DELETE ALL</strong> below to confirm.
                                </>
                            ) : (
                                <>This removes the selected {label}s. They stop appearing in the admin and on the site.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {confirming === "all" && (
                        <Input
                            value={typed}
                            onChange={(e) => setTyped(e.target.value)}
                            placeholder="DELETE ALL"
                            className="rounded-xl"
                            autoFocus
                        />
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl" disabled={busy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={busy || (confirming === "all" && typed.trim() !== "DELETE ALL")}
                            onClick={(e) => {
                                e.preventDefault();
                                runDelete(confirming === "all");
                            }}
                        >
                            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {confirming === "all" ? "Delete everything" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
