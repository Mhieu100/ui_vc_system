import { Navigate } from "react-router-dom";
import Loading from "../loading";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import NotPermitted from "./not-permitted";
import { useEffect, useState } from "react";

const RoleBaseRoute = (props) => {
  const user = useSelector((state) => state.account.user);

  if (
    user.role === "ADMIN" ||
    user.role === "DOCTOR" ||
    user.role === "CASHIER"
  ) {
    return <>{props.children}</>;
  } else {
    return <NotPermitted />;
  }
};

const ProtectedRoute = (props) => {
  const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
  const isLoading = useSelector((state) => state.account.isLoading);

  const [redirectToLogin, setRedirectToLogin] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setRedirectToLogin(true);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {isLoading === true ? (
        <Loading />
      ) : (
        <>
          {isAuthenticated === true ? (
            <>
              <RoleBaseRoute>{props.children}</RoleBaseRoute>
            </>
          ) : (
            <Navigate to="/login" replace />
          )}
        </>
      )}
    </>
  );
};

RoleBaseRoute.propTypes = {
  children: PropTypes.node,
};
ProtectedRoute.propTypes = {
  children: PropTypes.node,
};
export default ProtectedRoute;
