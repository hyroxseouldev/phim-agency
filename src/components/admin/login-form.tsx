"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAction } from "@/app/login/actions";
import { initialActionState } from "@/lib/action-state";
import { PendingSubmitButton } from "@/components/admin/pending-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.push("/admin");
      router.refresh();
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [router, state]);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" name="email" type="email" required placeholder="admin@phim.agency" className="h-11 rounded-2xl bg-white/80 px-4" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" name="password" type="password" required placeholder="비밀번호" className="h-11 rounded-2xl bg-white/80 px-4" />
      </div>

      <PendingSubmitButton label="로그인" pendingLabel="로그인 중..." className="h-11 rounded-2xl" />
    </form>
  );
}
