"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

export function useActionFeedback(state: ActionState, options?: { redirectTo?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);

      if (options?.redirectTo) {
        router.push(options.redirectTo);
      }

      router.refresh();
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [options?.redirectTo, router, state]);
}

export function AdminSectionHeader({
  badge = "Admin",
  title,
  description,
  count,
}: {
  badge?: string;
  title: string;
  description: string;
  count?: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="grid gap-3">
        <Badge variant="outline" className="w-fit rounded-full border-[#143a46]/15 bg-white/70 px-3 py-1 uppercase tracking-[0.18em] text-[#143a46]">
          {badge}
        </Badge>
        <div className="grid gap-2">
          <h1 className="font-serif text-4xl leading-none tracking-[-0.04em] text-[#10232b] sm:text-5xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-[#5f7278] sm:text-base">{description}</p>
        </div>
      </div>

      {count ? (
        <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs font-semibold">
          {count}
        </Badge>
      ) : null}
    </div>
  );
}

export function AdminDetailHeader({
  backHref,
  backLabel,
  title,
  description,
  previewHref,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description: string;
  previewHref?: string;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="h-10 rounded-full border-[#10232b]/12 bg-white/75 px-4">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>

        {previewHref ? (
          <Button asChild variant="outline" className="h-10 rounded-full border-[#10232b]/12 bg-white/75 px-4">
            <Link href={previewHref} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              공개 페이지 보기
            </Link>
          </Button>
        ) : null}
      </div>

      <AdminSectionHeader badge="Detail" title={title} description={description} />
    </div>
  );
}

export function Field({
  htmlFor,
  label,
  children,
  className,
}: {
  htmlFor: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function ToggleField({
  id,
  name,
  label,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <Label htmlFor={id} className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#10232b]/10 bg-white/80 px-4 py-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 rounded border border-[#10232b]/20 accent-[#143a46]"
      />
      <span>{label}</span>
    </Label>
  );
}

export function TextInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} className={cn("h-11 rounded-2xl bg-white/80 px-4", props.className)} />;
}

export function FileInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={cn(
        "h-11 rounded-2xl bg-white/80 px-3 file:mr-3 file:rounded-full file:border-0 file:bg-[#143a46] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white",
        props.className,
      )}
    />
  );
}

export function TextAreaInput(props: React.ComponentProps<typeof Textarea>) {
  return <Textarea {...props} className={cn("min-h-28 rounded-2xl bg-white/80 px-4 py-3", props.className)} />;
}

export function FormCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-[2rem] border-white/60 bg-white/75 py-0 shadow-[0_24px_70px_rgba(10,29,35,0.1)] backdrop-blur">
      <CardHeader className="gap-2 border-b border-[#10232b]/8 px-6 py-6">
        <CardTitle className="text-xl text-[#10232b]">{title}</CardTitle>
        <p className="text-sm leading-7 text-[#5f7278]">{description}</p>
      </CardHeader>
      <CardContent className="grid gap-5 px-6 py-6">{children}</CardContent>
    </Card>
  );
}
