import SubjectPageLayout from "../components/SubjectPageLayout";
import { getSubjectBySlug } from "../data/subjects";

export default function HubsPage() {
  const subject = getSubjectBySlug("hubs191");

  if (!subject) {
    return <div className="p-10">Subject not found.</div>;
  }

  return <SubjectPageLayout subject={subject} />;
}
