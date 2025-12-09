import instance from "@/configs/axiosConfig";
import { User } from "@/types/User";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface GetUsersResponse {
  data: User[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getAllUsers = async (
  params?: GetUsersParams
): Promise<GetUsersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const response = await instance.get(`/v1/users?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (id: string): Promise<{ data: User }> => {
  try {
    const response = await instance.get(`/v1/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (userData: {
  email: string;
  fullname: string;
  password: string;
  gender: string;
  role: string;
}): Promise<{ data: User }> => {
  try {
    const response = await instance.post("/v1/users", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (
  id: string,
  userData: {
    fullname: string;
    gender: string;
    role: string;
    password?: string;
  }
): Promise<{ data: User }> => {
  try {
    const response = await instance.put(`/v1/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveUser = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/v1/users/${id}/archive`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const restoreUser = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/v1/users/${id}/restore`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
