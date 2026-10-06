<!-- Copied on 2026-10-05 from /home/aishik/StudioProjects/coin-id-android-frontend/docs/auth-api.md. Relative source links in this document refer to that Android repository. -->

# Coinzy authentication API

This reference describes the API contract consumed by the Android client, checked against repository source on 2026-10-05. Examples use fictional values and placeholder tokens. Server-side validation, token expiry, rate limits, and exact error status codes are not established by this frontend repository.

## Base URLs and headers

| Environment | Base URL |
| --- | --- |
| Development | `https://coins-api.trackzio.com/` |
| Production | `https://coins-api-prod.trackzio.com/` |

The selected build supplies `BuildConfig.BASE_URL`; local builds can override the Coins API URL at runtime. Paths below are relative to that base, without an additional `/api` prefix.

The Android client sends these headers:

| Header | Value |
| --- | --- |
| `Content-Type` | `application/json` |
| `App-Version` | App version name |
| `X-timezone` | Device timezone ID, e.g. `Asia/Kolkata` |
| `X-language` | Device language plus ISO3 country when available, e.g. `en-IND` |
| `Authorization` | `Bearer <token>` for refresh and protected profile requests |

The auth Retrofit client does not automatically attach a session token. Refresh supplies its own Authorization header. Protected requests use the logged-in user token, or the guest token when the app is not logged in.

## Endpoint overview

| Method | Path | Authorization | Response model |
| --- | --- | --- | --- |
| POST | `auth/login` | No session token sent | `UserResponse` |
| POST | `auth/guest-login` | No session token sent | `GuestDetails` |
| POST | `auth/signup` | No session token sent | `UserResponse` |
| POST | `auth/social-login/google` | No session token sent | `UserResponse` |
| POST | `auth/forgot-password` | No session token sent | `AuthBase` |
| POST | `auth/reset-password` | Reset token in body | `AuthBase` |
| GET | `auth/refresh-auth-token` | Existing user bearer token | `RefreshToken` |
| GET | `auth/me` | Session bearer token | `AboutMeResponse` |
| DELETE | `auth/me` | Session bearer token | Unstructured (`Any`) |

Authorization entries describe client behavior, not independently verified backend access rules. Billing routes under `auth/` are outside this authentication reference.

## Email login

`POST auth/login`

```json
{
  "handle": "collector@example.com",
  "password": "<password>"
}
```

`handle` is populated with the email entered in the login screen. Both fields are nullable strings in `LoginRequest`; that does not establish that the backend accepts missing values. Returns the shared user-session response below.

## Guest login

`POST auth/guest-login`

```json
{
  "guestId": "<guest-id>"
}
```

The repository always includes the supplied `guestId` string. The client also calls this route with the stored guest ID to renew a guest session.

Illustrative response:

```json
{
  "guest": {
    "id": "<guest-user-id>",
    "isGuest": true
  },
  "guestId": "<guest-id>",
  "isFirstTime": false,
  "token": "<guest-session-token>",
  "error": false,
  "reason": null
}
```

`guest` is shown as a partial object. Its complete client model is [Guest.kt](../app/src/main/java/com/coinzy/trackzio/domain/entities/Guest.kt). All top-level `GuestDetails` fields are nullable.

## Signup

`POST auth/signup`

```json
{
  "email": "collector@example.com",
  "fullName": "Example Collector",
  "password": "<password>",
  "confirmPass": "<same-password>",
  "guestId": "<existing-guest-id>",
  "timezone": "Asia/Kolkata",
  "language": "en"
}
```

| Field | Client type | Usage |
| --- | --- | --- |
| `email` | String | Signup email |
| `fullName` | String | Display name |
| `password` | String | Password |
| `confirmPass` | String | Password confirmation; exact wire key is `confirmPass` |
| `guestId` | String | Existing guest identity, when available |
| `referralCode` | String | Referral code |
| `phone` | String | Phone value |
| `gender` | String | Profile gender |
| `country` | String | Profile country |
| `age` | Integer | Profile age |
| `timezone` | String | Device timezone ID |
| `language` | String | Selected app language |
| `picture` | String | Profile picture value |

All fields are nullable in `SignUpRequest`. Gson omits null request fields in the configured auth client. The example is a representative payload, not a verified list of backend-required fields. `AuthViewModel` initializes guest ID, timezone, and language from local state. Returns `UserResponse`.

## Google login

`POST auth/social-login/google`

```json
{
  "credential": "<google-id-token>",
  "fullName": "Example Collector",
  "guestId": "<existing-guest-id>"
}
```

`credential` is the Google **ID token** returned by Credential Manager, not the Coinzy session token. `fullName` comes from the Google display name. The three `GLogin` fields are nullable strings; null fields are omitted by Gson. Guest ID availability depends on the login flow's local state. Returns `UserResponse`.

## Shared user-session response

Email login, signup, and Google login deserialize into `UserResponse`:

```json
{
  "token": "<coinzy-session-token>",
  "user": {
    "id": "<user-id>",
    "email": "collector@example.com",
    "isGuest": false,
    "isProfileComplete": false
  },
  "error": false,
  "reason": null
}
```

The `user` example is partial. The complete [User model](../app/src/main/java/com/coinzy/trackzio/domain/entities/User.kt) includes `_id`, age, gender, name, activity/email/profile/FTUE flags, subscription/social fields, timestamps, reward state, and seller details. `token`, `user`, `error`, and `reason` are nullable. `UserResponse` also defines nullable `saveTimeStamp` with a default of `0`; backend timestamp semantics are not specified here.

The repository wrapper checks an `isSignup` flag when present in its serialized response body. `UserResponse` does not declare that field, so this is not a reliably exposed response property for these typed auth calls.

## Forgot password

`POST auth/forgot-password`

```json
{
  "handle": "collector@example.com"
}
```

The exact key is `handle`, populated with the email. Returns `AuthBase`:

```json
{
  "error": false,
  "reason": "<server-message>"
}
```

The frontend does not establish delivery guarantees, code lifetime, or resend limits.

## Reset password

`POST auth/reset-password`

```json
{
  "email": "collector@example.com",
  "password": "<new-password>",
  "token": "<reset-code>"
}
```

All three `ResetPassword` fields are nullable strings. The Android screen sends its `otp` value as `token`. Password confirmation is checked by the UI and is not sent in this request. Returns `AuthBase`, as above. No session token is declared in that response.

## Refresh user token

`GET auth/refresh-auth-token`

```http
Authorization: Bearer <existing-user-token>
```

No request body. Illustrative response:

```json
{
  "token": "<new-user-token>",
  "userId": "<user-id>",
  "error": false,
  "reason": null
}
```

All `RefreshToken` fields are nullable. The client stores the returned token in the existing user-session details. There is no separate refresh-token field in this contract.

## Current profile

`GET auth/me` with the session bearer token and no body. Top-level response fields:

| Field | Client type |
| --- | --- |
| `error` | Boolean |
| `token` | String |
| `user` | `AboutMeResponse.User` |
| `discount` | Object with `endsAt` (Long) and `isApplicable` (Boolean) |

These top-level fields are non-null in the Kotlin declaration. The profile user model differs from the login user model; for example, it maps `ftueCompletion` to a structured value and includes purchase data and experiment variants. See [AboutMeResponse.kt](../app/src/main/java/com/coinzy/trackzio/data/models/AboutMeResponse.kt) for the complete schema. The frontend alone does not establish the unit of `discount.endsAt`.

## Delete account and logout

`DELETE auth/me` with the session bearer token and no body deletes the current account. The service declares `Response<Any>`, so no stable JSON response schema is documented. After the application's delete flow reports success, `SettingsViewModel` resets local user data to a fresh-install state.

Logout is a local reset through `AppUserDataResetter.resetToFreshInstall()`. No logout HTTP route is declared in these services; server-side token revocation is not established by this client behavior.

## Session renewal and errors

Protected calls use `TokenInterceptor`. On an HTTP `401` it closes the original response, renews the session, and retries the original request once:

1. Logged-in user: call `GET auth/refresh-auth-token` with the stored user token.
2. Guest: call `POST auth/guest-login` with the stored guest ID.
3. Store a successfully returned token and retry with it. If renewal returns no token, retry with the original Authorization header.

Local Experts requests bypass this refresh handling. Auth Retrofit calls themselves do not use `TokenInterceptor`.

For the auth repository's `requestWithoutBase` wrapper:

- HTTP `200` or `201` with a nonempty response body is accepted unless `error` is `true`.
- `error: true` becomes an application error using `reason`; this can occur even with a successful HTTP status.
- Non-success responses are parsed for `reason` and optional `aiErrorCode`; unparseable bodies are used as error text.
- Empty accepted response bodies produce `Empty data`; caught request failures use `Something went wrong!!`.

Illustrative error body, not a guaranteed response for a particular route:

```json
{
  "error": true,
  "reason": "<server-error-message>"
}
```

The frontend provides no authoritative route-by-route validation/status matrix. Some interceptors synthesize network error responses; those are client behavior rather than server guarantees.

## cURL examples

Use development unless you deliberately select production. Replace placeholders locally.

```bash
COINZY_BASE_URL='https://coins-api.trackzio.com'

curl --request POST "$COINZY_BASE_URL/auth/login" \
  --header 'Content-Type: application/json' \
  --header 'App-Version: <app-version>' \
  --header 'X-timezone: Asia/Kolkata' \
  --header 'X-language: en-IND' \
  --data '{"handle":"collector@example.com","password":"<password>"}'

curl "$COINZY_BASE_URL/auth/me" \
  --header 'Authorization: Bearer <session-token>'

curl "$COINZY_BASE_URL/auth/refresh-auth-token" \
  --header 'Authorization: Bearer <existing-user-token>'
```

## Source map

- [AuthApiService](../app/src/main/java/com/coinzy/trackzio/data/apiservices/AuthApiService.kt): seven auth route declarations.
- [ApiService](../app/src/main/java/com/coinzy/trackzio/data/apiservices/ApiService.kt): profile lookup and deletion.
- [AuthRepositoryImpl](../app/src/main/java/com/coinzy/trackzio/data/repositories/AuthRepositoryImpl.kt): guest and forgot-password JSON keys.
- [Request/response models](../app/src/main/java/com/coinzy/trackzio/data/models/): `LoginRequest`, `SignUpRequest`, `GLogin`, `ResetPassword`, `UserResponse`, `GuestDetails`, `RefreshToken`, `AuthBase`, `AboutMeResponse`.
- [NetworkModule](../app/src/main/java/com/coinzy/trackzio/di/NetworkModule.kt), [StaticHeaderInterceptor](../app/src/main/java/com/coinzy/trackzio/interceptor/StaticHeaderInterceptor.kt), and [TokenInterceptor](../app/src/main/java/com/coinzy/trackzio/interceptor/TokenInterceptor.kt): transport, headers, and session renewal.
- [BaseRepository](../app/src/main/java/com/coinzy/trackzio/base/BaseRepository.kt): `requestWithoutBase` success/error handling.
- [AuthViewModel](../app/src/main/java/com/coinzy/trackzio/presentation/screens/splash/AuthViewModel.kt), [ResetPasswordScreen](../app/src/main/java/com/coinzy/trackzio/presentation/screens/login/ResetPasswordScreen.kt), and [SettingsViewModel](../app/src/main/java/com/coinzy/trackzio/presentation/screens/settings/SettingsViewModel.kt): signup defaults, reset-code mapping, and local logout/delete cleanup.
