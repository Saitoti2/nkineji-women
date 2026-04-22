import { create } from 'zustand';

interface DonationStore {
    isOpen: boolean;
    campaignId?: string;
    campaignTitle?: string;
    openDonationModal: (campaignId?: string, campaignTitle?: string) => void;
    closeDonationModal: () => void;
}

export const useDonationStore = create<DonationStore>((set) => ({
    isOpen: false,
    campaignId: undefined,
    campaignTitle: undefined,
    openDonationModal: (campaignId, campaignTitle) => set({
        isOpen: true,
        campaignId,
        campaignTitle
    }),
    closeDonationModal: () => set({
        isOpen: false,
        campaignId: undefined,
        campaignTitle: undefined
    }),
}));
