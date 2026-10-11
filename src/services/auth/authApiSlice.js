import { apiSlice } from "../api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    userLogin: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/login`,
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: data,
          credentials: "include",
        };
      },
      invalidatesTags: ["auth", "my-profile"],
    }),

    userPhoneLogin: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/request-otp`,
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: data,
          credentials: "include",
        };
      },
      invalidatesTags: ["auth", "request-otp"],
    }),

    verifyOTPTrigger: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/validate-code`,
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: data,
          credentials: "include",
        };
      },
      invalidatesTags: ["auth", "VERIFY-otp"],
    }),

    userRegister: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/signup`,
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: data,
        };
      },
      invalidatesTags: ["users", "auth"],
    }),

    // Request reset email – backend: POST /auth/send-reset-email { email }
    forgotPassword: builder.mutation({
      query: (payload) => ({
        url: `/auth/send-reset-email`,
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: payload,
      }),
    }),

    // Set new password after clicking email link – backend: POST /auth/update-password { code, password, confirmPassword }
    resetPassword: builder.mutation({
      query: (payload) => ({
        url: `/auth/update-password`,
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: payload,
      }),
    }),

    adminLogin: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/admin-login`,
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: data,
          credentials: "include",
        };
      },
      invalidatesTags: ["auth", "admin-profile"],
    }),

    changePassword: builder.mutation({
      query: (payload) => {
        return {
          url: `/auth/reset-password`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    updateUserProfile: builder.mutation({
      query: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        });

        return {
          url: `/users/profile/update`,
          method: "PATCH",
          body: formData,
          credentials: "include",
        };
      },
      invalidatesTags: ["user-profile", "auth"],
    }),

    getSingleUser: builder.query({
      query: () => ({
        url: `/users/get/single-user`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["user-profile"],
    }),

    getCurrentUserInfo: builder.query({
      query: () => `/users/get/single-user`,
      providesTags: ["users"],
    }),

    verifyEmail: builder.mutation({
      query: (payload) => {
        return {
          url: `/auth/validate-code`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["auth"],
    }),
    resendVerifyEmail: builder.mutation({
      query: (payload) => {
        return {
          url: `/auth/resend-verify-email`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["auth"],
    }),
    adminRequestMagicLink: builder.mutation({
      query: (data) => ({
        url: `/auth/admin-request-magic-link`,
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: data,
      }),
    }),
    adminMagicLogin: builder.mutation({
      query: (data) => ({
        url: `/auth/admin-magic-login`,
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: data,
      }),
      invalidatesTags: ["auth", "admin-profile"],
    }),
  }),
});

export const {
  useUserLoginMutation,
  useUserPhoneLoginMutation,
  useVerifyOTPTriggerMutation,
  useUserRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useAdminLoginMutation,
  useUpdateUserProfileMutation,
  useGetSingleUserQuery,
  useGetCurrentUserInfoQuery,
  useVerifyEmailMutation,
  useResendVerifyEmailMutation,
  useAdminRequestMagicLinkMutation,
  useAdminMagicLoginMutation,
} = authApiSlice;
