import { User } from "../../../apps/shared/src/models/user";
import { Role } from "../../../apps/shared/src/models/role";

export function getUsers(roles: Role[]) {
  let alice = new User(1, "Alice", "alice@email.com", "auth_rw|auth_ro");
  let bob = new User(2, "Bob", "bob@email.com", "auth_rw|auth_ro");

  alice.roles.push(roles[0]); // Assigning 'admin' role to Alice
  bob.roles.push(roles[1]); // Assigning 'auth' role to Bob

  return [alice, bob];
}
