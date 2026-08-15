import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AssetList from "./pages/AssetList";
import AddAsset from "./pages/AddAsset";
import AssetDetail from "./pages/AssetDetail";
import CustodyBoard from "./pages/CustodyBoard";
import ManageEmployees from "./pages/ManageEmployees";
import DepartmentSummary from "./pages/DepartmentSummary";
import OverdueReport from "./pages/OverdueReport";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AssetList />} />
        <Route path="/assets/new" element={<AddAsset />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/custody" element={<CustodyBoard />} />
        <Route path="/employees" element={<ManageEmployees />} />
        <Route path="/departments" element={<DepartmentSummary />} />
        <Route path="/overdue" element={<OverdueReport />} />
      </Routes>
    </Layout>
  );
}
