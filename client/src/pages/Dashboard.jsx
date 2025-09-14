import { useEffect, useState } from "react";
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [msg, setMsg] = useState(""); // ✅ message state for test email result

  useEffect(() => {
    (async () => {
      try {
        const s = await api.get("/summary");
        setSummary(s.data);
        const inv = await api.get("/investments");
        setInvestments(inv.data);
      } catch (err) {
        console.error("❌ Dashboard data fetch error:", err);
      }
    })();
  }, []);

  const chartData = investments.map((i) => ({
    name: i.client?.name || "Unknown",
     interest: Number(
      ((i.moneyTransferred || 0) * (i.rateMonthly || 0) / 100).toFixed(2)
    ),
  }));

  // ✅ function to send test email
  async function sendTestEmail() {
    try {
      setMsg("Sending...");
      const res = await api.get("/test-email");
      if (res.data.success) {
        setMsg("✅ Test email sent successfully!");
      } else {
        setMsg("❌ Failed to send email");
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ Error: " + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-700">Dashboard</h1>

      {summary && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="text-gray-500 text-sm">Clients</div>
            <div className="text-2xl font-semibold">
              {summary.clients || 0}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-gray-500 text-sm">Total Principal</div>
            <div className="text-2xl font-semibold">
              ₹{(summary.totalPrincipal || 0).toFixed(2)}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-gray-500 text-sm">This Month: Due / Paid</div>
            <div className="text-2xl font-semibold">
              ₹{(summary.monthlyDue || 0).toFixed(2)} / ₹
              {(summary.monthlyPaid || 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Test email button card */}
      <div className="card p-4">
        <div className="font-medium mb-2">Email Test</div>
        <button className="btn" onClick={sendTestEmail}>
          Send Test Email
        </button>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </div>

      <div className="card p-4">
        <div className="font-medium mb-2">Monthly Interest by Client</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="interest" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
