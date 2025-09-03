import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Layout from "./pages/Layout";
import VideoGrid from "./components/VideoGrid";
import { SettingsProvider } from "./contexts/SettingsContext"; // 1. Import the provider

const App = () => (
  <SettingsProvider>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/random" replace />} />
          <Route path="random" element={<VideoGrid />} />
          <Route path="latest" element={<Navigate to="/latest/1" replace />} />
          <Route path="latest/:pageNumber" element={<VideoGrid />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </SettingsProvider>
);

export default App;
