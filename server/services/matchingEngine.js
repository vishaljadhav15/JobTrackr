const extractSkills = require("./skillExtractor");

const skillAliases = {
  html: "html",
  html5: "html",

  css: "css",
  css3: "css",

  react: "react.js",
  reactjs: "react.js",
  "react.js": "react.js",

  javascript: "javascript",
  js: "javascript",

  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",

  express: "express.js",
  expressjs: "express.js",
  "express.js": "express.js",

  mongodb: "mongodb",
  mongo: "mongodb",

  mongoose: "mongoose",

  "tailwind css": "tailwind css",
  tailwind: "tailwind css",
  tailwindcss: "tailwind css",

  bootstrap: "bootstrap",
  vite: "vite",

  git: "git",
  github: "github",

  "rest api": "rest apis",
  "rest apis": "rest apis",

  "context api": "context api",
  contextapi: "context api",

  localstorage: "localstorage",
  "local storage": "localstorage",

  "google sheets api": "google sheets api",

  typescript: "typescript",
  ts: "typescript",

  "next.js": "next.js",
  nextjs: "next.js",

  redux: "redux",

  sql: "sql",
  mysql: "mysql",
  postgresql: "postgresql",

  firebase: "firebase",
};

const normalizeSkill = (skill) => {
  if (typeof skill !== "string") {
    return "";
  }

  const normalized = skill
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  return skillAliases[normalized] || normalized;
};

const normalizeSkills = (skills = []) => {
  return [
    ...new Set(
      (Array.isArray(skills) ? skills : [])
        .map(normalizeSkill)
        .filter(Boolean),
    ),
  ];
};

const calculateMatch = (
  resumeSkills = [],
  jobSkills = [],
  jobTitle = "",
  jobDescription = "",
) => {
  const normalizedResumeSkills = normalizeSkills(resumeSkills);

  const extractedJobSkills = extractSkills(
    `${jobTitle} ${jobDescription}`,
  );

  const normalizedJobSkills = normalizeSkills(jobSkills);
  const normalizedExtractedSkills = normalizeSkills(extractedJobSkills);

  const uniqueJobSkills = [
    ...new Set([
      ...normalizedJobSkills,
      ...normalizedExtractedSkills,
    ]),
  ];

  const resumeSet = new Set(normalizedResumeSkills);

  const matchedSkills = uniqueJobSkills.filter((skill) =>
    resumeSet.has(skill),
  );

  const missingSkills = uniqueJobSkills.filter(
    (skill) => !resumeSet.has(skill),
  );

  const totalRequiredSkills = uniqueJobSkills.length;

  const matchScore =
    totalRequiredSkills === 0
      ? 0
      : Math.round(
          (matchedSkills.length / totalRequiredSkills) * 100,
        );

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    totalRequiredSkills,
    totalMatchedSkills: matchedSkills.length,
    totalMissingSkills: missingSkills.length,
    detectedJobSkills: normalizedExtractedSkills,
  };
};

module.exports = calculateMatch;