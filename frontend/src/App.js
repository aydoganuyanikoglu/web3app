import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AddAsset from "./pages/AddAsset";
import Home from "./pages/Home";
import MyAssets from "./pages/MyAssets";
import { WalletProvider } from "./context/WalletContext";

function App() {
  return (
    <WalletProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddAsset />} />
          <Route path="/my-assets" element={<MyAssets />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;
