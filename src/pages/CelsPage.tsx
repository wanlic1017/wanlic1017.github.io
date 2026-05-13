import SubjectPageLayout from "../components/SubjectPageLayout";
import { getSubjectBySlug } from "../data/subjects";

export default function CelsPage() {
  const subject = getSubjectBySlug("cels191");

  if (!subject) {
    return <div className="p-10">Subject not found.</div>;
  }

  return <SubjectPageLayout subject={subject} />;
}
