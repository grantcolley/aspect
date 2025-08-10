import { config } from "@/config/config";

export async function fetchGenericRecordData(
  token: string,
  path: string
): Promise<Record<string, unknown>[]> {
  const url = `${config.API_URL}/api${path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return data;
}
