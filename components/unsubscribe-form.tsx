"use client";

import { FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";

export function UnsubscribeForm({ subscriber, token }: { subscriber: string; token: string }) {
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
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriber, token, website: "" }),
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
      <label htmlFor={id}>이 링크에 연결된 브리핑 구독을 해지합니다.</label>
      <div className="signup-row">
        <input id={id} type="hidden" name="subscriber" value={subscriber} />
        <Button type="submit" className="signup-button" disabled={pending}>{pending ? "처리 중…" : "수신거부 확인"}</Button>
      </div>
      <p className="form-message" role="status" aria-live="polite">{message}</p>
    </form>
  );
}
