import { describe, it, expect } from "vitest";
import {
  personalizeEmail,
  resolveFirstName,
  escapeHtml,
  isRetryableError,
  retryAfterMs,
} from "./resend";

const WELCOME = "<h2>Welcome aboard, {{name}}!</h2>";

describe("resolveFirstName", () => {
  it("returns the first word of a full name", () => {
    expect(resolveFirstName("Rohit Sharma")).toBe("Rohit");
  });

  it("trims surrounding whitespace", () => {
    expect(resolveFirstName("  Priya   Patel ")).toBe("Priya");
  });

  it("falls back to Aspirant for empty or whitespace-only strings", () => {
    expect(resolveFirstName("")).toBe("Aspirant");
    expect(resolveFirstName("   ")).toBe("Aspirant");
  });

  it("falls back to Aspirant for null and undefined", () => {
    expect(resolveFirstName(null)).toBe("Aspirant");
    expect(resolveFirstName(undefined)).toBe("Aspirant");
  });

  it("caps the resolved first name at 100 chars", () => {
    expect(resolveFirstName(`${"x".repeat(200)} Long`)).toBe("x".repeat(100));
  });
});

describe("personalizeEmail", () => {
  it("replaces {{name}} with the escaped first name", () => {
    const html = personalizeEmail(WELCOME, { email: "rohit@x.com", name: "Rohit Sharma" });
    expect(html).toBe("<h2>Welcome aboard, Rohit!</h2>");
  });

  it("escapes HTML in the resolved name", () => {
    const html = personalizeEmail(WELCOME, { email: "x@x.com", name: "<b>hacker</b> Smith" });
    expect(html).toBe("<h2>Welcome aboard, &lt;b&gt;hacker&lt;/b&gt;!</h2>");
  });

  it("uses Aspirant when name is missing", () => {
    const html = personalizeEmail(WELCOME, { email: "x@x.com", name: null });
    expect(html).toBe("<h2>Welcome aboard, Aspirant!</h2>");
  });

  it("uses Aspirant when name is not a non-empty string", () => {
    const html = personalizeEmail(WELCOME, { email: "x@x.com", name: "  " });
    expect(html).toBe("<h2>Welcome aboard, Aspirant!</h2>");
  });

  it("leaves other placeholders untouched", () => {
    const html = personalizeEmail("<p>{{name}} {{unsubscribe_url}}</p>", { email: "x@x.com", name: "Rohit" });
    expect(html).toBe("<p>Rohit {{unsubscribe_url}}</p>");
  });
});

describe("escapeHtml", () => {
  it("escapes special characters", () => {
    expect(escapeHtml(`<a href="x">'&</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&lt;/a&gt;");
  });
});

describe("isRetryableError", () => {
  it("returns true for 429 rate limit errors", () => {
    expect(isRetryableError({ message: "rate limit", statusCode: 429, name: "rate_limit_exceeded" })).toBe(true);
  });

  it("returns true for 5xx server errors", () => {
    expect(isRetryableError({ message: "boom", statusCode: 500, name: "internal_server_error" })).toBe(true);
    expect(isRetryableError({ message: "boom", statusCode: 503, name: "application_error" })).toBe(true);
  });

  it("returns false for 4xx client errors", () => {
    expect(isRetryableError({ message: "bad", statusCode: 400, name: "validation_error" })).toBe(false);
    expect(isRetryableError({ message: "nope", statusCode: 422, name: "invalid_parameter" })).toBe(false);
  });

  it("returns false when statusCode is null", () => {
    expect(isRetryableError({ message: "?", statusCode: null, name: "application_error" })).toBe(false);
  });
});

describe("retryAfterMs", () => {
  it("honors the retry-after header", () => {
    const error = { message: "rate limit", statusCode: 429, name: "rate_limit_exceeded" };
    expect(retryAfterMs({ "retry-after": "5" }, error)).toBe(5000);
  });

  it("parses retry-after seconds from the error message when no header", () => {
    const error = { message: "You hit your rate limit. Please retry after 3 seconds", statusCode: 429, name: "rate_limit_exceeded" };
    expect(retryAfterMs(null, error)).toBe(3000);
  });

  it("returns null when there is no retry-after signal", () => {
    const error = { message: "server error", statusCode: 500, name: "internal_server_error" };
    expect(retryAfterMs(null, error)).toBe(null);
  });
});
