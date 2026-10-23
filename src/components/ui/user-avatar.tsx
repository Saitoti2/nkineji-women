import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getImageUrl } from "@/lib/utils";

/**
 * A person's avatar that can never render as a broken image.
 *
 * Three things used to go wrong, in different places:
 *  - a placeholder path was passed as the image source, so the image loaded
 *    successfully and the initials fallback never got a chance to show;
 *  - the placeholder pointed at a file that does not exist, and the onError
 *    handler reassigned that same missing path, so it retried forever;
 *  - a stored relative path was used verbatim, so it resolved against the
 *    frontend origin rather than the API host.
 *
 * Here there is no placeholder image at all. When there is no usable source,
 * or the source fails to load, Radix falls through to initials — which is what
 * a missing avatar should look like.
 */

/** Initials from a name ("Nemama Nchorira" -> "NN"), else the email's first letter. */
export function getInitials(name?: string | null, email?: string | null): string {
    const cleaned = name?.trim();

    if (cleaned) {
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
    }

    const localPart = email?.trim();
    if (localPart) return localPart[0].toUpperCase();

    return "";
}

/**
 * Google profile photos rate-limit and expire, which is why they were being
 * proxied. Kept centrally so every avatar benefits, not just comments.
 */
function resolveAvatarSrc(src?: string | null): string | undefined {
    const value = src?.trim();
    if (!value) return undefined;

    if (value.startsWith("blob:") || value.startsWith("data:")) return value;

    const isGooglePhoto = /^https:\/\/lh\d+\.googleusercontent\.com\//.test(value);
    if (isGooglePhoto) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        if (cloudName) {
            return `https://res.cloudinary.com/${cloudName}/image/fetch/c_fill,w_128,h_128,q_auto,f_auto/${encodeURIComponent(value)}`;
        }
        return value;
    }

    // Relative paths are stored against the API host, not the frontend origin.
    // getImageUrl handles that; the empty placeholder keeps it from inventing one.
    return getImageUrl(value, "");
}

export interface UserAvatarProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
    src?: string | null;
    name?: string | null;
    email?: string | null;
    /** Shown instead of the stored image, e.g. a local preview while uploading. */
    previewSrc?: string | null;
    fallbackClassName?: string;
}

export const UserAvatar = React.forwardRef<
    React.ElementRef<typeof Avatar>,
    UserAvatarProps
>(({ src, name, email, previewSrc, className, fallbackClassName, ...props }, ref) => {
    const resolved = previewSrc || resolveAvatarSrc(src);
    const initials = getInitials(name, email);

    return (
        <Avatar ref={ref} className={cn("bg-muted", className)} {...props}>
            {/* Rendered only when there is something real to load, so a missing
                avatar goes straight to the fallback instead of a failed request. */}
            {resolved ? <AvatarImage src={resolved} alt={name || email || "User"} /> : null}
            <AvatarFallback
                className={cn("bg-primary/10 text-primary font-semibold", fallbackClassName)}
                delayMs={resolved ? 300 : 0}
            >
                {initials || <UserSilhouette />}
            </AvatarFallback>
        </Avatar>
    );
});
UserAvatar.displayName = "UserAvatar";

/** Used only when there is no name or email to derive initials from. */
function UserSilhouette() {
    return (
        <svg viewBox="0 0 100 100" className="h-full w-full text-muted-foreground/60" aria-hidden="true">
            <circle cx="50" cy="36" r="18" fill="currentColor" />
            <ellipse cx="50" cy="82" rx="28" ry="20" fill="currentColor" />
        </svg>
    );
}
