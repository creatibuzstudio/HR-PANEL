import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { userDetailsFetched } from "@/services/auth/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();

  const { accessToken, isAuthenticated, user } = useSelector(
    (state) => state.auth,
  );

  const [authChecked, setAuthChecked] = useState(false);

  const permissions = useSelector((state) => state.auth.userPermissions);
  const permissionsLoaded = useSelector(
    (state) => state.auth.permissionsLoaded,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthChecked(true);
      return;
    }
  }, [dispatch, isAuthenticated]);

  return {
    accessToken,
    isAuthenticated,
    authChecked,
    user,
    permissions,
    permissionsLoaded,
  };
};

export default useAuth;
