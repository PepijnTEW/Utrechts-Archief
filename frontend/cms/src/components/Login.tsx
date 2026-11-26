import { useState, type FormEvent } from "react";

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return fallback;
}

type LoginProps = {
  onLoginSuccess: () => void;
};

export default function Login({ onLoginSuccess }: LoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    if (typeof username !== "string" || typeof password !== "string") {
      setError("Enter a username and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        setError(getErrorMessage(data, "Login failed."));
        return;
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("token" in data) ||
        typeof data.token !== "string"
      ) {
        setError("The server returned an invalid login response.");
        return;
      }

      sessionStorage.setItem("cmsToken", data.token);
      onLoginSuccess();
    } catch {
      setError(
        "Could not reach the server. Check that the backend is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form
        method="post"
        onSubmit={handleSubmit}
        className="flex w-full min-w-sm flex-col gap-4 w-1000 bg-white p-8 shadow-sm"
      >
        <h2 className="text-2xl font-bold text-slate-900">Login</h2>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-semibold text-slate-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            required
            className="rounded-md border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded-md bg-[#008899] py-2 px-4 text-sm font-semibold text-white hover:bg-[#006d7a] focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
