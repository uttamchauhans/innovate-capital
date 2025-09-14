import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [interestRecords, setInterestRecords] = useState([]);

  async function loadData() {
    const { data } = await api.get(`/clients/${id}`);
    setClient(data);

    const { data: interestData } = await api.get("/interest");
    setInterestRecords(interestData.filter((r) => r.clientId === Number(id)));
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  if (!client) return <div className="p-10">Loading...</div>;

  // Totals
  const totalInvested = client.investments.reduce(
    (sum, i) => sum + (i.moneyTransferred || 0),
    0
  );
  const totalInterestDue = client.investments.reduce(
    (sum, i) =>
      sum + ((i.moneyTransferred || 0) * (i.rateMonthly || 0)) / 100,
    0
  );
  const totalInterestReceived = interestRecords.reduce(
    (sum, r) => sum + (r.interestReceived || 0),
    0
  );
  const totalInterestAgreed = client.investments.reduce(
    (sum, i) => sum + (i.interestAmount || 0),
    0
  );
  const balance = totalInterestDue - totalInterestReceived;

  return (
    <div className="p-10 w-full space-y-10">
      <button
        className="text-blue-600 underline"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Client Info */}
      <div className="bg-white shadow p-6 rounded-xl space-y-2">
        <h1 className="text-3xl font-bold text-brand-700">{client.name}</h1>
        <p>Email: {client.email || "-"}</p>
        <p>Mobile: {client.mobile || "-"}</p>
        <p>Account: {client.accountNumber || "-"}</p>
        <p>Bank: {client.bankName || "-"}</p>
        <p className="text-gray-500 text-sm">
          Joined: {new Date(client.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <div className="text-sm text-gray-500">💰 Total Invested</div>
          <div className="text-2xl font-semibold text-brand-700">
            {formatCurrency(totalInvested)}
          </div>
        </div>
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <div className="text-sm text-gray-500">📈 Interest Due</div>
          <div className="text-2xl font-semibold text-brand-700">
            {formatCurrency(totalInterestDue)}
          </div>
        </div>
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <div className="text-sm text-gray-500">✅ Interest Received</div>
          <div className="text-2xl font-semibold text-green-600">
            {formatCurrency(totalInterestReceived)}
          </div>
        </div>
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <div className="text-sm text-gray-500">⚠️ Balance</div>
          <div
            className={`text-2xl font-semibold ${
              balance >= 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatCurrency(balance)}
          </div>
        </div>
      </div>

      {/* Investments Table */}
      <div className="w-full">
        <h2 className="text-xl font-semibold text-brand-700 mb-4">
          📊 Investments
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200 text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-3">Money Transferred (₹)</th>
                <th className="border p-3">Date Invested</th>
                <th className="border p-3">Rate (%)</th>
                <th className="border p-3">Interest Start</th>
                <th className="border p-3">Monthly Day</th>
                <th className="border p-3">Interest Amount (₹)</th>
                <th className="border p-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {client.investments.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="border p-3 text-right">
                    {formatCurrency(i.moneyTransferred || 0)}
                  </td>
                  <td className="border p-3">
                    {new Date(i.dateInvested).toLocaleDateString()}
                  </td>
                  <td className="border p-3 text-right">{i.rateMonthly}%</td>
                  <td className="border p-3">
                    {i.dateInterestStart
                      ? new Date(i.dateInterestStart).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border p-3 text-center">
                    {i.monthlyInterestDay}
                  </td>
                  <td className="border p-3 text-right">
                    {i.interestAmount
                      ? formatCurrency(i.interestAmount)
                      : "-"}
                  </td>
                  <td className="border p-3">{i.note || "-"}</td>
                </tr>
              ))}
              {client.investments.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-3 text-center text-gray-500 border"
                  >
                    No investments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📑 Client Investment Summary */}
      <div className="w-full mt-10">
        <h2 className="text-xl font-semibold text-brand-700 mb-4">
          📑 Client Investment Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200 text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-3 text-left">Metric</th>
                <th className="border p-3 text-right">Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-3">Total Money Transferred</td>
                <td className="border p-3 text-right">
                  {formatCurrency(totalInvested)}
                </td>
              </tr>
              <tr>
                <td className="border p-3">Total Interest (Agreed)</td>
                <td className="border p-3 text-right">
                  {formatCurrency(totalInterestAgreed)}
                </td>
              </tr>
              <tr>
                <td className="border p-3">Interest Due Till Date</td>
                <td className="border p-3 text-right">
                  {formatCurrency(totalInterestDue)}
                </td>
              </tr>
              <tr>
                <td className="border p-3">Interest Received Till Date</td>
                <td className="border p-3 text-right">
                  {formatCurrency(totalInterestReceived)}
                </td>
              </tr>
              <tr>
                <td className="border p-3 font-semibold">Net Balance</td>
                <td
                  className={`border p-3 text-right font-semibold ${
                    balance >= 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(balance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interest Received Table */}
      <div className="w-full">
        <h2 className="text-xl font-semibold text-brand-700 mb-4">
          📜 Interest Received History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200 text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-3">Amount (₹)</th>
                <th className="border p-3">Profit Credited (₹)</th>
                <th className="border p-3">Date</th>
                <th className="border p-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {interestRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="border p-3 text-right">
                    {formatCurrency(r.interestReceived)}
                  </td>
                  <td className="border p-3 text-right">
                    {r.profitCredited ? formatCurrency(r.profitCredited) : "-"}
                  </td>
                  <td className="border p-3">
                    {new Date(r.profitDay).toLocaleDateString()}
                  </td>
                  <td className="border p-3">{r.note || "-"}</td>
                </tr>
              ))}
              {interestRecords.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-3 text-center text-gray-500 border"
                  >
                    No interest records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
