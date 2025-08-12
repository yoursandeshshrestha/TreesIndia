export const setCookie = (
  name: string,
  value: string,
  options?: {
    maxAge?: number;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
  }
) => {
  const cookieOptions = {
    maxAge: options?.maxAge || 7 * 24 * 60 * 60, // 7 days default
    path: options?.path || "/",
    secure: options?.secure ?? process.env.NODE_ENV === "production",
    httpOnly: options?.httpOnly ?? false,
    sameSite: options?.sameSite || ("lax" as const),
  };

  const cookieString = `${name}=${value}; Max-Age=${
    cookieOptions.maxAge
  }; Path=${cookieOptions.path}; ${cookieOptions.secure ? "Secure; " : ""}${
    cookieOptions.httpOnly ? "HttpOnly; " : ""
  }SameSite=${cookieOptions.sameSite}`;

  document.cookie = cookieString;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/;`;
};

// Server-side cookie helpers (only for server components)
export const getServerCookie = async (
  name: string
): Promise<string | undefined> => {
  if (typeof window !== "undefined") return undefined;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    return cookieStore.get(name)?.value;
  } catch {
    return undefined;
  }
};

export const setServerCookie = async (
  name: string,
  value: string,
  options?: {
    maxAge?: number;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
  }
) => {
  if (typeof window !== "undefined") return;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    cookieStore.set(name, value, {
      maxAge: options?.maxAge || 7 * 24 * 60 * 60,
      path: options?.path || "/",
      secure: options?.secure ?? process.env.NODE_ENV === "production",
      httpOnly: options?.httpOnly ?? true,
      sameSite: options?.sameSite || "lax",
    });
  } catch {
    // Silently fail if not in server environment
  }
};
