"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { Check, Copy, X } from "lucide-react";
import { createPortal } from "react-dom";

import { Button, buttonVariants } from "@/components/ui/button";
import { BUSINESS_WECHAT_QR_SRC } from "@/lib/business";
import { cn } from "@/lib/utils";

interface ContactModalProps {
  wechat: string;
  note: string;
  open: boolean;
  onClose: () => void;
}

function ContactModal({ wechat, note, open, onClose }: ContactModalProps) {
  const titleId = useId();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  async function copyWechat() {
    try {
      await navigator.clipboard.writeText(wechat);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 pro-modal-in"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold text-slate-900">
            开通专属助理
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="关闭弹窗"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center px-5 py-6 text-center">
          <div className="overflow-hidden rounded-xl bg-white p-2 ring-1 ring-slate-200/80">
            <Image
              src={BUSINESS_WECHAT_QR_SRC}
              alt="咨询二维码"
              width={200}
              height={254}
              className="h-auto w-[168px]"
              priority
            />
          </div>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            ID
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            {wechat}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{note}</p>
          <Button type="button" size="lg" className="mt-5 w-full" onClick={copyWechat}>
            {copied ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            {copied ? "已复制" : "复制联系方式"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface ContactCtaProps {
  wechat: string;
  note: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function ContactCta({
  wechat,
  note,
  children,
  className,
  variant = "default",
  size = "lg",
}: ContactCtaProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className={cn(buttonVariants({ variant, size }), className)}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <ContactModal
        wechat={wechat}
        note={note}
        open={open}
        onClose={close}
      />
    </>
  );
}

/** 页面级：共享一个弹窗，多个触发按钮 */
export function ContactGate({
  wechat,
  note,
  children,
}: {
  wechat: string;
  note: string;
  children: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const openModal = useCallback(() => setOpen(true), []);

  return (
    <>
      {children(openModal)}
      <ContactModal
        wechat={wechat}
        note={note}
        open={open}
        onClose={close}
      />
    </>
  );
}
