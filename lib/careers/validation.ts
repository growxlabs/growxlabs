/**
 * Careers Form Strict Validation & Anti-Duplication Engine
 * Enforces authentic content across all 17 application steps:
 * - Proper format validation (name, email, phone, URLs, length, word count)
 * - Anti-duplication guards across URLs (LinkedIn vs GitHub vs Portfolio)
 * - Anti-duplication guards across Job Title vs Company
 * - Genuine motivation check (word diversity & minimum length)
 */

export interface CareerApplicationData {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  experience: string;
  techStack: string;
  github: string;
  linkedin: string;
  portfolio: string;
  resume: string;
  jobTitle: string;
  company: string;
  expectedSalary?: string;
  noticePeriod: string;
  employmentType: string;
  motivation: string;
}

/**
 * Normalizes a URL by stripping protocol, www, trailing slashes, and lowercasing
 * to catch copy-pasted duplicates regardless of formatting variations.
 */
export function normalizeUrl(url: string): string {
  if (!url) return "";
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

/**
 * Validates whether a string is a plausible URL or domain format.
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
  return urlPattern.test(trimmed);
}

/**
 * Validates that a string is specifically an authentic LinkedIn profile URL.
 */
export function isValidLinkedIn(url: string): boolean {
  if (!url) return false;
  const normalized = normalizeUrl(url);
  if (!normalized.startsWith("linkedin.com/")) return false;
  const path = normalized.replace("linkedin.com/", "").trim();
  return path.length >= 2;
}

export function validateName(name: string): string | null {
  const trimmed = name?.trim() || "";
  if (!trimmed) return "Full name is required.";
  if (trimmed.length < 2) return "Please enter your full name (at least 2 characters).";
  const namePattern = /^[a-zA-ZÀ-ÿ\s.'-]+$/;
  if (!namePattern.test(trimmed)) {
    return "Please enter a valid full name using letters only.";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email?.trim() || "";
  if (!trimmed) return "Email address is required.";
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(trimmed)) {
    return "Please enter a valid email address (e.g. name@example.com).";
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  const trimmed = phone?.trim() || "";
  if (!trimmed) return "Phone number is required.";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return "Please enter a valid phone number with 7 to 15 digits.";
  }
  const validChars = /^[0-9+\s\-().]+$/;
  if (!validChars.test(trimmed)) {
    return "Please enter a valid phone number format.";
  }
  return null;
}

export function validateLocation(location: string): string | null {
  const trimmed = location?.trim() || "";
  if (!trimmed) return "Location is required.";
  if (trimmed.length < 2) return "Please enter a valid location or 'Remote' (at least 2 characters).";
  return null;
}

export function validateRole(role: string): string | null {
  const trimmed = role?.trim() || "";
  if (!trimmed) return "Please select a target role.";
  return null;
}

export function validateLinkedIn(linkedin: string): string | null {
  const trimmed = linkedin?.trim() || "";
  if (!trimmed) return "LinkedIn profile URL is required.";
  if (!isValidLinkedIn(trimmed)) {
    return "Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/yourname).";
  }
  return null;
}

export function validateGitHub(github: string, linkedin?: string): string | null {
  const trimmed = github?.trim() || "";
  if (!trimmed) return "GitHub, portfolio, or showreel link is required.";
  if (!isValidUrl(trimmed)) {
    return "Please enter a valid URL (e.g. https://github.com/username or https://portfolio.com).";
  }
  if (linkedin && normalizeUrl(trimmed) === normalizeUrl(linkedin)) {
    return "GitHub/Portfolio link cannot duplicate your LinkedIn profile URL. Please provide your code repository or work sample.";
  }
  return null;
}

export function validatePortfolio(portfolio: string, linkedin?: string, github?: string): string | null {
  const trimmed = portfolio?.trim() || "";
  if (!trimmed) return "Project or case study link is required.";
  if (!isValidUrl(trimmed)) {
    return "Please enter a valid URL (e.g. https://case-study.com or project link).";
  }
  const normPort = normalizeUrl(trimmed);
  if (linkedin && normPort === normalizeUrl(linkedin)) {
    return "This project link cannot duplicate your LinkedIn profile URL.";
  }
  if (github && normPort === normalizeUrl(github)) {
    return "This project link cannot duplicate your GitHub/portfolio link from the previous step.";
  }
  return null;
}

export function validateExperience(experience: string): string | null {
  const trimmed = experience?.trim() || "";
  if (!trimmed) return "Years of experience is required.";
  if (trimmed.length > 30) return "Please enter a concise experience value (e.g. '2' or '3 years').";
  return null;
}

export function validateTechStack(techStack: string): string | null {
  const trimmed = techStack?.trim() || "";
  if (!trimmed) return "Primary tech, tool, or stack is required.";
  if (trimmed.length < 2) return "Please enter a valid language or creative tool (e.g. Next.js, Figma).";
  return null;
}

export function validateResume(resume: string): string | null {
  const trimmed = resume?.trim() || "";
  if (!trimmed) return "Please upload your resume or CV (PDF or DOCX).";
  return null;
}

export function validateJobTitle(jobTitle: string): string | null {
  const trimmed = jobTitle?.trim() || "";
  if (!trimmed) return "Current or last job title is required.";
  if (trimmed.length < 2) return "Please enter a valid job title (e.g. Software Engineer, Student).";
  return null;
}

export function validateCompany(company: string, jobTitle?: string): string | null {
  const trimmed = company?.trim() || "";
  if (!trimmed) return "Current or last company or university is required.";
  if (trimmed.length < 2) return "Please enter a valid company or university name.";
  if (jobTitle && trimmed.toLowerCase() === jobTitle.trim().toLowerCase()) {
    return "Company name cannot be identical to your job title.";
  }
  return null;
}

export function validateEmploymentType(employmentType: string): string | null {
  const trimmed = employmentType?.trim() || "";
  if (!trimmed) return "Please select an employment preference.";
  return null;
}

export function validateNoticePeriod(noticePeriod: string): string | null {
  const trimmed = noticePeriod?.trim() || "";
  if (!trimmed) return "Please select your notice period.";
  return null;
}

export function validateMotivation(motivation: string): string | null {
  const trimmed = motivation?.trim() || "";
  if (!trimmed) return "Please share why you want to join GrowX Labs.";
  if (trimmed.length < 20) {
    return "Please share a meaningful response on what drives you (at least 20 characters).";
  }
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 4) {
    return "Please provide at least a complete sentence (minimum 4 words).";
  }
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  if (uniqueWords.size < 3) {
    return "Please enter genuine text rather than repeating the same word.";
  }
  return null;
}

/**
 * Validates the complete application across all 17 steps in order.
 * Returns the first step number and error message encountered, or null if fully valid.
 */
export function validateApplicationPayload(data: Partial<CareerApplicationData>): { step: number; error: string } | null {
  const nameErr = validateName(data.name || "");
  if (nameErr) return { step: 1, error: nameErr };

  const emailErr = validateEmail(data.email || "");
  if (emailErr) return { step: 2, error: emailErr };

  const phoneErr = validatePhone(data.phone || "");
  if (phoneErr) return { step: 3, error: phoneErr };

  const locErr = validateLocation(data.location || "");
  if (locErr) return { step: 4, error: locErr };

  const roleErr = validateRole(data.role || "");
  if (roleErr) return { step: 5, error: roleErr };

  const liErr = validateLinkedIn(data.linkedin || "");
  if (liErr) return { step: 7, error: liErr };

  const ghErr = validateGitHub(data.github || "", data.linkedin);
  if (ghErr) return { step: 8, error: ghErr };

  const portErr = validatePortfolio(data.portfolio || "", data.linkedin, data.github);
  if (portErr) return { step: 9, error: portErr };

  const expErr = validateExperience(data.experience || "");
  if (expErr) return { step: 10, error: expErr };

  const techErr = validateTechStack(data.techStack || "");
  if (techErr) return { step: 11, error: techErr };

  const resErr = validateResume(data.resume || "");
  if (resErr) return { step: 12, error: resErr };

  const titleErr = validateJobTitle(data.jobTitle || "");
  if (titleErr) return { step: 13, error: titleErr };

  const compErr = validateCompany(data.company || "", data.jobTitle);
  if (compErr) return { step: 14, error: compErr };

  const empErr = validateEmploymentType(data.employmentType || "");
  if (empErr) return { step: 15, error: empErr };

  const notErr = validateNoticePeriod(data.noticePeriod || "");
  if (notErr) return { step: 16, error: notErr };

  const motErr = validateMotivation(data.motivation || "");
  if (motErr) return { step: 17, error: motErr };

  return null;
}
