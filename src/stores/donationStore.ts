import { create } from 'zustand';

interface DonationStore {
    isOpen: boolean;
    openDonationModal: () => void;
    closeDonationModal: () => void;
}

export const useDonationStore = create<DonationStore>((set) => ({
    isOpen: false,
    openDonationModal: () => set({ isOpen: true }),
    closeDonationModal: () => set({ isOpen: false }),
}));
