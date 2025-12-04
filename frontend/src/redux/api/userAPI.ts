import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import { server } from "../../config";
import {
  AllUsersResponse,
  DeleteUserRequest,
  MessageResponse,
  UserResponse,
} from "../../types/api-types";
import { User } from "../../types/types";

export const userAPI = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/user/`,
  }),
  tagTypes: ["users"],
  endpoints: (builder) => ({
    login: builder.mutation<MessageResponse, User>({
      query: (user) => ({
        url: "new",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users"],
    }),

    deleteUser: builder.mutation<MessageResponse, DeleteUserRequest>({
      query: ({ userId, adminUserId }) => ({
        url: `${userId}?id=${adminUserId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),

    allUsers: builder.query<AllUsersResponse, string>({
      query: (id) => `all?id=${id}`,
      providesTags: ["users"],
    }),
  }),
});

/**
 * FIX: Modified function signature and request URL to include the admin ID as a 
 * query parameter. This is often required by the backend for authorization 
 * and fixes the 400 Bad Request error.
 */
export const getUser = async (id: string, adminId?: string) => {
  try {
    const url = `${server}/api/v1/user/${id}${adminId ? `?id=${adminId}` : ""}`;
    const { data }: { data: UserResponse } = await axios.get(url);

    return data;
  } catch (error) {
    // If the backend returns 400/404 for a missing user, treat that as "not found"
    // and return null so callers can handle it without noisy console errors.
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 400 || status === 404) {
        return null;
      }
    }

    // For other unexpected errors, log and rethrow so they can be handled upstream.
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const { useLoginMutation, useAllUsersQuery, useDeleteUserMutation } =
  userAPI;