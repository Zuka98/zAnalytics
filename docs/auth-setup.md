# Auth Setup

## Auth secret

The admin panel requires an `AUTH_SECRET` environment variable for signing JWT sessions.

Generate one and add it to `.env`:

```sh
openssl rand -base64 32
```

```env
AUTH_SECRET=<paste-generated-value>
```
