import path from "node:path";

import { describe, expect, it } from "vitest";

import { EnvError, parseEnv } from "./env";

// A hash of "correct horse" (scripts/hash-password.ts).
const PASSWORD_HASH = "argon2id:m=19456,t=2,p=1:CLZW5wQoCjh3Q9CHBp_JWw:Ak2xS7TYlYYrhemlgBkVxFmWXfcMq_rjd0mJGZcZFfA";

const valid = {
  GRADTRAIL_PASSWORD: PASSWORD_HASH,
  GRADTRAIL_SECRET: "a".repeat(32),
  DATABASE_URL: "postgresql://postgres:postgres@db:5432/gradtrail",
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
      GRADTRAIL_DATA_DIR: path.resolve("/data"),
      GRADTRAIL_BACKUP_RETENTION_DAYS: 14,
    });
  });

  it("reads whether the usage ping is on", () => {
    // Unset or empty: not decided, so GradTrail asks (#172).
    expect(parseEnv({ ...valid, GRADTRAIL_TELEMETRY: "" }).GRADTRAIL_TELEMETRY).toBeUndefined();
    expect(parseEnv(valid).GRADTRAIL_TELEMETRY).toBeUndefined();
    expect(parseEnv({ ...valid, GRADTRAIL_TELEMETRY: "ON" }).GRADTRAIL_TELEMETRY).toBe("on");
    expect(parseEnv({ ...valid, GRADTRAIL_TELEMETRY: " Off " }).GRADTRAIL_TELEMETRY).toBe("off");
    expect(problems({ ...valid, GRADTRAIL_TELEMETRY: "false" })).toEqual(['GRADTRAIL_TELEMETRY must be on or off (got "false").']);
  });

  it("reads the optional variables", () => {
    const env = parseEnv({
      ...valid,
      GRADTRAIL_DATA_DIR: path.resolve("/srv/gradtrail"),
      GRADTRAIL_BACKUP_RETENTION_DAYS: "30",
      GRADTRAIL_AI_PROVIDER: "local",
      GRADTRAIL_AI_URL: "http://ollama:11434",
      GRADTRAIL_AI_MODEL: "llama3.1:8b",
      GRADTRAIL_AI_KEY: "sk-test",
    });
    expect(env).toMatchObject({
      GRADTRAIL_DATA_DIR: "/srv/gradtrail",
      GRADTRAIL_BACKUP_RETENTION_DAYS: 30,
      GRADTRAIL_AI_PROVIDER: "local",
      GRADTRAIL_AI_URL: "http://ollama:11434",
      GRADTRAIL_AI_MODEL: "llama3.1:8b",
      GRADTRAIL_AI_KEY: "sk-test",
    });
  });

  it("reads the AI timeout in seconds", () => {
    expect(parseEnv({ ...valid, GRADTRAIL_AI_TIMEOUT_SECONDS: " 300 " }).GRADTRAIL_AI_TIMEOUT_SECONDS).toBe(300);
    expect(() => parseEnv({ ...valid, GRADTRAIL_AI_TIMEOUT_SECONDS: "5m" })).toThrow(/whole number of seconds/);
    expect(() => parseEnv({ ...valid, GRADTRAIL_AI_TIMEOUT_SECONDS: "1" })).toThrow(/at least 5/);
  });

  it("resolves a relative data directory", () => {
    const env = parseEnv({ ...valid, GRADTRAIL_DATA_DIR: "./data" });
    expect(env.GRADTRAIL_DATA_DIR).toBe(path.resolve("data"));
  });

  it("treats empty values as unset", () => {
    const env = parseEnv({ ...valid, GRADTRAIL_AI_KEY: "", GRADTRAIL_DATA_DIR: " " });
    expect(env.GRADTRAIL_AI_KEY).toBeUndefined();
    expect(env.GRADTRAIL_DATA_DIR).toBe(path.resolve("/data"));
    expect(problems({ ...valid, GRADTRAIL_PASSWORD: "" })).toEqual([
      expect.stringMatching(/^GRADTRAIL_PASSWORD is not set\./),
    ]);
  });

  it("names every missing required variable", () => {
    expect(problems({})).toEqual([
      expect.stringMatching(/^GRADTRAIL_PASSWORD is not set\. Set it to/),
      expect.stringMatching(/^GRADTRAIL_SECRET is not set\. .*openssl rand/),
      expect.stringMatching(/^DATABASE_URL is not set\. /),
    ]);
  });

  it("wants a hash of the password, not the password itself", () => {
    expect(problems({ ...valid, GRADTRAIL_PASSWORD: "correct horse" })).toEqual([
      expect.stringMatching(/^GRADTRAIL_PASSWORD must be a hash of your password, not the password itself\. .*hash-password/),
    ]);
    expect(parseEnv({ ...valid, GRADTRAIL_PASSWORD: ` ${PASSWORD_HASH}\n` }).GRADTRAIL_PASSWORD).toBe(PASSWORD_HASH);
  });

  it("rejects a secret shorter than 32 characters", () => {
    expect(problems({ ...valid, GRADTRAIL_SECRET: "short" })).toEqual([
      expect.stringMatching(/^GRADTRAIL_SECRET is too short \(5 characters\)\./),
    ]);
  });

  it("never echoes secret values", () => {
    const messages = problems({
      GRADTRAIL_PASSWORD: "hunter2",
      GRADTRAIL_SECRET: "tiny-secret",
      DATABASE_URL: "mysql://root:db-password@db/gradtrail",
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
        GRADTRAIL_BACKUP_RETENTION_DAYS: "two weeks",
        GRADTRAIL_AI_PROVIDER: "gemini",
        GRADTRAIL_AI_URL: "ftp://example.com",
      }),
    ).toEqual([
      'GRADTRAIL_BACKUP_RETENTION_DAYS must be a whole number of days (got "two weeks").',
      'GRADTRAIL_AI_PROVIDER must be one of local, openai, anthropic, mistral, lmstudio (got "gemini").',
      "GRADTRAIL_AI_URL must be an http:// or https:// URL.",
    ]);
    expect(problems({ ...valid, GRADTRAIL_BACKUP_RETENTION_DAYS: "0" })).toEqual([
      "GRADTRAIL_BACKUP_RETENTION_DAYS must be at least 1.",
    ]);
  });
});

describe("job search variables (E14-4)", () => {
  it("reads the source and its keys", () => {
    expect(
      parseEnv({
        ...valid,
        GRADTRAIL_JOBS_SOURCE: "jsearch",
        GRADTRAIL_JSEARCH_KEY: "ak_test",
        GRADTRAIL_JSEARCH_HOST: "rapidapi",
        GRADTRAIL_ADZUNA_APP_ID: "app",
        GRADTRAIL_ADZUNA_KEY: "adz",
        GRADTRAIL_USAJOBS_KEY: "usajobs-key",
        GRADTRAIL_USAJOBS_EMAIL: "registered@example.com",
        GRADTRAIL_FREEHIRE_URL: "https://jobs.example/",
      }),
    ).toMatchObject({
      GRADTRAIL_JOBS_SOURCE: "jsearch",
      GRADTRAIL_JSEARCH_KEY: "ak_test",
      GRADTRAIL_JSEARCH_HOST: "rapidapi",
      GRADTRAIL_ADZUNA_APP_ID: "app",
      GRADTRAIL_ADZUNA_KEY: "adz",
      GRADTRAIL_USAJOBS_KEY: "usajobs-key",
      GRADTRAIL_USAJOBS_EMAIL: "registered@example.com",
      GRADTRAIL_FREEHIRE_URL: "https://jobs.example",
    });
    expect(parseEnv({ ...valid, GRADTRAIL_JOBS_SOURCE: "freehire" }).GRADTRAIL_JOBS_SOURCE).toBe("freehire");
  });

  it("reads whether the Bundesagentur für Arbeit is offered, and refuses choosing it while it's off (#223)", () => {
    expect(parseEnv(valid).GRADTRAIL_JOBS_ARBEITSAGENTUR).toBeUndefined();
    expect(parseEnv({ ...valid, GRADTRAIL_JOBS_ARBEITSAGENTUR: " OFF " }).GRADTRAIL_JOBS_ARBEITSAGENTUR).toBe("off");
    expect(problems({ ...valid, GRADTRAIL_JOBS_ARBEITSAGENTUR: "no" })).toEqual(['GRADTRAIL_JOBS_ARBEITSAGENTUR must be on or off (got "no").']);
    expect(problems({ ...valid, GRADTRAIL_JOBS_SOURCE: "arbeitsagentur", GRADTRAIL_JOBS_ARBEITSAGENTUR: "off" })).toEqual([
      "GRADTRAIL_JOBS_SOURCE is arbeitsagentur, but GRADTRAIL_JOBS_ARBEITSAGENTUR is off. Choose another source, or remove one of the two.",
    ]);
  });

  it("rejects sources and hosts it doesn't know, without echoing keys", () => {
    expect(problems({ ...valid, GRADTRAIL_JOBS_SOURCE: "linkedin", GRADTRAIL_JSEARCH_HOST: "google", GRADTRAIL_JSEARCH_KEY: "ak_secret" })).toEqual([
      'GRADTRAIL_JOBS_SOURCE must be one of jsearch, adzuna, arbeitsagentur, freehire, jooble, usajobs, remoteok, student_feeds, off (got "linkedin").',
      'GRADTRAIL_JSEARCH_HOST must be openwebninja or rapidapi (got "google").',
    ]);
  });
});
