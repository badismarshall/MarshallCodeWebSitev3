/**
 * POST /api/admin/settings/test-ai
 * Verify an OpenAI API key works. Tests the key (and optional base URL) from
 * the request body when provided (the unsaved form values); otherwise the
 * stored/env-resolved values. Never echoes any key back.
 */

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSettings } from "@/models/settings.model";
import { resolveOpenAICredentials } from "@/lib/settings/credentials";
import * as z from "zod";
import { withApi } from "@/lib/api/handler";

const TestAiSchema = z.object({
  apiKey: z.string().max(500).optional(),
  baseURL: z.string().max(500).optional(),
});

export const POST = withApi(
  {
    auth: "admin",
    demo: "block-mutations",
    // Every test reaches an outside service (or sends real mail), so it is
    // throttled like test-carrier rather than left to the admin's patience.
    rateLimit: { action: "admin:settings:test-ai", preset: "strict" },
  },
  async ({ request }) => {
    try {
      let candidateKey = "";
      let candidateBaseURL = "";
      try {
        const body = TestAiSchema.parse(await request.json());
        if (typeof body.apiKey === "string") {
          candidateKey = body.apiKey.trim();
        }
        if (typeof body.baseURL === "string") {
          candidateBaseURL = body.baseURL.trim();
        }
      } catch {
        // Empty body is fine — fall through to the stored values.
      }

      const settings = await getSettings();
      const resolved = resolveOpenAICredentials(settings.aiAuthoring);
      const apiKey = candidateKey || resolved.apiKey || "";
      const baseURL = candidateBaseURL || resolved.baseURL || "";
      if (!apiKey) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No API key to test. Enter a key or set OPENAI_API_KEY in the environment.",
          },
          { status: 400 },
        );
      }

      const client = new OpenAI({
        apiKey,
        timeout: 15000,
        maxRetries: 0,
        ...(baseURL ? { baseURL } : {}),
      });
      await client.models.list();

      return NextResponse.json({
        success: true,
        message: "Connection successful. The OpenAI key is valid.",
      });
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        (error as { status?: number }).status === 401
          ? 400
          : 502;
      const message =
        status === 400
          ? "OpenAI rejected the key. Check that it is correct and active."
          : "Could not reach OpenAI. Check the key and your network, then try again.";
      return NextResponse.json({ success: false, message }, { status });
    }
  },
);
