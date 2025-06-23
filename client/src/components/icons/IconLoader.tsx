import React from "react";
import { IconPhotoExclamation } from "@tabler/icons-react";
import { iconsMap } from "./iconsMap";

type IconLoaderProps = {
  name: keyof typeof iconsMap;
};

const IconLoader: React.FC<IconLoaderProps> = ({ name }) => {
  const IconComponent = iconsMap[name];

  if (!IconComponent) {
    return <IconPhotoExclamation />;
  }

  return <IconComponent />;
};

export default IconLoader;
