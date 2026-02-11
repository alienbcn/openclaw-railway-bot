import { spawn } from "node:child_process";
import path from "node:path";
import { config } from "../config.js";

export interface OpenClawResult {
  text: string;
  raw: string;
}

function resolveBinPath(): string {
  if (path.isAbsolute(config.openclaw.binPath)) {
    return config.openclaw.binPath;
  }

  return path.resolve(process.cwd(), config.openclaw.binPath);
}

function resolveConfigPath(): string {
  if (path.isAbsolute(config.openclaw.configPath)) {
    return config.openclaw.configPath;
  }

  return path.resolve(process.cwd(), config.openclaw.configPath);
}

function extractTextFromJson(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const payloads = (payload as { payloads?: Array<{ text?: string }> }).payloads;
  if (!Array.isArray(payloads) || payloads.length === 0) return "";

  return payloads
    .map((item) => (typeof item?.text === "string" ? item.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function runOpenClawAgent(
  message: string,
  sessionId: string
): Promise<OpenClawResult> {
  const binPath = resolveBinPath();
  const configPath = resolveConfigPath();
  const timeoutMs = Math.max(1000, config.openclaw.timeoutSeconds * 1000);

  const args: string[] = [
    "agent",
    "--local",
    "--json",
    "--message",
    message,
    "--session-id",
    sessionId,
  ];

  if (config.openclaw.agentId) {
    args.push("--agent", config.openclaw.agentId);
  }

  if (config.openclaw.thinking) {
    args.push("--thinking", config.openclaw.thinking);
  }

  return await new Promise((resolve, reject) => {
    const child = spawn(binPath, args, {
      env: {
        ...process.env,
        OPENCLAW_CONFIG_PATH: configPath,
      },
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("OpenClaw timeout"));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        const message = stderr.trim() || stdout.trim() || "OpenClaw failed";
        reject(new Error(message));
        return;
      }

      const raw = stdout.trim();
      try {
        const parsed = JSON.parse(raw);
        const text = extractTextFromJson(parsed);
        resolve({ text: text || raw, raw });
      } catch {
        resolve({ text: raw, raw });
      }
    });
  });
}
