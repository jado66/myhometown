import Loading from "@/components/util/Loading";
import { Suspense } from "react";

const AuthLayout = ({ children }) => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
};

export default AuthLayout;
