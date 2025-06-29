import { User } from "shared/src/models/user";

export function getUsers() {
  return [
    new User(1, "Alice", "alice@email.com", false),
    new User(2, "Grant", "grant@email.com", false),
  ];
}
