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
    const userData = user?.data || user;
    if (userData && userData.id) {
      const permissions =
        userData?.roles?.flatMap((role) =>
          role?.permissions?.map((perm) => perm.name),
        ) || [];

      dispatch(userPermissionsFetched(permissions));
      dispatch(userDetailsFetched(userData));
    }
  }, [user, dispatch]);

  return { isLoading, refetch };
};
