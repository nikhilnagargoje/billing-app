import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Bills from "./pages/Bills";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import "./styles/components.css";
import "./styles/global.css";
import Stock from "./pages/Stock";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customer/:id" element={<CustomerDetails />} />
        <Route path="/stock" element={<Stock />} />
      </Routes>
    </BrowserRouter>
  );
}