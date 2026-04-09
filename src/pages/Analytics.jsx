import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../styles/analytics.css";

export default function Analytics() {
  const [bills, setBills] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [userId, setUserId] = useState(auth.currentUser?.uid);

  const dummyChartData = [
    { date: "2026-04-01", sales: 1200, profit: 220 },
    { date: "2026-04-02", sales: 2800, profit: 540 },
    { date: "2026-04-03", sales: 1800, profit: 310 },
  ];

  const dummyMonthlyData = [
    { month: "Apr 2026", sales: 5800, profit: 1070 },
    { month: "May 2026", sales: 3200, profit: 620 },
  ];

  const displayChartData = chartData.length ? chartData : dummyChartData;
  const displayMonthlyData = monthlyData.length
    ? monthlyData
    : dummyMonthlyData;

  console.log("chartData:", chartData);
  console.log("monthlyData:", monthlyData);
  console.log("topProducts:", topProducts);

  const fetchBills = async () => {
    if (!userId) return;

    const data = await getDocs(collection(db, "users", userId, "bills"));

    const billsData = data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("BILLS:", billsData);
    setBills(billsData);
    processChart(billsData);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchBills();
  }, [userId]);

  const processChart = (data) => {
    const daily = {};
    const monthly = {};
    const products = {};
    const dailyProfit = {};
    const monthlyProfit = {};

    if (!Array.isArray(data) || data.length === 0) {
      setChartData([]);
      setMonthlyData([]);
      setTopProducts([]);
      console.log("CHART:", []);
      return;
    }
    

    data.forEach((bill) => {
      const createdAt = bill.createdAt;
      const dateObj = createdAt?.seconds
        ? new Date(createdAt.seconds * 1000)
        : createdAt
        ? new Date(createdAt)
        : new Date();

      const day = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
      const month = dateObj.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      daily[day] = (daily[day] || 0) + (bill.total || 0);
      monthly[month] = (monthly[month] || 0) + (bill.total || 0);

      dailyProfit[day] = (dailyProfit[day] || 0) + (bill.profit || 0);
      monthlyProfit[month] =
        (monthlyProfit[month] || 0) + (bill.profit || 0);

      bill.items?.forEach((item) => {
        products[item.name] = (products[item.name] || 0) + item.qty;
      });
    });

    const chartItems = Object.keys(daily)
      .sort()
      .map((d) => ({
        date: d,
        sales: daily[d],
        profit: dailyProfit[d],
      }));

    const monthlyItems = Object.keys(monthly)
      .sort(
        (a, b) =>
          new Date(`${a} 1`).getTime() - new Date(`${b} 1`).getTime()
      )
      .map((m) => ({
        month: m,
        sales: monthly[m],
        profit: monthlyProfit[m],
      }));

    console.log("CHART:", chartItems);

    setChartData(chartItems);
    setMonthlyData(monthlyItems);

    const sortedProducts = Object.keys(products)
      .map((p) => ({ name: p, qty: products[p] }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    setTopProducts(sortedProducts);
  };

  const totalSales = bills.reduce((s, b) => s + (b.total || 0), 0);
  const totalProfit = bills.reduce((s, b) => s + (b.profit || 0), 0);
  const totalBills = bills.length;

  return (
    <div className="analytics-container">
      <h2>📊 Analytics Dashboard</h2>

      {/* Stats */}
      <div className="stats-grid">
       <div className="card green">
  <p>Total Sales</p>
  <h3 className="sales">₹{totalSales}</h3>
</div>

<div className="card blue">
  <p>Total Profit</p>
  <h3 className="profit">₹{totalProfit}</h3>
</div>

<div className="card orange">
  <p>Total Bills</p>
  <h3 className="bills">{totalBills}</h3>
</div>
      </div>

      {/* Daily */}
      <div className="chart-card">
  <h3>Daily Performance</h3>

  <div style={{ width: "100%", height: "300px" }}>
    <LineChart width={500} height={300} data={displayChartData}>
      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
      <XAxis dataKey="date" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip />
      <Line type="monotone" dataKey="profit" stroke="#22c55e" />
      <Line type="monotone" dataKey="sales" stroke="#ef4444" />
    </LineChart>
  </div>
</div>

      {/* Monthly */}
      <div className="chart-card">
  <h3>Monthly Performance</h3>

  <div style={{ width: "100%", height: "300px" }}>
    <LineChart width={500} height={300} data={displayChartData}>
      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
      <XAxis dataKey="date" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip />
      <Line type="monotone" dataKey="profit" stroke="#22c55e" />
      <Line type="monotone" dataKey="sales" stroke="#ef4444" />
    </LineChart>
  </div>
</div>

      {/* Top Products */}
<div className="top-products">
  <h3>Top Products 🔥</h3>

  {topProducts.map((p, i) => (
    <div
      key={i}
      className={`product-card ${p.qty > 10 ? "up" : "down"}`}
    >
      <span>{p.name}</span>

      <span className="qty">
        {p.qty > 10 ? "⬆" : "⬇"} {p.qty}
      </span>
    </div>
  ))}
</div>
    </div>
  );
}