import { useDispatch } from "react-redux";
import { useEffect } from "react";

import useAuth from "@/hooks/useAuth.js";
import {
  userDetailsFetched,
  userPermissionsFetched,
} from "@/services/auth/authSlice.js";
import { useGetCurrentUserInfoQuery } from "@/services/auth/authApiSlice.js";

export const useInitUser = () => {
  const { accessToken } = useAuth();

  const dispatch = useDispatch();
  const {
    data: user,
    isLoading,
    refetch,
  } = useGetCurrentUserInfoQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (user) {
      const permissions =
        user?.roles?.flatMap((role) =>
          role?.permissions?.map((perm) => perm.name),
        ) || [];

      dispatch(userPermissionsFetched(permissions));
      dispatch(userDetailsFetched(user));
    }
  }, [user, dispatch]);

  return { isLoading, refetch };
};
