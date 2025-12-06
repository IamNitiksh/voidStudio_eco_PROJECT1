// Updated userAPI.ts (Focusing on admin/user management CRUD)
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import { server } from "../../config";
import {
  AllUsersResponse,
  DeleteUserRequest,
  MessageResponse,
  UserResponse,
} from "../../types/api-types";

// User model import kept for context, though unused in the RTKQ endpoints here
// import { User } from "../../types/types"; 

export const userAPI = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/user/`,
  }),
  tagTypes: ["users"],
  endpoints: (builder) => ({
    // NOTE: The login mutation was MOVED to authAPI for better separation of concerns.

    deleteUser: builder.mutation<MessageResponse, DeleteUserRequest>({
      query: ({ userId, adminUserId }) => ({
        url: `${userId}?id=${adminUserId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),

    allUsers: builder.query<AllUsersResponse, string>({
      query: (id) => `all?id=${id}`,
      providesTags: ["users"], // FIX: Added providesTags for robust caching
    }),
  }),
});

// Standalone function kept, but with cleaner error handling
export const getUser = async (id: string, adminId?: string) => {
  try {
    // Ensure adminId is included for authorization
    const url = `${server}/api/v1/user/${id}${adminId ? `?id=${adminId}` : ""}`;
    const { data }: { data: UserResponse } = await axios.get(url);

    return data;
  } catch (error) {
    // Handle common 400/404 errors as a signal for the user not existing
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 400 || error.response.status === 404) {
        return null; // Indicate resource not found
      }
    }

    // Rethrow all other errors to be handled by the caller
    throw error;
  }
};

export const { useAllUsersQuery, useDeleteUserMutation } = userAPI;