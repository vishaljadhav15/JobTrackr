const skillKeywords = [
  "React.js",
  "JavaScript",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Mongoose",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "Bootstrap",
  "Vite",
  "REST APIs",
  "Git",
  "GitHub",
  "Context API",
  "LocalStorage",
  "Google Sheets API",
  "TypeScript",
  "Next.js",
  "Redux",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "Firebase",
];

const extractSkills = (text = "") => {
  const normalizedText = text.toLowerCase();

  return skillKeywords.filter((skill) =>
    normalizedText.includes(skill.toLowerCase())
  );
};

module.exports = extractSkills;