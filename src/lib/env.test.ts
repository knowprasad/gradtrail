import path from "node:path";

import { describe, expect, it } from "vitest";

import { EnvError, parseEnv } from "./env";

// A hash of "correct horse" (scripts/hash-password.ts).
const PASSWORD_HASH = "argon2id:m=19456,t=2,p=1:CLZW5wQoCjh3Q9CHBp_JWw:Ak2xS7TYlYYrhemlgBkVxFmWXfcMq_rjd0mJGZcZFfA";

const valid = {
  NORTHSTAR_PASSWORD: PASSWORD_HASH,
  NORTHSTAR_SECRET: "a".repeat(32),
  DATABASE_URL: "postgresql://postgres:postgres@db:5432/northstar",
};

function problems(source: Record<string, string | undefined>): string[] {
  try {
    parseEnv(source);
  } catch (error) {
    if (error instanceof EnvError) return error.problems;
    throw error;
  }
  throw new Error("Expected parseEnv to throw");
}

describe("parseEnv", () => {
  it("accepts the required variables and fills in defaults", () => {
    expect(parseEnv(valid)).toEqual({
      ...valid,
      NORTHSTAR_DATA_DIR: "/data",
      NORTHSTAR_BACKUP_RETENTION_DAYS: 14,
      NORTHSTAR_TELEMETRY: undefined,
    });
  });

  it("reads whether the usage ping is on", () => {
    // Unset or empty: not decided, so GradTrail asks (#172).
    expect(parseEnv({ ...valid, NORTHSTAR_TELEMETRY: "" }).NORTHSTAR_TELEMETRY).toBeUndefined();
    expect(parseEnv(valid).NORTHSTAR_TELEMETRY).toBeUndefined();
    expect(parseEnv({ ...valid, NORTHSTAR_TELEMETRY: "ON" }).NORTHSTAR_TELEMETRY).toBe("on");
    expect(parseEnv({ ...valid, NORTHSTAR_TELEMETRY: " Off " }).NORTHSTAR_TELEMETRY).toBe("off");
    expect(problems({ ...valid, NORTHSTAR_TELEMETRY: "false" })).toEqual(['NORTHSTAR_TELEMETRY must be on or off (got "false").']);
  });

  it("reads the optional variables", () => {
    const env = parseEnv({
      ...valid,
      NORTHSTAR_DATA_DIR: "/srv/northstar",
      NORTHSTAR_BACKUP_RETENTION_DAYS: "30",
      NORTHSTAR_AI_PROVIDER: "local",
      NORTHSTAR_AI_URL: "http://ollama:11434",
      NORTHSTAR_AI_MODEL: "llama3.1:8b",
      NORTHSTAR_AI_KEY: "sk-test",
    });
    expect(env).toMatchObject({
      NORTHSTAR_DATA_DIR: "/srv/northstar",
      NORTHSTAR_BACKUP_RETENTION_DAYS: 30,
      NORTHSTAR_AI_PROVIDER: "local",
      NORTHSTAR_AI_URL: "http://ollama:11434",
      NORTHSTAR_AI_MODEL: "llama3.1:8b",
      NORTHSTAR_AI_KEY: "sk-test",
    });
  });

  it("reads the AI timeout in seconds", () => {
    expect(parseEnv({ ...valid, NORTHSTAR_AI_TIMEOUT_SECONDS: " 300 " }).NORTHSTAR_AI_TIMEOUT_SECONDS).toBe(300);
    expect(() => parseEnv({ ...valid, NORTHSTAR_AI_TIMEOUT_SECONDS: "5m" })).toThrow(/whole number of seconds/);
    expect(() => parseEnv({ ...valid, NORTHSTAR_AI_TIMEOUT_SECONDS: "1" })).toThrow(/at least 5/);
  });

  it("resolves a relative data directory", () => {
    const env = parseEnv({ ...valid, NORTHSTAR_DATA_DIR: "./data" });
    expect(env.NORTHSTAR_DATA_DIR).toBe(path.resolve("data"));
  });

  it("treats empty values as unset", () => {
    const env = parseEnv({ ...valid, NORTHSTAR_AI_KEY: "", NORTHSTAR_DATA_DIR: " " });
    expect(env.NORTHSTAR_AI_KEY).toBeUndefined();
    expect(env.NORTHSTAR_DATA_DIR).toBe("/data");
    expect(problems({ ...valid, NORTHSTAR_PASSWORD: "" })).toEqual([
      expect.stringMatching(/^NORTHSTAR_PASSWORD is not set\./),
    ]);
  });

  it("names every missing required variable", () => {
    expect(problems({})).toEqual([
      expect.stringMatching(/^NORTHSTAR_PASSWORD is not set\. Set it to/),
      expect.stringMatching(/^NORTHSTAR_SECRET is not set\. .*openssl rand/),
      expect.stringMatching(/^DATABASE_URL is not set\. /),
    ]);
  });

  it("wants a hash of the password, not the password itself", () => {
    expect(problems({ ...valid, NORTHSTAR_PASSWORD: "correct horse" })).toEqual([
      expect.stringMatching(/^NORTHSTAR_PASSWORD must be a hash of your password, not the password itself\. .*hash-password/),
    ]);
    expect(parseEnv({ ...valid, NORTHSTAR_PASSWORD: ` ${PASSWORD_HASH}\n` }).NORTHSTAR_PASSWORD).toBe(PASSWORD_HASH);
  });

  it("rejects a secret shorter than 32 characters", () => {
    expect(problems({ ...valid, NORTHSTAR_SECRET: "short" })).toEqual([
      expect.stringMatching(/^NORTHSTAR_SECRET is too short \(5 characters\)\./),
    ]);
  });

  it("never echoes secret values", () => {
    const messages = problems({
      NORTHSTAR_PASSWORD: "hunter2",
      NORTHSTAR_SECRET: "tiny-secret",
      DATABASE_URL: "mysql://root:db-password@db/northstar",
    }).join("\n");
    expect(messages).not.toContain("hunter2");
    expect(messages).not.toContain("tiny-secret");
    expect(messages).not.toContain("db-password");
    expect(messages).toMatch(/DATABASE_URL must be a PostgreSQL connection string/);
  });

  it("rejects invalid optional values", () => {
    expect(
      problems({
        ...valid,
        NORTHSTAR_BACKUP_RETENTION_DAYS: "two weeks",
        NORTHSTAR_AI_PROVIDER: "gemini",
        NORTHSTAR_AI_URL: "ftp://example.com",
      }),
    ).toEqual([
      'NORTHSTAR_BACKUP_RETENTION_DAYS must be a whole number of days (got "two weeks").',
      'NORTHSTAR_AI_PROVIDER must be one of local, openai, anthropic, mistral, lmstudio (got "gemini").',
      "NORTHSTAR_AI_URL must be an http:// or https:// URL.",
    ]);
    expect(problems({ ...valid, NORTHSTAR_BACKUP_RETENTION_DAYS: "0" })).toEqual([
      "NORTHSTAR_BACKUP_RETENTION_DAYS must be at least 1.",
    ]);
  });
});

describe("job search variables (E14-4)", () => {
  it("reads the source and its keys", () => {
    expect(
      parseEnv({
        ...valid,
        NORTHSTAR_JOBS_SOURCE: "jsearch",
        NORTHSTAR_JSEARCH_KEY: "ak_test",
        NORTHSTAR_JSEARCH_HOST: "rapidapi",
        NORTHSTAR_ADZUNA_APP_ID: "app",
        NORTHSTAR_ADZUNA_KEY: "adz",
        NORTHSTAR_FREEHIRE_URL: "https://jobs.example/",
      }),
    ).toMatchObject({
      NORTHSTAR_JOBS_SOURCE: "jsearch",
      NORTHSTAR_JSEARCH_KEY: "ak_test",
      NORTHSTAR_JSEARCH_HOST: "rapidapi",
      NORTHSTAR_ADZUNA_APP_ID: "app",
      NORTHSTAR_ADZUNA_KEY: "adz",
      NORTHSTAR_FREEHIRE_URL: "https://jobs.example",
    });
    expect(parseEnv({ ...valid, NORTHSTAR_JOBS_SOURCE: "freehire" }).NORTHSTAR_JOBS_SOURCE).toBe("freehire");
  });

  it("reads whether the Bundesagentur für Arbeit is offered, and refuses choosing it while it's off (#223)", () => {
    expect(parseEnv(valid).NORTHSTAR_JOBS_ARBEITSAGENTUR).toBeUndefined();
    expect(parseEnv({ ...valid, NORTHSTAR_JOBS_ARBEITSAGENTUR: " OFF " }).NORTHSTAR_JOBS_ARBEITSAGENTUR).toBe("off");
    expect(problems({ ...valid, NORTHSTAR_JOBS_ARBEITSAGENTUR: "no" })).toEqual(['NORTHSTAR_JOBS_ARBEITSAGENTUR must be on or off (got "no").']);
    expect(problems({ ...valid, NORTHSTAR_JOBS_SOURCE: "arbeitsagentur", NORTHSTAR_JOBS_ARBEITSAGENTUR: "off" })).toEqual([
      "NORTHSTAR_JOBS_SOURCE is arbeitsagentur, but NORTHSTAR_JOBS_ARBEITSAGENTUR is off. Choose another source, or remove one of the two.",
    ]);
  });

  it("rejects sources and hosts it doesn't know, without echoing keys", () => {
    expect(problems({ ...valid, NORTHSTAR_JOBS_SOURCE: "linkedin", NORTHSTAR_JSEARCH_HOST: "google", NORTHSTAR_JSEARCH_KEY: "ak_secret" })).toEqual([
      'NORTHSTAR_JOBS_SOURCE must be one of jsearch, adzuna, arbeitsagentur, freehire, off (got "linkedin").',
      'NORTHSTAR_JSEARCH_HOST must be openwebninja or rapidapi (got "google").',
    ]);
  });
});
