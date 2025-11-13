import { User } from "../../../apps/shared/src/models/user";
import { Role } from "../../../apps/shared/src/models/role";
import { PERMISSIONS } from "../../../apps/shared/src/constants/constants";

export function getUsers(roles: Role[]) {
  let alice = new User();
  alice.userId = 1;
  alice.name = "Alice";
  alice.email = "alice@email.com";
  alice.permission =
    PERMISSIONS.ACCOUNTS_READ + "|" + PERMISSIONS.ACCOUNTS_WRITE;

  let bob = new User();
  bob.userId = 2;
  bob.name = "Bob";
  bob.email = "bob@email.com";
  bob.permission = PERMISSIONS.ACCOUNTS_READ + "|" + PERMISSIONS.ACCOUNTS_WRITE;

  let jane = new User();
  jane.userId = 3;
  jane.name = "Jane";
  jane.email = "jane@email.com";
  jane.permission =
    PERMISSIONS.ACCOUNTS_READ + "|" + PERMISSIONS.ACCOUNTS_WRITE;

  let will = new User();
  will.userId = 4;
  will.name = "Will";
  will.email = "will@email.com";
  will.permission =
    PERMISSIONS.ACCOUNTS_READ + "|" + PERMISSIONS.ACCOUNTS_WRITE;

  alice.roles.push(roles[1]); // Assigning 'admin writer' role to Alice
  bob.roles.push(roles[3]); // Assigning 'accounts writer' role to Bob
  jane.roles.push(roles[0]); // Assigning 'admin reader' role to Jane
  will.roles.push(roles[2]); // Assigning 'accounts reader' role to Will

  return [alice, bob, jane, will];
}
