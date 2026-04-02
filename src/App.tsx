import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HubsPage from "./pages/HubsPage";
import CelsPage from "./pages/CelsPage";
import ModulePage from "./pages/ModulePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hubs191" element={<HubsPage />} />
        <Route path="/cels191" element={<CelsPage />} />
        <Route path="/:subjectSlug/:moduleSlug" element={<ModulePage />} />
      </Routes>
    </BrowserRouter>
  );
}