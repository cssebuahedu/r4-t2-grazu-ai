import { describe, expect, it } from "vitest";
import { openAiExample, validateEndpointConfig, type EndpointConfigInput } from "@/lib/red-teaming";

const ok: EndpointConfigInput = { name: "EP", productId: "UC-001", url: "https://api.example.com/v1", authType: "None", credentialProvided: false, ...openAiExample };
describe("endpoint config validation", () => {
  it("accepts the OpenAI-compatible example", () => expect(validateEndpointConfig(ok)).toEqual({}));
  it("requires the {{prompt}} placeholder", () => expect(validateEndpointConfig({ ...ok, bodyTemplate: '{"a":"b"}' })["bodyTemplate"]).toMatch("{{prompt}}"));
  it("rejects invalid JSON, URL and response path", () => {
    const e = validateEndpointConfig({ ...ok, bodyTemplate: "{bad", url: "ftp://x", responsePath: "choices.0" });
    expect(Object.keys(e).sort()).toEqual(["bodyTemplate", "responsePath", "url"]);
  });
  it("requires a credential when auth is set", () => expect(validateEndpointConfig({ ...ok, authType: "Bearer Token" })["credential"]).toBeDefined());
});
