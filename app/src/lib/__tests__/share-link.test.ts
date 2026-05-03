import { describe, it, expect } from "vitest";
import { encodeState, decodeState } from "../share-link";

describe("encode/decode round-trip", () => {
  it("survives a round-trip on simple objects", () => {
    const state = { foo: "bar", count: 7 };
    const token = encodeState(state);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    const decoded = decodeState<typeof state>(token);
    expect(decoded).toEqual(state);
  });

  it("survives a round-trip on a realistic intake payload", () => {
    const state = {
      companyName: "Acme",
      industry: "Manufacturing",
      processName: "Inbound triage",
      processDescription: "Step 1: ticket comes in. Step 2: route. Step 3: draft. Step 4: ship.",
      currentMetric: "48 hours",
      targetMetric: "6 hours",
      dataReadiness: "Modern data stack",
      teamSize: "51-200",
      bottleneck: "Manual classification slows everything down by a day.",
      timeline: "30-90 days",
    };
    const decoded = decodeState<typeof state>(encodeState(state));
    expect(decoded).toEqual(state);
  });

  it("survives a round-trip on a scorecard answers payload", () => {
    const answers: Record<string, 0 | 1 | 2 | 3> = {
      "data-1": 2,
      "data-2": 1,
      "data-3": 3,
      "process-1": 0,
      "lead-1": 2,
    };
    const decoded = decodeState<typeof answers>(encodeState(answers));
    expect(decoded).toEqual(answers);
  });

  it("URL-safe — token never includes +, /, or =", () => {
    const token = encodeState({ a: "lots of repeated characters lots of repeated characters lots of repeated characters" });
    expect(token).not.toMatch(/[+/=]/);
  });

  it("compresses large repeated payloads", () => {
    const state = { items: Array(100).fill({ key: "value", n: 1 }) };
    const token = encodeState(state);
    expect(token.length).toBeLessThan(JSON.stringify(state).length);
    expect(decodeState<typeof state>(token)).toEqual(state);
  });

  it("handles unicode safely", () => {
    const state = { name: "Solidcage — Filip 🚀 Szałewicz", emoji: "👀 ⚙️" };
    const decoded = decodeState<typeof state>(encodeState(state));
    expect(decoded).toEqual(state);
  });
});
