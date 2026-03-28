# Admin Users

The admin panel uses invite-only authentication. Users are created via CLI.

## Create a user

```sh
pnpm create:user <email> <password> [name] [role]
```

- `role` defaults to `"user"`. Valid values: `admin`, `user`.
- Requires a running Postgres database (`DATABASE_URL` in `.env`).

### Examples

```sh
pnpm create:user alice@example.com s3cret Alice admin
pnpm create:user admin@definio.org password123 Zuka admin
```