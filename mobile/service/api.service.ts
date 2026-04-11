const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const errorData = data as { error?: string; message?: string } | null;
    throw new Error(errorData?.error ?? errorData?.message ?? "Unexpected error");
  }

  return data as T;
}

export async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });

  return parseResponse<T>(response);
}

export async function authenticatedRequest<T>(
  token: string,
  path: string,
  options?: RequestInit
): Promise<T> {
  return request<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
}

export { API_URL };
