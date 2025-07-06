import { User } from "../../../apps/shared/src/models/user";

export function getUsers() {
  return [
    new User(1, "Alice", "alice@email.com", "auth_rw"),
    new User(2, "Bob", "bob@email.com", "auth_ro"),
  ];
}
