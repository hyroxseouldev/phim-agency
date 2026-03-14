"use client";

import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

type PendingSubmitButtonProps = {
  label: string;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
};

const buttonVariantMap: Record<NonNullable<PendingSubmitButtonProps["variant"]>, ComponentProps<typeof Button>["variant"]> = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
};

export function PendingSubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  className,
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={buttonVariantMap[variant]} disabled={pending} className={className}>
      {pending ? <Spinner className="size-4" /> : null}
      <span>{pending ? pendingLabel : label}</span>
    </Button>
  );
}
