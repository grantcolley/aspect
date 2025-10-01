import { config } from "@/config/config";

async function apiRequest(
  token: string,
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: Record<string, unknown>
): Promise<unknown> {
  const url = `${config.API_URL}/api${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export function GetData(token: string, path: string): Promise<unknown> {
  return apiRequest(token, path, "GET");
}

export function PostData(
  token: string,
  path: string,
  data: Record<string, unknown>
): Promise<unknown> {
  return apiRequest(token, path, "POST", data);
}

export function PutData(
  token: string,
  path: string,
  data: Record<string, unknown>
): Promise<unknown> {
  return apiRequest(token, path, "PUT", data);
}

export function DeleteData(token: string, path: string): Promise<unknown> {
  return apiRequest(token, path, "DELETE");
}

export function GetRecords(
  token: string,
  path: string
): Promise<Record<string, unknown>[]> {
  return apiRequest(token, path, "GET") as Promise<Record<string, unknown>[]>;
}
