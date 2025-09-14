import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";

export default function Allclientsdetails() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [interestRecords, setInterestRecords] = useState([]);
  const todayDay = new Date().getDate();


  // Inline editing state
  const [editingInvestmentId, setEditingInvestmentId] = useState(null);
  const [editingInterestId, setEditingInterestId] = useState(null);
  const [editForm, setEditForm] = useState({});

  async function loadClients() {
    const { data } = await api.get("/clients");
    setClients(data);
  }

  async function loadClientDetails(id) {
    const { data } = await api.get(`/clients/${id}`);
    setSelectedClient(data);

    const { data: interestData } = await api.get("/interest");
    setInterestRecords(interestData.filter((r) => r.clientId === Number(id)));
  }

useEffect(() => {
  (async () => {
    try {
      const today = new Date().toDateString();
      const lastSent = localStorage.getItem("lastDueMail");

      if (lastSent !== today) {
        const res = await api.get("/send-due-notifications");
        if (res.data.success) {
          toast.success("📧 Due payment notification email sent!");
          localStorage.setItem("lastDueMail", today); // ✅ prevent duplicate sends
        } else {
          toast.warn("⚠️ No due payments today.");
        }
      }
    } catch (err) {
      console.error("❌ Notification send error:", err);
      toast.error("❌ Failed to send due payment notification.");
    }
  })();
}, []);


  // ----- EDITING -----
  function startEditInvestment(inv) {
    setEditingInvestmentId(inv.id);
    setEditForm({
      amountReceived: inv.amountReceived,
      moneyTransferred: inv.moneyTransferred,
      rateMonthly: inv.rateMonthly,
      monthlyInterestDay: inv.monthlyInterestDay,
      note: inv.note || "",
    });
  }

  async function saveEditInvestment(id, clientId) {
    try {
      await api.put(`/investments/${id}`, {
        amountReceived: Number(editForm.amountReceived),
        moneyTransferred: Number(editForm.moneyTransferred),
        rateMonthly: Number(editForm.rateMonthly),
        monthlyInterestDay: Number(editForm.monthlyInterestDay),
        note: editForm.note,
      });
      toast.success("✅ Investment updated!");
      setEditingInvestmentId(null);
      setEditForm({});
      await loadClientDetails(clientId);
    } catch (err) {
      toast.error("❌ Failed to update investment.");
    }
  }

  function cancelEditInvestment() {
    setEditingInvestmentId(null);
    setEditForm({});
  }

  function startEditInterest(r) {
    setEditingInterestId(r.id);
    setEditForm({
      interestReceived: r.interestReceived,
      profitCredited: r.profitCredited,
      note: r.note || "",
    });
  }

  async function saveEditInterest(id, clientId) {
    try {
      await api.put(`/interest/${id}`, {
        interestReceived: Number(editForm.interestReceived),
        profitCredited: Number(editForm.profitCredited),
        note: editForm.note,
      });
      toast.success("✅ Interest record updated!");
      setEditingInterestId(null);
      setEditForm({});
      await loadClientDetails(clientId);
    } catch (err) {
      toast.error("❌ Failed to update interest record.");
    }
  }

  function cancelEditInterest() {
    setEditingInterestId(null);
    setEditForm({});
  }

  // ----- DELETE -----
  async function handleDeleteClient(id) {
    if (!window.confirm("Delete this client and all related records?")) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success("🗑️ Client deleted!");
      await loadClients();
      setSelectedClient(null);
    } catch (err) {
      toast.error("❌ Failed to delete client.");
    }
  }

  async function handleDeleteInvestment(id, clientId) {
    if (!window.confirm("Delete this investment?")) return;
    try {
      await api.delete(`/investments/${id}`);
      toast.success("🗑️ Investment deleted!");
      await loadClientDetails(clientId);
    } catch (err) {
      toast.error("❌ Failed to delete investment.");
    }
  }

  async function handleDeleteInterest(id, clientId) {
    if (!window.confirm("Delete this interest record?")) return;
    try {
      await api.delete(`/interest/${id}`);
      toast.success("🗑️ Interest record deleted!");
      await loadClientDetails(clientId);
    } catch (err) {
      toast.error("❌ Failed to delete interest record.");
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <div className="p-10 w-full space-y-10">
      <h1 className="text-3xl font-bold text-brand-700">
        📑 All Clients Investment
      </h1>

      {/* Clients List */}
      <div className="overflow-x-auto">
        <table className="w-full border border-slate-200 text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="border p-3 text-left">Client Name</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-left">Mobile</th>              
              <th className="border p-3 text-right">Total Invested (₹)</th>
              <th className="border p-3 text-right">Total Transfered to Company (₹)</th>
              <th className="border p-3 text-left">Monthly Int Amt</th>
              <th className="border p-3 text-left">Monthly Int Day</th>
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const totalTransfer = c.investments.reduce(
                (sum, i) => sum + (i.amountReceived || 0),
                0
              );
              const totalInvested = c.investments.reduce(
                (sum, i) => sum + (i.moneyTransferred || 0),
                0
              );
              return (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="border p-3">{c.name}</td>
                  <td className="border p-3">{c.email || "-"}</td>
                  <td className="border p-3">{c.mobile || "-"}</td>
                  <td className="border p-3 text-right">
                    {formatCurrency(totalTransfer)}
                  </td>
                  <td className="border p-3 text-right">
                    {formatCurrency(totalInvested)}
                  </td>                 
                  <td className="border p-3"> 
                    {c.investments.map((inv) => (
                      <div key={inv.id}>{inv.interestAmount}</div>
                    ))}
                  </td>
                  <td className="border p-3">
                    {c.investments.map((inv) => {
                      const todayDay = new Date().getDate();
                      return (
                        <div key={inv.id} className="flex items-center gap-2">
                          {inv.monthlyInterestDay}
                          {Number(inv.monthlyInterestDay) === todayDay && (
                            <span title="Payment Due Today" className="bell-pulse">🔔</span>
                          )}
                        </div>
                      );
                    })}
                  </td>

                  <td className="border p-3 text-center">
                    <button
                      onClick={() => loadClientDetails(c.id)}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteClient(c.id)}
                      className="text-red-600 hover:underline ml-4"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-500 border">
                  No clients yet
                </td>
              </tr>
            )}
          </tbody>
          {/* ✅ Footer with total sums */}
          {clients.length > 0 && (
            <tfoot className="bg-slate-200 font-semibold">
              <tr>
                <td colSpan="3" className="border p-3 text-right">
                  Grand Total
                </td>
                <td className="border p-3 text-right">
                  {formatCurrency(
                    clients.reduce(
                      (sum, c) =>
                        sum +
                        c.investments.reduce(
                          (s, i) => s + (i.amountReceived || 0),
                          0
                        ),
                      0
                    )
                  )}
                </td>
                <td className="border p-3 text-right">
                  {formatCurrency(
                    clients.reduce(
                      (sum, c) =>
                        sum +
                        c.investments.reduce(
                          (s, i) => s + (i.moneyTransferred || 0),
                          0
                        ),
                      0
                    )
                  )}
                </td>
                <td className="border p-3"></td>
                <td className="border p-3"></td>
                <td className="border p-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Expanded Client Details */}
      {selectedClient && (
        <div className="space-y-10 mt-10">
          {/* Client Info */}
          <div className="bg-white shadow p-6 rounded-xl space-y-2">
            <h2 className="text-2xl font-bold text-brand-700">
              {selectedClient.name}
            </h2>
            <p>Email: {selectedClient.email || "-"}</p>
            <p>Mobile: {selectedClient.mobile || "-"}</p>
            <p>Account: {selectedClient.accountNumber || "-"}</p>
            <p>Bank: {selectedClient.bankName || "-"}</p>
            <p className="text-gray-500 text-sm">
              Joined: {new Date(selectedClient.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Merged Investments + Interest Table */}
          <div>
            <h3 className="text-xl font-semibold text-brand-700 mb-4">
              📊 Investments & Interest Records
            </h3>
            <table className="w-full border border-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border p-3">Amount Received (₹)</th>
                  <th className="border p-3">Money Transferred (₹)</th>
                  <th className="border p-3">Date Invested</th>
                  <th className="border p-3">Rate (%)</th>
                  <th className="border p-3">Interest Start</th>
                  <th className="border p-3">Monthly Day</th>
                  <th className="border p-3">Interest Amount (₹)</th>
                  <th className="border p-3">Interest Received (5%)</th>
                  <th className="border p-3">Profit Credited (₹)</th>
                  <th className="border p-3">Profit Day</th>
                  <th className="border p-3">Note</th>
                  <th className="border p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedClient.investments.map((inv) => {
                 const relatedInterest = interestRecords.filter(
                  (r) => r.investmentId === inv.id
                );

                  return (
                    <>
                      {/* Investment Row */}
                      <tr key={`inv-${inv.id}`} className="bg-slate-50 font-semibold">
                        <td className="border p-3 text-right">
                          {editingInvestmentId === inv.id ? (
                            <input
                              type="number"
                              value={editForm.amountReceived}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  amountReceived: e.target.value,
                                })
                              }
                              className="input w-24"
                            />
                          ) : (
                            formatCurrency(inv.amountReceived || 0)
                          )}
                        </td>
                        <td className="border p-3 text-right">
                          {editingInvestmentId === inv.id ? (
                            <input
                              type="number"
                              value={editForm.moneyTransferred}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  moneyTransferred: e.target.value,
                                })
                              }
                              className="input w-24"
                            />
                          ) : (
                            formatCurrency(inv.moneyTransferred || 0)
                          )}
                        </td>
                        <td className="border p-3">
                          {new Date(inv.dateInvested).toLocaleDateString()}
                        </td>
                        <td className="border p-3 text-right">
                          {editingInvestmentId === inv.id ? (
                            <input
                              type="number"
                              value={editForm.rateMonthly}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  rateMonthly: e.target.value,
                                })
                              }
                              className="input w-16"
                            />
                          ) : (
                            `${inv.rateMonthly}%`
                          )}
                        </td>
                        <td className="border p-3">
                          {inv.dateInterestStart
                            ? new Date(inv.dateInterestStart).toLocaleDateString()
                            : "-"}
                        </td>
                       <td className="border p-3 text-center">
                          {editingInvestmentId === inv.id ? (
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={editForm.monthlyInterestDay}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  monthlyInterestDay: e.target.value,
                                })
                              }
                              className="input w-16 text-center"
                            />
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              {inv.monthlyInterestDay}
                              {Number(inv.monthlyInterestDay) === new Date().getDate() && (
                                <span title="Payment Due Today" className="bell-pulse">🔔</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="border p-3 text-right">
                          {inv.interestAmount
                            ? formatCurrency(inv.interestAmount)
                            : "-"}
                        </td>
                        <td className="border p-3 text-center">-</td>
                        <td className="border p-3 text-center">-</td>
                        <td className="border p-3 text-center">-</td>
                        <td className="border p-3">
                          {editingInvestmentId === inv.id ? (
                            <input
                              type="text"
                              value={editForm.note}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  note: e.target.value,
                                })
                              }
                              className="input w-32"
                            />
                          ) : (
                            inv.note || "-"
                          )}
                        </td>
                        <td className="border p-3 text-center">
                          {editingInvestmentId === inv.id ? (
                            <>
                              <button
                                onClick={() =>
                                  saveEditInvestment(inv.id, selectedClient.id)
                                }
                                className="text-green-600 hover:underline mr-2"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditInvestment}
                                className="text-gray-600 hover:underline"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditInvestment(inv)}
                                className="text-blue-600 hover:underline mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteInvestment(inv.id, selectedClient.id)
                                }
                                className="text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>

                      {/* Interest rows */}
                      {relatedInterest.map((r) => (
                        <tr key={`int-${r.id}`}>
                          <td className="border p-3 text-center">↳</td>
                          <td className="border p-3 text-center">-</td>
                          <td className="border p-3 text-center">-</td>
                          <td className="border p-3 text-center">-</td>
                          <td className="border p-3 text-center">-</td>
                          <td className="border p-3 text-center">-</td>
                          <td className="border p-3 text-center">-</td>
                          <td className="border p-3 text-right">
                            {editingInterestId === r.id ? (
                              <input
                                type="number"
                                value={editForm.interestReceived}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    interestReceived: e.target.value,
                                  })
                                }
                                className="input w-20"
                              />
                            ) : (
                              formatCurrency(r.interestReceived)
                            )}
                          </td>
                          <td className="border p-3 text-right">
                            {editingInterestId === r.id ? (
                              <input
                                type="number"
                                value={editForm.profitCredited}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    profitCredited: e.target.value,
                                  })
                                }
                                className="input w-20"
                              />
                            ) : r.profitCredited ? (
                              formatCurrency(r.profitCredited)
                            ) : (
                              "0"
                            )}
                          </td>
                          <td className="border p-3">
                            {new Date(r.profitDay).toLocaleDateString()}
                          </td>
                          <td className="border p-3">
                            {editingInterestId === r.id ? (
                              <input
                                type="text"
                                value={editForm.note}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, note: e.target.value })
                                }
                                className="input w-32"
                              />
                            ) : (
                              r.note || "-"
                            )}
                          </td>
                          <td className="border p-3 text-center">
                            {editingInterestId === r.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    saveEditInterest(r.id, selectedClient.id)
                                  }
                                  className="text-green-600 hover:underline mr-2"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditInterest}
                                  className="text-gray-600 hover:underline"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditInterest(r)}
                                  className="text-blue-600 hover:underline mr-2"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteInterest(r.id, selectedClient.id)
                                  }
                                  className="text-red-600 hover:underline"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })}

                {selectedClient.investments.length === 0 && (
                  <tr>
                    <td
                      colSpan="12"
                      className="p-3 text-center text-gray-500 border"
                    >
                      No investments or interest records yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
