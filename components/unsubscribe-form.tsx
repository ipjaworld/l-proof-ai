"use client";

import { FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnsubscribeForm() {
  const id = useId();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setPending(true);
    setMessage("");
    try {
      const data = new FormData(form);
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), website: data.get("website") }),
      });
      const result = (await response.json()) as { message: string };
      setMessage(result.message);
    } catch {
      setMessage("처리하지 못했어요. this_is_laugh@naver.com으로 해지를 요청해주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="unsubscribe-form" onSubmit={submit} noValidate>
      <label htmlFor={id}>구독할 때 사용한 이메일</label>
      <div className="signup-row">
        <Input id={id} name="email" type="email" required placeholder="you@example.com" className="signup-input" />
        <Button type="submit" className="signup-button" disabled={pending}>{pending ? "처리 중…" : "수신거부"}</Button>
      </div>
      <div className="honeypot" aria-hidden="true"><label>웹사이트<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <p className="form-message" role="status" aria-live="polite">{message}</p>
    </form>
  );
}
