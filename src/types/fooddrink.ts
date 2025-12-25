export type FoodDrinkType = "SNACK" | "DRINK" | "COMBO";

export type FoodDrink = {
  id: string;
  name: string;
  price: number;
  image: string;
  publicId: string;
  description: string;
  isAvailable: boolean;
  type: FoodDrinkType;
  createdAt: Date;
  updatedAt: Date;
};
