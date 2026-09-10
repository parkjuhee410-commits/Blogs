import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "관리자 로그인", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-black">관리자 로그인</h1>
      <LoginForm />
    </div>
  );
}
