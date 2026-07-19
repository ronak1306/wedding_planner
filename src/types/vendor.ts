export type VendorStatus =
  | "considering"
  | "contacted"
  | "quoted"
  | "booked"
  | "rejected";

export type Vendor = {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
  email: string;
  quotedPrice: number;
  status: VendorStatus;
  notes: string;
};

export type VendorFormData = Omit<Vendor, "id">;

export const VENDOR_TYPES = [
  "venue",
  "caterer",
  "photographer",
  "florist",
  "music",
  "other",
] as const;

export const VENDOR_STATUSES: VendorStatus[] = [
  "considering",
  "contacted",
  "quoted",
  "booked",
  "rejected",
];

export const emptyVendorForm = (): VendorFormData => ({
  name: "",
  type: "venue",
  contactPerson: "",
  phone: "",
  email: "",
  quotedPrice: 0,
  status: "considering",
  notes: "",
});

export function countBookedVendors(vendors: Vendor[]): number {
  return vendors.filter((vendor) => vendor.status === "booked").length;
}
