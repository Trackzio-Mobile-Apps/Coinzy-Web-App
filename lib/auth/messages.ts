export type AuthFormMode = "signup" | "login" | "forgot" | "otp" | "reset";

/** Copy from Figma `1758:124172` (Error states). */
export const AUTH_FIELD_COPY = {
  loginEmailUnregistered: "This email isn't registered with us.",
  loginPasswordIncorrect: "The password you entered is incorrect.",
  signupEmailTaken: "This email is already registered with us.",
  otpInvalid: "Invalid OTP! The code does not match.",
  passwordMismatch: "The passwords you entered do not match",
  emailInvalid: "Enter a valid email address.",
  passwordRequired: "Enter your password.",
  passwordMinLength: "Use at least 8 characters.",
  nameRequired: "Enter your name.",
  otpRequired: "Enter the 6-digit code.",
} as const;

export type AuthFieldErrors = Partial<Record<"name" | "email" | "password" | "confirm" | "otp", string>>;

/** Map upstream `reason` strings onto field-level errors (Figma error states). */
export function authErrorsFromReason(mode: AuthFormMode, reason: string): { fields: AuthFieldErrors; notice?: string } {
  const r = reason.toLowerCase();

  if (mode === "login") {
    if (/incorrect password|wrong password|invalid password|password.*incorrect/.test(r)) {
      return { fields: { password: AUTH_FIELD_COPY.loginPasswordIncorrect } };
    }
    if (/not registered|isn't registered|unregistered|no user|user not found|account not found|email not found/.test(r)) {
      return { fields: { email: AUTH_FIELD_COPY.loginEmailUnregistered } };
    }
  }

  if (mode === "signup" && /already|exist|registered|in use/.test(r)) {
    return { fields: { email: AUTH_FIELD_COPY.signupEmailTaken } };
  }

  if ((mode === "reset" || mode === "otp") && /otp|token|code|verification/.test(r) && /invalid|incorrect|mismatch|expired|wrong/.test(r)) {
    return { fields: { otp: AUTH_FIELD_COPY.otpInvalid } };
  }

  if (mode === "reset" && /password/.test(r) && /match|mismatch/.test(r)) {
    return { fields: { confirm: AUTH_FIELD_COPY.passwordMismatch } };
  }

  return { fields: {}, notice: reason };
}
