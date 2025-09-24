import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  let message = "";
  if (isRouteErrorResponse(error)) {
    if (error.status === 500) {
      message = "The server encountered an error. Please try again later.";
    } else {
      message = `Unexpected error (status ${error.status}).`;
    }
  }

  return (
    <>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-20">
        Oops!
      </h4>
      <p className="text-muted-foreground text-xl">Something went wrong.</p>
      <p className="text-muted-foreground text-sm">{message}</p>
    </>
  );
}
