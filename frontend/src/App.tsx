import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Layout from "./pages/Layout";
import VideoGrid from "./components/VideoGrid";
const App = () => (
  <>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Redirect base URL to a default view */}
          <Route index element={<Navigate to="/random" replace />} />

          {/* Route for random videos */}
          <Route path="random" element={<VideoGrid />} />

          {/* Redirect /latest to the first page */}
          <Route path="latest" element={<Navigate to="/latest/1" replace />} />

          {/* Dynamic route for paginated latest videos */}
          <Route path="latest/:pageNumber" element={<VideoGrid />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </>
);
export default App;
