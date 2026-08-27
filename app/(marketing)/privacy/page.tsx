import { PrivacyContent } from "./PrivacyContent";

export async function generateMetadata() {
  return {
    title: "Privacy Policy | GrowxLabs",
    description: "Learn how we protect your digital identity and project data within GrowxLabs.",
    alternates: {
      canonical: "https://growxlabs.tech/privacy"
    }
  };
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
