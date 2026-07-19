export type RsvpStatus = "pending" | "confirmed" | "declined";

export type MealChoice = "veg" | "non-veg" | "kids";

export type Guest = {
  id: string;
  name: string;
  household: string;
  plusOne: boolean;
  rsvpStatus: RsvpStatus;
  mealChoice: MealChoice;
  dietaryNotes: string;
  phoneNumber: string;
};

export type GuestFormData = Omit<Guest, "id">;

export const RSVP_STATUSES: RsvpStatus[] = [
  "pending",
  "confirmed",
  "declined",
];

export const MEAL_CHOICES: MealChoice[] = ["veg", "non-veg", "kids"];

export const emptyGuestForm = (): GuestFormData => ({
  name: "",
  household: "",
  plusOne: false,
  rsvpStatus: "pending",
  mealChoice: "veg",
  dietaryNotes: "",
  phoneNumber: "",
});
