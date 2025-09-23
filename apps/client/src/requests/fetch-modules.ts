import { config } from "@/config/config";
import { Module } from "shared/src/models/module";

export const fetchModules = async (token: string) => {
  const navigationUrl = `${config.API_URL}/${config.API_NAVIGATION_URL}`;

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

  const data: Module[] = await response.json();

  return data;
};
