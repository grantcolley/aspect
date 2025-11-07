import { User } from "../../../apps/shared/src/models/user";
import { Role } from "../../../apps/shared/src/models/role";
import { PERMISSIONS } from "../../../apps/shared/src/constants/constants";

export function getUsers(roles: Role[]) {
  let alice = new User();
  alice.userId = 1;
  alice.name = "Alice";
  alice.email = "alice@email.com";
  alice.permission = PERMISSIONS.AUTH_RO + "|" + PERMISSIONS.AUTH_RW;

  let bob = new User();
  bob.userId = 2;
  bob.name = "Bob";
  bob.email = "bob@email.com";
  bob.permission = PERMISSIONS.AUTH_RO + "|" + PERMISSIONS.AUTH_RW;

  alice.roles.push(roles[0]); // Assigning 'admin' role to Alice
  bob.roles.push(roles[1]); // Assigning 'auth' role to Bob

  return [alice, bob];
}
