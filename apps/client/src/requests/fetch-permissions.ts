import { config } from "@/config/config";

export const fetchPermissions = async (token: string) => {
  const navigationUrl = `${config.API_URL}/${config.API_USER_PERMISSIONS_URL}`;

  const response = await fetch(navigationUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} ${response.statusText}`
    );
  }

  const data: string[] = await response.json();

  return data;
};
