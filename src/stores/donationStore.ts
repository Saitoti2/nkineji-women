import { create } from 'zustand';

interface DonationStore {
    isOpen: boolean;
    campaignId?: string;
    campaignTitle?: string;
    openDonationModal: (campaignId?: string, campaignTitle?: string) => void;
    closeDonationModal: () => void;
}

/**
 * Guards against a handler being passed by reference, e.g. onClick={open},
 * which hands React's click event to the first parameter. The value ends up in
 * the donation request, where the API requires campaignId to be a UUID, so the
 * payment is rejected. Anything that is not a string is dropped.
 */
const asOptionalString = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() !== '' ? value : undefined;

export const useDonationStore = create<DonationStore>((set) => ({
    isOpen: false,
    campaignId: undefined,
    campaignTitle: undefined,
    openDonationModal: (campaignId, campaignTitle) => set({
        isOpen: true,
        campaignId: asOptionalString(campaignId),
        campaignTitle: asOptionalString(campaignTitle)
    }),
    closeDonationModal: () => set({
        isOpen: false,
        campaignId: undefined,
        campaignTitle: undefined
    }),
}));
