import {
  IconHome,
  IconUser,
  IconSettings,
  IconSearch,
  IconShieldCog,
  IconUsersGroup,
  IconUserCircle,
  IconShieldLock,
  IconAppsFilled,
  IconLayoutBoardSplit,
  IconListDetails,
  IconAlignBoxLeftStretch,
} from "@tabler/icons-react";

export const iconsMap: Record<string, React.FC<any>> = {
  home: IconHome,
  user: IconUser,
  search: IconSearch,
  settings: IconSettings,
  authorisation: IconShieldCog,
  users: IconUsersGroup,
  roles: IconUserCircle,
  permissions: IconShieldLock,
  applications: IconAppsFilled,
  modules: IconLayoutBoardSplit,
  categories: IconListDetails,
  pages: IconAlignBoxLeftStretch,
};
