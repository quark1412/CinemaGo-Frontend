import instance from "@/configs/axiosConfig";
import {
  Cinema,
  Room,
  CreateCinemaData,
  UpdateCinemaData,
  CreateRoomData,
  UpdateRoomData,
  GetCinemasParams,
  GetRoomsParams,
  CinemaResponse,
  RoomResponse,
} from "@/types/cinema";

// Cinema Services
export const getAllCinemas = async (
  params?: GetCinemasParams
): Promise<CinemaResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const response = await instance.get(
      `/cinemas/public?${queryParams.toString()}`,
      {
        requiresAuth: true,
      } as any
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCinemaById = async (id: string): Promise<{ data: Cinema }> => {
  try {
    const response = await instance.get(`/cinemas/public/${id}`, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCinema = async (
  data: CreateCinemaData
): Promise<{ data: Cinema }> => {
  try {
    const response = await instance.post("/cinemas", data, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCinema = async (
  id: string,
  data: UpdateCinemaData
): Promise<{ data: Cinema }> => {
  try {
    const response = await instance.put(`/cinemas/${id}`, data, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveCinema = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/cinemas/${id}/archive`, {}, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const restoreCinema = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/cinemas/${id}/restore`, {}, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Room Services
export const getAllRooms = async (
  params?: GetRoomsParams
): Promise<RoomResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.cinemaId) queryParams.append("cinemaId", params.cinemaId);
    if (params?.startTime) queryParams.append("startTime", params.startTime);
    if (params?.endTime) queryParams.append("endTime", params.endTime);

    const response = await instance.get(
      `/rooms/public?${queryParams.toString()}`,
      {
        requiresAuth: true,
      } as any
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRoomById = async (id: string): Promise<{ data: Room }> => {
  try {
    const response = await instance.get(`/rooms/public/${id}`, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createRoom = async (
  data: CreateRoomData
): Promise<{ data: Room }> => {
  try {
    const response = await instance.post("/rooms", data, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRoom = async (
  id: string,
  data: UpdateRoomData
): Promise<{ data: Room }> => {
  try {
    const response = await instance.put(`/rooms/${id}`, data, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveRoom = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/rooms/archive/${id}`, {}, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const restoreRoom = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/rooms/restore/${id}`, {}, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};
