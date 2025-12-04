import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../config";
import { MessageResponse } from "../../types/api-types";

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
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["auth"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: "register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authAPI;
