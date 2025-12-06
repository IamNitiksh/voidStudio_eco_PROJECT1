import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../config";
import { MessageResponse } from "../../types/api-types";
import { User } from "../../types/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  photo: string;
  gender: string;
  dob: string;
}

export interface AuthResponse extends MessageResponse {
  user?: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
    gender?: string;
    dob?: string;
    role: string;
  };
}

export const authAPI = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/user/`,
  }),
  tagTypes: ["auth", "users"], // Added 'users' to allow login/register to invalidate user list if needed
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["auth", "users"], // Invalidates both auth and users
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: "register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth", "users"], // Invalidates both auth and users
    }),
    // Also including the Firebase/Google login endpoint from userAPI here for completeness
    firebaseLogin: builder.mutation<MessageResponse, User>({
      query: (user) => ({
        url: "new",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["auth", "users"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useFirebaseLoginMutation } = authAPI;
