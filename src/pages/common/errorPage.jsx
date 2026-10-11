import React from "react";
import { Link } from "react-router-dom";
import errorIcon from "@/assets/images/error_icon.svg";

const ErrorPage = () => {
  return (
    <section className="min-h-screen w-screen center dark:bg-black/90 bg-gray-100 text-black/90 dark:text-white/90 p-10">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-12 items-center">
        <img src={errorIcon} className="h-80 w-80" />
        <div>
          {/* <h1 className="text-4xl">404</h1> */}
          <p className="text-4xl">Page not found</p>
          <p className="mt-4 opacity-60 max-w-sm text-sm">
            This page is either broken or you have reached a route that does not
            exist right now
          </p>
          <p className="mt-12">
            Go Back to{" "}
            <Link to="/" className="text-primary">
              Landing Page
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ErrorPage;
