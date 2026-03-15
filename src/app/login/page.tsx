import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isAdminEmail } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email && isAdminEmail(user.email)) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfc_100%)] px-4 py-10">
      <Card className="mx-auto w-full max-w-xl rounded-[2rem] border-black/8 bg-white/88 py-0 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur">
        <CardContent className="grid gap-6 p-8 sm:p-10">
          <div className="grid gap-4">
            <Badge variant="outline" className="w-fit rounded-full border-[#143a46]/15 bg-white/70 px-3 py-1 uppercase tracking-[0.18em] text-[#143a46]">
              Admin Login
            </Badge>
            <div className="grid gap-3">
              <h1 className="font-serif text-4xl leading-none tracking-[-0.04em] text-[#10232b] sm:text-5xl">PHIM 관리자 로그인</h1>
              <p className="text-sm leading-7 text-[#5f7278] sm:text-base">
                이메일과 비밀번호로 로그인한 뒤 Work, Projects 데이터를 바로 수정할 수 있습니다. 관리자 계정은
                Supabase Dashboard의 Auth Users에서 먼저 생성해두면 됩니다.
              </p>
            </div>
          </div>

        <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
