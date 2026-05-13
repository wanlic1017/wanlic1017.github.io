import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import HubsPage from "./pages/HubsPage";
import CelsPage from "./pages/CelsPage";
import ModulePage from "./pages/ModulePage";
import MindMapPage from "./pages/MindMapPage";
import LoginPage from "./pages/LoginPage";
import QuestionPage from "./pages/QuestionPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AccountPage from "./pages/AccountPage";
import AuthActionPage from "./pages/AuthActionPage";
import PlanChangeNotice from "./components/PlanChangeNotice";
import ResourceLibraryPage from "./pages/ResourceLibraryPage";

export default function App() {
  return (
    <>
      <PlanChangeNotice />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hubs191" element={<HubsPage />} />
        <Route path="/cels191" element={<CelsPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/action" element={<AuthActionPage />} />
        <Route path="/questions" element={<QuestionPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/library/:subjectSlug" element={<ResourceLibraryPage />} />
        <Route
          path="/:subjectSlug/:moduleSlug/mind-map"
          element={<MindMapPage />}
        />

        {/* 👇 ALWAYS LAST */}
        <Route path="/:subjectSlug/:moduleSlug" element={<ModulePage />} />
      </Routes>
    </>
  );
}
