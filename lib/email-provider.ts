export type SendEmailInput = {
  to: string;
  subject: string;
  body: string;
  replyTo?: string | null;
  relatedId?: string | null;
};

export type SendEmailResult = {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
  actualRecipient?: string;
  intendedRecipient?: string;
};

function envFlag(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").toLowerCase());
}

export function getEmailProviderStatus() {
  const testMode = envFlag(process.env.EMAIL_TEST_MODE);
  return {
    provider: "resend" as const,
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    emailFromConfigured: Boolean(process.env.EMAIL_FROM),
    testMode,
    testRecipientConfigured: Boolean(process.env.EMAIL_TEST_RECIPIENT),
    replyToConfigured: Boolean(process.env.EMAIL_REPLY_TO)
  };
}

function htmlFromText(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export async function sendEmail({ to, subject, body, replyTo, relatedId }: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const configuredReplyTo = replyTo || process.env.EMAIL_REPLY_TO || undefined;
  const testMode = envFlag(process.env.EMAIL_TEST_MODE);
  const testRecipient = process.env.EMAIL_TEST_RECIPIENT;
  const intendedRecipient = to;
  const actualRecipient = testMode ? testRecipient : to;

  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not configured.", intendedRecipient, actualRecipient: actualRecipient || undefined };
  if (!from) return { ok: false, error: "EMAIL_FROM is not configured.", intendedRecipient, actualRecipient: actualRecipient || undefined };
  if (!actualRecipient) return { ok: false, error: testMode ? "EMAIL_TEST_RECIPIENT is required while EMAIL_TEST_MODE is true." : "Recipient email is required.", intendedRecipient };
  if (!subject.trim()) return { ok: false, error: "Email subject is required.", intendedRecipient, actualRecipient };
  if (!body.trim()) return { ok: false, error: "Email body is required.", intendedRecipient, actualRecipient };

  const testPrefix = testMode ? `[EMAIL TEST MODE]\nIntended recipient: ${intendedRecipient || "Not set"}\nRelated id: ${relatedId || "Not set"}\n\n` : "";
  const finalBody = `${testPrefix}${body}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [actualRecipient],
        subject,
        text: finalBody,
        html: htmlFromText(finalBody),
        reply_to: configuredReplyTo,
        headers: relatedId ? { "X-Crystal-Communication-Id": relatedId } : undefined
      })
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: typeof json?.message === "string" ? json.message : `Resend failed with ${response.status}.`, actualRecipient, intendedRecipient };
    }

    return { ok: true, providerMessageId: typeof json?.id === "string" ? json.id : undefined, actualRecipient, intendedRecipient };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Email provider request failed.", actualRecipient, intendedRecipient };
  }
}
