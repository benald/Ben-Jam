import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Biography from "./pages/Biography";
import Releases from "./pages/Releases";
import Mixes from "./pages/Mixes";
import Demos from "./pages/Demos";
import RecordLabel from "./pages/RecordLabel";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/biography" element={<Biography />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/mixes" element={<Mixes />} />
          <Route path="/demos" element={<Demos />} />
          <Route path="/label" element={<RecordLabel />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
