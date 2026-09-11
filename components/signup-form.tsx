"use client";

import { FormEvent, useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { LStamp } from "@/components/l-stamp";

type Interest = "coding-agents" | "llm" | "agi";
type FormState = "idle" | "pending" | "success" | "error";

const interestOptions: { value: Interest; label: string }[] = [
  { value: "coding-agents", label: "Coding Agents" },
  { value: "llm", label: "LLM" },
  { value: "agi", label: "AGI 관전 포인트" },
];

type SubscribePayload = {
  email: string;
  name?: string;
  interests: Interest[];
  consent: boolean;
  website: string;
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export function SignupForm({ placement = "hero" }: { placement?: "hero" | "footer" }) {
  const emailId = useId();
  const consentId = useId();
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [interests, setInterests] = useState<Interest[]>([]);

  const submit = useCallback(async (payload: SubscribePayload) => {
    setState("pending");
    setMessage("");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok: boolean; message: string };
      setMessage(result.message);
      setState(result.ok ? "success" : "error");
      if (!response.ok && result.ok) setState("error");
      return result;
    } catch {
      const result = {
        ok: false,
        message: "연결을 확인한 뒤 다시 시도해주세요. 계속 실패하면 lproof073@gmail.com으로 알려주세요.",
      };
      setMessage(result.message);
      setState("error");
      return result;
    }
  }, []);

  useEffect(() => {
    const modelContext = (
      document as Document & {
        modelContext?: {
          registerTool?: (
            tool: {
              name: string;
              title: string;
              description: string;
              inputSchema: object;
              annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
              execute: (input: SubscribePayload) => Promise<unknown>;
            },
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!modelContext?.registerTool || placement !== "hero") return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      modelContext.registerTool(
        {
          name: "request_lproof_briefing",
          title: "L-Proof-AI 브리핑 신청",
          description: "동의를 받은 이메일 주소로 L-Proof-AI 브리핑 구독을 신청하고 화면에 결과를 표시합니다.",
          inputSchema: {
            type: "object",
            properties: {
              email: { type: "string", format: "email" },
              name: { type: "string", maxLength: 120 },
              interests: {
                type: "array",
                items: { enum: ["coding-agents", "llm", "agi"] },
                maxItems: 3,
              },
              consent: { const: true },
              website: { const: "" },
              source: { const: "webmcp" },
            },
            required: ["email", "interests", "consent", "website", "source"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute: async (input) => {
            if (!input?.email || input.consent !== true) {
              throw new Error("유효한 이메일과 개인정보 수집·이용 동의가 필요합니다.");
            }
            return submit({ ...input, source: "webmcp", website: "" });
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, [placement, submit]);

  function toggleInterest(value: Interest, checked: boolean) {
    setInterests((current) =>
      checked ? Array.from(new Set([...current, value])) : current.filter((item) => item !== value),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!consent) {
      setState("error");
      setMessage("개인정보 수집·이용 동의가 필요해요.");
      return;
    }
    const data = new FormData(form);
    const query = new URLSearchParams(window.location.search);
    await submit({
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      name: String(data.get("name") ?? "").trim() || undefined,
      interests,
      consent,
      website: String(data.get("website") ?? ""),
      source: placement,
      utmSource: query.get("utm_source") ?? undefined,
      utmMedium: query.get("utm_medium") ?? undefined,
      utmCampaign: query.get("utm_campaign") ?? undefined,
    });
  }

  if (state === "success") {
    return (
      <div className="signup-success" role="status" aria-live="polite">
        <LStamp size="large" />
        <div>
          <strong>브리핑 신청이 접수됐어요.</strong>
          <p>{message.replace("브리핑 신청이 접수됐어요. ", "")}</p>
        </div>
      </div>
    );
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit} noValidate>
      <div className="signup-row">
        <label className="sr-only" htmlFor={emailId}>이메일</label>
        <Input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          maxLength={254}
          aria-invalid={state === "error"}
          aria-describedby={emailId + "-message"}
          className="signup-input"
        />
        <Button type="submit" className="signup-button" disabled={state === "pending"}>
          {state === "pending" ? "접수 중…" : "브리핑 신청하기"}
        </Button>
      </div>
      <details className="optional-fields">
        <summary>이름과 관심 분야도 알려주기 <span>선택</span></summary>
        <div className="optional-fields-body">
          <label htmlFor={emailId + "-name"}>이름 또는 닉네임</label>
          <Input id={emailId + "-name"} name="name" maxLength={120} placeholder="어떻게 불러드릴까요?" />
          <fieldset>
            <legend>관심 분야</legend>
            <div className="interest-options">
              {interestOptions.map((option) => (
                <label key={option.value}>
                  <Checkbox
                    checked={interests.includes(option.value)}
                    onCheckedChange={(checked) => toggleInterest(option.value, checked === true)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </details>
      <div className="honeypot" aria-hidden="true">
        <label>웹사이트<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="consent-row">
        <Checkbox
          id={consentId}
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          aria-describedby={emailId + "-message"}
        />
        <label htmlFor={consentId}>
          [필수] <a href="/privacy">개인정보 수집·이용</a>에 동의해요.
        </label>
      </div>
      <p className="form-message" id={emailId + "-message"} aria-live="polite">{message}</p>
    </form>
  );
}
