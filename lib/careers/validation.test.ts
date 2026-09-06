import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeUrl,
  isValidUrl,
  isValidLinkedIn,
  validateName,
  validateEmail,
  validatePhone,
  validateLocation,
  validateRole,
  validateLinkedIn,
  validateGitHub,
  validatePortfolio,
  validateExperience,
  validateTechStack,
  validateResume,
  validateJobTitle,
  validateCompany,
  validateEmploymentType,
  validateNoticePeriod,
  validateMotivation,
  validateApplicationPayload,
  type CareerApplicationData,
} from "./validation.ts";

test("URL normalization strips protocols, www, and trailing slashes", () => {
  assert.equal(normalizeUrl("https://www.linkedin.com/in/jane/"), "linkedin.com/in/jane");
  assert.equal(normalizeUrl("http://linkedin.com/in/jane"), "linkedin.com/in/jane");
  assert.equal(normalizeUrl("https://github.com/growxlabs/"), "github.com/growxlabs");
});

test("Name validation enforces authentic letters and minimum length", () => {
  assert.equal(validateName(""), "Full name is required.");
  assert.equal(validateName("A"), "Please enter your full name (at least 2 characters).");
  assert.equal(validateName("12345"), "Please enter a valid full name using letters only.");
  assert.equal(validateName("Jane Doe @!"), "Please enter a valid full name using letters only.");
  assert.equal(validateName("Jane Doe"), null);
  assert.equal(validateName("Renée O'Connor-Smith"), null);
});

test("Email validation enforces standard email address format", () => {
  assert.equal(validateEmail(""), "Email address is required.");
  assert.equal(validateEmail("not-an-email"), "Please enter a valid email address (e.g. name@example.com).");
  assert.equal(validateEmail("test@domain"), "Please enter a valid email address (e.g. name@example.com).");
  assert.equal(validateEmail("jane.doe@growxlabs.tech"), null);
});

test("Phone validation enforces 7-15 digits and proper international formatting", () => {
  assert.equal(validatePhone(""), "Phone number is required.");
  assert.equal(validatePhone("12345"), "Please enter a valid phone number with 7 to 15 digits.");
  assert.equal(validatePhone("not-a-phone-number"), "Please enter a valid phone number with 7 to 15 digits.");
  assert.equal(validatePhone("+91 98765 43210"), null);
  assert.equal(validatePhone("+1 (555) 234-5678"), null);
});

test("Location validation enforces minimum 2 characters", () => {
  assert.equal(validateLocation(""), "Location is required.");
  assert.equal(validateLocation("A"), "Please enter a valid location or 'Remote' (at least 2 characters).");
  assert.equal(validateLocation("Bengaluru, India"), null);
  assert.equal(validateLocation("Remote"), null);
});

test("Role validation enforces selection", () => {
  assert.equal(validateRole(""), "Please select a target role.");
  assert.equal(validateRole("AI Engineering/Software Engineering"), null);
});

test("LinkedIn validation requires genuine LinkedIn profile URL", () => {
  assert.equal(validateLinkedIn(""), "LinkedIn profile URL is required.");
  assert.equal(validateLinkedIn("https://google.com"), "Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/yourname).");
  assert.equal(validateLinkedIn("https://github.com/janedoe"), "Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/yourname).");
  assert.equal(validateLinkedIn("https://linkedin.com/"), "Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/yourname).");
  assert.equal(validateLinkedIn("https://linkedin.com/in/janedoe"), null);
  assert.equal(validateLinkedIn("linkedin.com/in/janedoe"), null);
});

test("GitHub validation enforces valid URL and rejects duplicate of LinkedIn", () => {
  assert.equal(validateGitHub(""), "GitHub, portfolio, or showreel link is required.");
  assert.equal(validateGitHub("not a url"), "Please enter a valid URL (e.g. https://github.com/username or https://portfolio.com).");
  
  // Anti-duplication check against LinkedIn
  const linkedin = "https://linkedin.com/in/janedoe";
  assert.equal(
    validateGitHub("https://linkedin.com/in/janedoe", linkedin),
    "GitHub/Portfolio link cannot duplicate your LinkedIn profile URL. Please provide your code repository or work sample."
  );
  assert.equal(
    validateGitHub("http://www.linkedin.com/in/janedoe/", linkedin),
    "GitHub/Portfolio link cannot duplicate your LinkedIn profile URL. Please provide your code repository or work sample."
  );

  assert.equal(validateGitHub("https://github.com/janedoe", linkedin), null);
});

test("Portfolio / Other Work validation enforces valid URL and rejects duplicate of LinkedIn or GitHub", () => {
  const linkedin = "https://linkedin.com/in/janedoe";
  const github = "https://github.com/janedoe";

  assert.equal(validatePortfolio(""), "Project or case study link is required.");
  assert.equal(validatePortfolio("just-text"), "Please enter a valid URL (e.g. https://case-study.com or project link).");

  // Duplicate of LinkedIn
  assert.equal(
    validatePortfolio("https://linkedin.com/in/janedoe", linkedin, github),
    "This project link cannot duplicate your LinkedIn profile URL."
  );

  // Duplicate of GitHub
  assert.equal(
    validatePortfolio("https://github.com/janedoe", linkedin, github),
    "This project link cannot duplicate your GitHub/portfolio link from the previous step."
  );

  // Unique project URL
  assert.equal(validatePortfolio("https://janedoe.framer.website", linkedin, github), null);
});

test("Experience validation enforces presence", () => {
  assert.equal(validateExperience(""), "Years of experience is required.");
  assert.equal(validateExperience("3 years"), null);
  assert.equal(validateExperience("Fresher"), null);
});

test("Tech Stack validation enforces presence and minimum length", () => {
  assert.equal(validateTechStack(""), "Primary tech, tool, or stack is required.");
  assert.equal(validateTechStack("C"), "Please enter a valid language or creative tool (e.g. Next.js, Figma).");
  assert.equal(validateTechStack("TypeScript, Next.js, Supabase"), null);
});

test("Resume validation enforces upload presence", () => {
  assert.equal(validateResume(""), "Please upload your resume or CV (PDF or DOCX).");
  assert.equal(validateResume("https://r2.growxlabs.com/resumes/jane-doe.pdf"), null);
});

test("Job Title validation enforces presence and length", () => {
  assert.equal(validateJobTitle(""), "Current or last job title is required.");
  assert.equal(validateJobTitle("S"), "Please enter a valid job title (e.g. Software Engineer, Student).");
  assert.equal(validateJobTitle("Full-Stack Engineer"), null);
});

test("Company validation enforces presence and rejects duplicate of Job Title", () => {
  assert.equal(validateCompany(""), "Current or last company or university is required.");
  assert.equal(validateCompany("Software Engineer", "Software Engineer"), "Company name cannot be identical to your job title.");
  assert.equal(validateCompany("software engineer", "Software Engineer"), "Company name cannot be identical to your job title.");
  assert.equal(validateCompany("GrowX Labs", "Software Engineer"), null);
});

test("Employment Type and Notice Period validation enforce selection", () => {
  assert.equal(validateEmploymentType(""), "Please select an employment preference.");
  assert.equal(validateEmploymentType("Full-Time (Remote)"), null);

  assert.equal(validateNoticePeriod(""), "Please select your notice period.");
  assert.equal(validateNoticePeriod("Immediate (Within 7 days)"), null);
});

test("Motivation validation enforces 20+ chars, 4+ words, and anti-spam word diversity", () => {
  assert.equal(validateMotivation(""), "Please share why you want to join GrowX Labs.");
  assert.equal(validateMotivation("Too short"), "Please share a meaningful response on what drives you (at least 20 characters).");
  assert.equal(
    validateMotivation("good good good good good good good"),
    "Please enter genuine text rather than repeating the same word."
  );
  assert.equal(
    validateMotivation("I am passionate about building AI-first platforms and want to collaborate with high-caliber teams."),
    null
  );
});

test("Full application payload validation passes with authentic, non-duplicated data", () => {
  const validData: CareerApplicationData = {
    name: "Jane Doe",
    email: "jane.doe@growxlabs.tech",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    role: "AI Engineering/Software Engineering",
    linkedin: "https://linkedin.com/in/janedoe",
    github: "https://github.com/janedoe",
    portfolio: "https://janedoe.framer.website/case-study",
    experience: "3 years",
    techStack: "TypeScript, Python, FastAPI, Next.js",
    resume: "https://r2.growxlabs.com/resumes/jane-doe.pdf",
    jobTitle: "Senior Frontend Engineer",
    company: "Acme Corp",
    employmentType: "Full-Time (Remote)",
    noticePeriod: "Immediate (Within 7 days)",
    motivation: "I have followed GrowX Labs' work on autonomous agents and want to contribute my deep experience in Next.js and LLM orchestration.",
  };

  assert.equal(validateApplicationPayload(validData), null);
});

test("Full application payload catches duplicate URLs across steps", () => {
  const duplicatedUrlData: Partial<CareerApplicationData> = {
    name: "Jane Doe",
    email: "jane.doe@growxlabs.tech",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    role: "AI Engineering/Software Engineering",
    linkedin: "https://linkedin.com/in/janedoe",
    github: "https://linkedin.com/in/janedoe", // Duplicate of LinkedIn
  };

  const result = validateApplicationPayload(duplicatedUrlData);
  assert.notEqual(result, null);
  assert.equal(result?.step, 8);
  assert.match(result?.error || "", /cannot duplicate your LinkedIn profile URL/);
});
