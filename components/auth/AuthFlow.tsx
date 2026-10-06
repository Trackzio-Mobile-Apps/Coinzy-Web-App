"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { goHome, submitAuth } from "@/lib/auth/client";
import { authHref } from "@/lib/auth/returnTo";
import { AUTH_FIELD_COPY, authErrorsFromReason, type AuthFieldErrors, type AuthFormMode } from "@/lib/auth/messages";
import { WelcomeActions } from "./WelcomeActions";

export type AuthMode = "welcome" | AuthFormMode;
type Errors = AuthFieldErrors;

const primary =
  "flex h-9 w-full items-center justify-center rounded-button bg-primary-500 px-4 text-sm font-medium leading-5 text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50";
const primaryError =
  "flex h-9 w-full items-center justify-center rounded-button bg-[#c4a5a7] px-4 text-sm font-medium leading-5 text-white disabled:cursor-not-allowed";
const titles = { signup: "Continue with Email", login: "Log in", forgot: "Forgot password", otp: "Forgot password", reset: "Create a new password" };

function Field({ label, name, value, onChange, error, invalid = false, password = false, hiddenIcon = "eye-off.svg", placeholder, autoComplete }: {
  label: string; name: string; value: string; onChange: (value: string) => void; error?: string;
  invalid?: boolean; password?: boolean; hiddenIcon?: string; placeholder: string; autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = `auth-${name}`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={`block text-sm font-medium leading-5 ${error ? "text-[#db340b]" : "text-ink"}`}>{label}</label>
      <div className="relative">
        <input id={id} name={name} type={password && !visible ? "password" : name === "email" ? "email" : "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={!!error || invalid} aria-describedby={error ? `${id}-error` : undefined} className={`h-9 w-full rounded-lg border bg-white px-3 text-sm leading-5 text-ink placeholder:text-[#a4a4a7] focus:outline-2 focus:outline-offset-1 focus:outline-primary-500 ${password ? "pr-10" : ""} ${error || invalid ? "border-[#db340b]" : "border-[#e5e5e5]"}`} />
        {password && <button type="button" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-primary-500"><Image src={`/assets/auth/${visible ? (hiddenIcon === "eye.svg" ? "eye-off.svg" : "eye.svg") : hiddenIcon}`} alt="" width={16} height={16} /></button>}
      </div>
      {error && <p id={`${id}-error`} role="alert" className="text-sm leading-5 text-[#db340b]">{error}</p>}
    </div>
  );
}

function Separator() {
  return <div className="flex h-9 items-center gap-2 px-4 text-sm leading-5 text-muted">{[0, 1].map((i) => <span key={i} className={`relative h-px flex-1 overflow-hidden ${i ? "order-3" : ""}`}><Image src="/assets/auth/separator.svg" alt="" width={300} height={1} className="absolute left-0 top-0 max-w-none" /></span>)}<span className="order-2">or</span></div>;
}

export function AuthFlow({ mode, next: returnTo = null }: { mode: AuthMode; next?: string | null }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [remember, setRemember] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { setErrors({}); setNotice(""); setPassword(""); setConfirm(""); }, [mode]);
  useEffect(() => {
    if (mode !== "otp" || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [mode, countdown]);
  const clear = (field: keyof Errors) => setErrors((previous) => ({ ...previous, [field]: undefined }));
  // Auth steps *replace* the history entry: the whole wizard is one entry, so browser Back leaves it instead of
  // walking through stale steps (the on-page "Back" link handles step-back deterministically).
  const navigate = (target: AuthMode) => router.replace(authHref(target, returnTo));
  const resend = async () => {
    if (pending || countdown > 0) return;
    setPending(true); setNotice("");
    try { await submitAuth("forgot", { email }); setDigits(Array(6).fill("")); setErrors({}); setCountdown(30); inputs.current[0]?.focus(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Unable to send a code."); }
    finally { setPending(false); }
  };
  function updateDigits(index: number, text: string) {
    const numbers = text.replace(/\D/g, "").slice(0, 6 - index);
    const next = [...digits];
    if (!numbers) next[index] = "";
    else [...numbers].forEach((digit, offset) => { next[index + offset] = digit; });
    setDigits(next); clear("otp");
    if (numbers) inputs.current[Math.min(5, index + numbers.length)]?.focus();
  }
  function otpKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index) { event.preventDefault(); inputs.current[index - 1]?.focus(); }
    if (event.key === "ArrowRight" && index < 5) { event.preventDefault(); inputs.current[index + 1]?.focus(); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return; setNotice("");
    const next: Errors = {};
    if (mode === "signup" && !name.trim()) next.name = AUTH_FIELD_COPY.nameRequired;
    if (["signup", "login", "forgot"].includes(mode) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = AUTH_FIELD_COPY.emailInvalid;
    }
    if (["signup", "reset"].includes(mode) && password.length < 8) next.password = AUTH_FIELD_COPY.passwordMinLength;
    if (mode === "login" && !password) next.password = AUTH_FIELD_COPY.passwordRequired;
    if (mode === "reset" && password !== confirm) next.confirm = AUTH_FIELD_COPY.passwordMismatch;
    if (Object.keys(next).length) { setErrors(next); return; }
    if (mode === "otp") {
      if (digits.some((digit) => !digit)) { setErrors({ otp: AUTH_FIELD_COPY.otpRequired }); return; }
      setToastVisible(true); navigate("reset"); return;
    }
    if (mode === "reset" && (!email || digits.some((digit) => !digit))) { setNotice("Request a reset code and enter it before changing your password."); return; }
    if (!["signup", "login", "forgot", "reset"].includes(mode)) return;
    setPending(true);
    try {
      await submitAuth(mode as "signup" | "login" | "forgot" | "reset", { email, password, name, remember, code: digits.join("") });
      if (mode === "forgot") { setDigits(Array(6).fill("")); setCountdown(30); navigate("otp"); }
      else if (mode === "reset") { setToastVisible(false); setDigits(Array(6).fill("")); setPassword(""); setConfirm(""); setNotice("Password changed. You can now log in."); }
      else { setPassword(""); goHome(returnTo); }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unable to complete authentication.";
      if (mode === "login" || mode === "signup" || mode === "reset") {
        const { fields, notice: apiNotice } = authErrorsFromReason(mode, reason);
        if (Object.keys(fields).length) {
          setErrors(fields);
          setNotice("");
          if (fields.otp && mode === "reset") navigate("otp");
          return;
        }
        if (apiNotice) {
          setNotice(apiNotice);
          return;
        }
      }
      setNotice(reason);
    } finally { setPending(false); }

  }
  if (mode === "welcome") return <WelcomeActions next={returnTo} />;
  const description = mode === "forgot" ? "Enter your email and it will be sent an account verification code." : mode === "reset" ? "Choose something strong that you haven't used before." : "Create your account to start collecting";
  return (
    <>
      {mode === "reset" && toastVisible && <div role="status" className="absolute right-4 top-16 z-10 flex w-[415px] max-w-[calc(100%_-_32px)] gap-3 rounded-xl border-l-[5px] border-[#008557] bg-white p-4 pr-9 shadow-[-4px_18px_15px_rgba(42,42,42,0.2)] sm:right-8 sm:top-4"><Image src="/assets/auth/check-circle.svg" alt="" width={24} height={24} /><div><p className="font-jakarta text-sm font-bold">Code entered</p><p className="mt-1.5 text-sm leading-5 text-muted">Set a new password to finish verification</p></div><button type="button" aria-label="Dismiss code message" onClick={() => setToastVisible(false)} className="absolute right-3 top-2"><Image src="/assets/auth/close.svg" alt="" width={20} height={20} /></button></div>}
      <div className="w-full max-w-[400px] rounded-xl bg-white px-6 py-4">
        <div className="space-y-8">
          <div className="space-y-2"><h1 className="text-2xl font-medium leading-8 text-ink">{titles[mode]}</h1>{mode === "otp" ? <p className="text-sm leading-5 text-[#737373]">We sent a 6-digit code to <strong>{email || "your email"}</strong></p> : <p className="text-sm leading-5 text-[#737373]">{description}</p>}</div>
          <form noValidate onSubmit={submit} className="space-y-4">
            {mode === "otp" ? (
              <div className="space-y-2">
                <p id="otp-label" className={`text-sm font-medium leading-5 ${errors.otp ? "text-[#db340b]" : ""}`}>Enter your OTP</p>
                <div role="group" aria-labelledby="otp-label" className="flex gap-2">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => { inputs.current[index] = element; }}
                      aria-label={`OTP digit ${index + 1}`}
                      aria-invalid={!!errors.otp}
                      aria-describedby={errors.otp ? "otp-error" : undefined}
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      value={digit}
                      onChange={(e) => updateDigits(index, e.target.value)}
                      onPaste={(e) => { e.preventDefault(); updateDigits(index, e.clipboardData.getData("text")); }}
                      onKeyDown={(e) => otpKey(index, e)}
                      onFocus={(e) => e.target.select()}
                      className={`size-8 min-w-0 rounded-lg border text-center text-sm text-ink outline-primary-500 ${errors.otp ? "border-[#db340b]" : "border-[#e5e5e5]"}`}
                    />
                  ))}
                </div>
                {errors.otp && <p id="otp-error" role="alert" className="text-sm leading-5 text-[#db340b]">{errors.otp}</p>}
              </div>
            ) : (
            <div className="space-y-3">
              {mode === "signup" && <Field label="Name" name="name" value={name} onChange={(value) => { setName(value); clear("name"); }} error={errors.name} placeholder="Enter your name" autoComplete="name" />}
              {["signup", "login", "forgot"].includes(mode) && <Field label="Email address" name="email" value={email} onChange={(value) => { setEmail(value); clear("email"); }} error={errors.email} placeholder="Enter your email address" autoComplete="email" />}
              {["signup", "login", "reset"].includes(mode) && <Field key={`${mode}-password`} label={mode === "signup" ? "Create password" : mode === "reset" ? "New password" : "Enter password"} name="password" value={password} onChange={(value) => { setPassword(value); clear("password"); clear("confirm"); }} error={errors.password} invalid={mode === "reset" && !!errors.confirm} password hiddenIcon={mode === "signup" ? "eye.svg" : "eye-off.svg"} placeholder={mode === "signup" ? "Create your password" : mode === "reset" ? "Enter your new password" : "Enter your password"} autoComplete={mode === "login" ? "current-password" : "new-password"} />}
              {mode === "reset" && <Field label="Confirm new password" name="confirm" value={confirm} onChange={(value) => { setConfirm(value); clear("confirm"); }} error={errors.confirm} password placeholder="Confirm your new password" autoComplete="new-password" />}
            </div>)}
            <div className={mode === "login" ? "space-y-3" : "space-y-4"}>
              <button
                type="submit"
                disabled={pending || Object.values(errors).some(Boolean) || (mode === "otp" && digits.some((digit) => !digit))}
                className={Object.values(errors).some(Boolean) ? primaryError : primary}
              >
                {pending ? "Please wait…" : mode === "signup" ? "Create account" : mode === "login" ? "Log in" : mode === "forgot" ? "Send code" : mode === "otp" ? "Continue" : "Change password"}
              </button>
              {mode === "login" && <div className="flex items-center justify-between gap-2 text-xs leading-4"><label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-4 accent-primary-500" />Remember me</label><Link href={authHref("forgot", returnTo)} replace className="rounded-lg px-2 py-1 font-medium text-primary-500">Forgot password</Link></div>}
              {mode === "forgot" && <Link href={authHref("login", returnTo)} replace className="flex h-9 items-center justify-center rounded-button border border-[#e5e5e5] text-sm font-medium">Cancel</Link>}
              {mode === "otp" && <div className="flex flex-wrap items-center justify-center gap-2 text-xs leading-4 text-[#6a7282]"><span>Don’t receive code?</span><span className="tabular-nums">00:{String(countdown).padStart(2, "0")}s</span><button type="button" disabled={pending || countdown > 0} onClick={resend} className="rounded-lg px-2 py-1 font-medium text-primary-500 disabled:opacity-50">Re-send</button></div>}
            </div>
            {(mode === "signup" || mode === "login") && <><Separator /><div className="flex justify-center"><button type="button" aria-label={`${mode === "login" ? "Log in" : "Sign up"} with Google`} disabled title="Google sign-in is not available yet." className="flex size-14 items-center justify-center rounded-full border border-[#e5e5e5] disabled:cursor-not-allowed disabled:opacity-50"><Image src="/assets/auth/google.png" alt="" width={24} height={24} /></button></div><div className="flex items-center justify-center gap-1 text-xs leading-4 text-[#6a7282]"><p>{mode === "signup" ? "Already have an account?" : "Don’t have an account?"}</p><Link href={authHref(mode === "signup" ? "login" : "signup", returnTo)} replace className="rounded-lg px-2 py-1 font-medium text-primary-500">{mode === "signup" ? "Log in" : "Sign up"}</Link></div></>}
            {notice && <p role="status" className="text-center text-sm leading-5 text-muted">{notice}{mode === "reset" && notice === "Password changed. You can now log in." && <Link href={authHref("login", returnTo)} replace className="mt-2 block font-medium text-primary-500">Log in</Link>}</p>}
          </form>
        </div>
      </div>

    </>
  );
}
