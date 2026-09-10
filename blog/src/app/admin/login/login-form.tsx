"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/admin/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="neo-card flex flex-col gap-4 p-6 sm:p-8">
      <label className="flex flex-col gap-1 font-bold">
        관리자 비밀번호
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="neo-border bg-(--color-surface) px-3 py-2 font-medium outline-none focus:bg-(--color-accent)"
        />
      </label>
      {state?.error && (
        <p className="font-bold text-(--color-coral)">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="neo-border neo-shadow-sm neo-interactive bg-(--color-accent) px-4 py-2 font-bold disabled:opacity-60"
      >
        {pending ? "확인 중..." : "로그인"}
      </button>
    </form>
  );
}
