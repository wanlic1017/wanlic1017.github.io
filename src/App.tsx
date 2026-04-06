import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import HubsPage from "./pages/HubsPage";
import CelsPage from "./pages/CelsPage";
import ModulePage from "./pages/ModulePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import QuestionPage from "./pages/QuestionPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/hubs191" element={<HubsPage />} />
      <Route path="/cels191" element={<CelsPage />} />
      <Route path="/:subjectSlug/:moduleSlug" element={<ModulePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/question" element={<QuestionPage />} />
    </Routes>
  );
}