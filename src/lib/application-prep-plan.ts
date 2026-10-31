import { extractedSchema } from "@/lib/application-data";
import { formatCalendarDate } from "@/lib/dates";

type PrepPlanInput = {
  title: string;
  role: string;
  deadline: Date | null;
  postingText: string;
  extracted: unknown;
};

export type PrepRoadmap = { label: string; url: string };
export type PrepPlanSuggestions = { tasks: string[]; roadmaps: PrepRoadmap[] };

const ROADMAPS: { label: string; slug: string; pattern: RegExp }[] = [
  { label: "Frontend", slug: "frontend", pattern: /\bfrontend\b|\bfront[- ]end\b/ },
  { label: "Backend", slug: "backend", pattern: /\bbackend\b|\bback[- ]end\b/ },
  { label: "Full Stack", slug: "full-stack", pattern: /\bfull[- ]stack\b/ },
  { label: "React", slug: "react", pattern: /\breact\b/ },
  { label: "JavaScript", slug: "javascript", pattern: /\b(javascript|node\.js)\b/ },
  { label: "TypeScript", slug: "typescript", pattern: /\btypescript\b/ },
  { label: "Python", slug: "python", pattern: /\bpython\b/ },
  { label: "Java", slug: "java", pattern: /\bjava\b/ },
  { label: "SQL", slug: "sql", pattern: /\b(sql|postgres(?:ql)?|mysql)\b/ },
  { label: "DevOps", slug: "devops", pattern: /\b(devops|site reliability|sre)\b/ },
  { label: "Kubernetes", slug: "kubernetes", pattern: /\bkubernetes\b/ },
  { label: "Data Analyst", slug: "data-analyst", pattern: /\bdata analyst\b/ },
  { label: "Data Engineer", slug: "data-engineer", pattern: /\bdata engineer\b/ },
  { label: "Cyber Security", slug: "cyber-security", pattern: /\b(cyber ?security|security engineer)\b/ },
  { label: "QA", slug: "qa", pattern: /\b(quality assurance|qa engineer|test automation)\b/ },
  { label: "Android", slug: "android", pattern: /\bandroid\b/ },
  { label: "iOS", slug: "ios", pattern: /\bios\b|\bswift\b/ },
];

const MAX_TASK_LENGTH = 160;

function task(text: string) {
  return text.length <= MAX_TASK_LENGTH ? text : `${text.slice(0, MAX_TASK_LENGTH - 1).trimEnd()}…`;
}

/** A small, editable, no-AI checklist grounded in the saved posting and details. */
export function applicationPrepPlan(application: PrepPlanInput): PrepPlanSuggestions {
  const posting = application.postingText.toLowerCase();
  const extracted = extractedSchema.safeParse(application.extracted);
  const role = application.role.trim() || application.title.trim() || "this role";
  const requirementText = extracted.success ? extracted.data.requirements.map((requirement) => requirement.text).join(" ") : "";
  const steps = [
    application.deadline
      ? `Plan to submit by ${formatCalendarDate(application.deadline)}`
      : "Find the application deadline in the original post",
    "Check the employer’s eligibility, location, and work authorization rules",
  ];

  const requirements = extracted.success
    ? [...new Set(extracted.data.requirements.map((requirement) => requirement.skill || requirement.text).filter(Boolean))].slice(0, 4)
    : [];
  steps.push(
    requirements.length
      ? task(`Prepare truthful examples for: ${requirements.join(", ")}`)
      : task(`Note your strongest evidence for the key requirements in ${role}`),
    task(`Tailor your resume for ${role}`),
  );

  if (/\b(cover letter|motivation letter|letter of interest)\b/.test(posting)) steps.push("Prepare the cover letter requested in the post");
  if (/\b(portfolio|work sample|case stud(?:y|ies))\b/.test(posting)) steps.push("Choose the portfolio or work samples requested for this role");
  if (/\b(transcript|academic record)\b/.test(posting)) steps.push("Find the transcript or academic records requested in the post");
  if (/\b(reference|referee|recommendation letter)\b/.test(posting)) steps.push("Check whether references or recommendation letters are required");
  if (/\b(take[- ]home|coding challenge|technical assessment|skills assessment)\b/.test(posting)) {
    steps.push("Check the assessment format, allowed tools, and due date");
  }

  steps.push("Confirm the submission method and required documents on the original post", "Submit and record the date", "Set a follow-up reminder if you have not heard back");
  const roadmapContext = `${role} ${application.title} ${requirementText}`.toLowerCase();
  const roadmaps = ROADMAPS.filter(({ pattern }) => pattern.test(roadmapContext))
    .slice(0, 3)
    .map(({ label, slug }) => ({ label, url: `https://roadmap.sh/${slug}` }));

  return { tasks: [...new Set(steps)].slice(0, 12).map(task), roadmaps };
}
