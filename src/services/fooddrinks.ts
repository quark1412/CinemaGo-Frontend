import { FoodDrink } from "@/types/fooddrink";
import instance from "@/configs/axiosConfig";

export interface GetFoodDrinksParams {
  page?: number;
  limit?: number;
  search?: string;
  isAvailable?: boolean;
}

export interface FoodDrinksResponse {
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: FoodDrink[];
}

export const getAllFoodDrinks = async (
  params?: GetFoodDrinksParams
): Promise<FoodDrinksResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.isAvailable !== undefined)
      queryParams.append("isAvailable", params.isAvailable.toString());

    const response = await instance.get(
      `/food-drinks/public?${queryParams.toString()}`,
      {
        requiresAuth: true,
      } as any
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFoodDrinkById = async (id: string) => {
  try {
    const response = await instance.get(`/food-drinks/public/${id}`, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createFoodDrink = async (foodDrinkData: {
  name: string;
  description: string;
  price: number;
  type: string;
  image: File;
}) => {
  try {
    const formData = new FormData();

    formData.append("name", foodDrinkData.name);
    formData.append("description", foodDrinkData.description);
    formData.append("price", foodDrinkData.price.toString());
    formData.append("type", foodDrinkData.type);
    formData.append("image", foodDrinkData.image);

    const response = await instance.post("/food-drinks", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      requiresAuth: true,
    } as any);

    if (response.status !== 201 && response.status !== 200) {
      const error = response.data;
      throw new Error(error.message || "Failed to create food/drink");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFoodDrink = async (
  id: string,
  foodDrinkData: {
    name?: string;
    description?: string;
    price?: number;
    type?: string;
    image?: File;
  }
): Promise<{ data: FoodDrink }> => {
  try {
    const formData = new FormData();

    if (foodDrinkData.name) formData.append("name", foodDrinkData.name);
    if (foodDrinkData.description)
      formData.append("description", foodDrinkData.description);
    if (foodDrinkData.price)
      formData.append("price", foodDrinkData.price.toString());
    if (foodDrinkData.type) formData.append("type", foodDrinkData.type);
    if (foodDrinkData.image) formData.append("image", foodDrinkData.image);

    const response = await instance.put(`/food-drinks/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleFoodDrinkAvailability = async (
  id: string
): Promise<{ data: FoodDrink }> => {
  try {
    const response = await instance.put(
      `/food-drinks/${id}/toggle-availability`,
      {},
      {
        requiresAuth: true,
      } as any
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
