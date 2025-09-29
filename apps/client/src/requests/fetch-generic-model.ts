import { config } from "@/config/config";

export async function GetData(
  token: string,
  path: string
): Promise<Record<string, unknown>[]> {
  const url = `${config.API_URL}/api${path}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return data;
}

export async function PostData(
  token: string,
  path: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const url = `${config.API_URL}/api${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  return result;
}

export async function PutData(
  token: string,
  path: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const url = `${config.API_URL}/api${path}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  return result;
}

export async function DeleteData(
  token: string,
  path: string
): Promise<Record<string, unknown>[]> {
  const url = `${config.API_URL}/api${path}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return data;
}
