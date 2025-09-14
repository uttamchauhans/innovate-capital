import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isNewClient, setIsNewClient] = useState(false);

  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    mobile: "",
    accountNumber: "",
    bankName: "",
  });

  const [tab, setTab] = useState("investment");

  const [invForm, setInvForm] = useState({
    amountReceived: "",
    moneyTransferred: "",
    dateInvested: "",
    rateOfInterest: "",
    dateInterestStart: "",
    monthlyInterestDay: 5,
    interestAmount: "",
  });

  const [interestForm, setInterestForm] = useState({
    interestReceived: "",
    profitCredited: "",
    profitDay: "",
  });

  const [note, setNote] = useState("");
  const [loadingClient, setLoadingClient] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // ✅ track selected investment when adding interest
  const [selectedInvestmentId, setSelectedInvestmentId] = useState("");

  async function loadClients() {
    const { data } = await api.get("/clients");
    setClients(data);
  }

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (invForm.moneyTransferred) {
      const interest = (Number(invForm.moneyTransferred) * 5) / 100;
      setInterestForm((f) => ({ ...f, interestReceived: interest.toFixed(2) }));
    }
  }, [invForm.moneyTransferred]);

  useEffect(() => {
    const interestReceived = (Number(invForm.moneyTransferred) || 0) * 0.05; // 5%
    const interestAmount = Number(invForm.interestAmount) || 0;
    const profitAdmin = interestReceived - interestAmount;

    setInterestForm((f) => ({
      ...f,
      interestReceived: interestReceived.toFixed(2),
      profitCredited: profitAdmin.toFixed(2),
    }));
  }, [invForm.moneyTransferred, invForm.interestAmount]);

  useEffect(() => {
    if (selectedInvestmentId && selectedClientId) {
      const client = clients.find((c) => c.id === Number(selectedClientId));
      const inv = client?.investments.find((i) => i.id === Number(selectedInvestmentId));
      if (inv) {
        const interestReceived = (Number(inv.moneyTransferred) || 0) * 0.05; // 5%
        const profitAdmin = interestReceived - (Number(inv.interestAmount) || 0);

        setInterestForm((f) => ({
          ...f,
          interestReceived: interestReceived.toFixed(2),
          profitCredited: profitAdmin.toFixed(2),
        }));
      }
    }
  }, [selectedInvestmentId, selectedClientId, clients]);

  function handleClientChange(e) {
    const val = e.target.value;
    if (val === "new") {
      setIsNewClient(true);
      setSelectedClientId("");
      setClientForm({
        name: "",
        email: "",
        mobile: "",
        accountNumber: "",
        bankName: "",
      });
    } else {
      setIsNewClient(false);
      setSelectedClientId(val);
      const existing = clients.find((c) => c.id === Number(val));
      if (existing) {
        setClientForm({
          name: existing.name,
          email: existing.email || "",
          mobile: existing.mobile || "",
          accountNumber: existing.accountNumber || "",
          bankName: existing.bankName || "",
        });
      }
    }
  }

  async function saveClient(e) {
    e.preventDefault();
    setLoadingClient(true);
    try {
      let newClient = null;
      if (isNewClient) {
        const res = await api.post("/clients", {
          ...clientForm,
          name: clientForm.name.trim(),
        });
        setSelectedClientId(res.data.id);
        newClient = res.data;
      }
      await loadClients();
      toast.success(
        `✅ Client saved successfully! ${
          newClient ? `(${newClient.name})` : ""
        }`
      );
    } catch (err) {
      toast.error("❌ Failed to save client.");
    } finally {
      setLoadingClient(false);
    }
  }

  async function saveData(e) {
    e.preventDefault();
    setLoadingData(true);
    try {
      const currentClient = clients.find(
        (c) => c.id === Number(selectedClientId)
      );

      if (tab === "investment") {
        const payload = {
          clientId: Number(selectedClientId),
          amountReceived: Number(invForm.amountReceived) || 0,
          moneyTransferred: invForm.moneyTransferred
            ? Number(invForm.moneyTransferred)
            : null,
          dateInvested: invForm.dateInvested,
          rateMonthly: Number(invForm.rateOfInterest),
          dateInterestStart: invForm.dateInterestStart || null,
          monthlyInterestDay: Number(invForm.monthlyInterestDay),
          interestAmount: invForm.interestAmount
            ? Number(invForm.interestAmount)
            : null,
          note,
        };

        await api.post("/investments", payload);
        setInvForm({
          amountReceived: "",
          moneyTransferred: "",
          dateInvested: "",
          rateOfInterest: "",
          dateInterestStart: "",
          monthlyInterestDay: 5,
          interestAmount: "",
        });
        setNote("");
        await loadClients();
        toast.success(
          `✅ Investment saved successfully for ${
            currentClient?.name || "client"
          }`
        );
      } else {
        if (!selectedInvestmentId) {
          toast.error("❌ Please select an investment for this interest record.");
          setLoadingData(false);
          return;
        }

        const payload = {
          clientId: Number(selectedClientId),
          investmentId: Number(selectedInvestmentId), // ✅ required now
          interestReceived: Number(interestForm.interestReceived),
          profitCredited: Number(interestForm.profitCredited),
          profitDay: interestForm.profitDay,
          note,
        };
        await api.post("/interest", payload);
        setInterestForm({
          interestReceived: "",
          profitCredited: "",
          profitDay: "",
        });
        setNote("");
        setSelectedInvestmentId("");
        toast.success(
          `📈 Interest record saved successfully for ${
            currentClient?.name || "client"
          }`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save data.");
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (invForm.amountReceived && invForm.rateOfInterest) {
      const amt =
        (Number(invForm.amountReceived) *
          Number(invForm.rateOfInterest)) /
        100;
      setInvForm((f) => ({ ...f, interestAmount: amt.toFixed(2) }));
    }
  }, [invForm.amountReceived, invForm.rateOfInterest]);

  const selectedClient = clients.find((c) => c.id === Number(selectedClientId));
  const totalInvestedForClient = selectedClient
    ? selectedClient.investments.reduce(
        (sum, i) => sum + (i.moneyTransferred || 0),
        0
      )
    : 0;

  return (
    <div className="p-10 w-full space-y-12">
      <h1 className="text-4xl font-bold text-brand-700">Investment Feed Form</h1>

      {selectedClient && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-blue-800">
            {selectedClient.name} — Total Invested Till Date: ₹
            {totalInvestedForClient.toFixed(2)}
          </h2>
        </div>
      )}

      {/* Client Form */}
      <form
        onSubmit={saveClient}
        className="bg-white shadow-lg p-8 rounded-xl space-y-6 w-full"
      >
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-brand-700">
            👤 Client Details
          </div>
          <select
            className="input w-64"
            value={isNewClient ? "new" : selectedClientId}
            onChange={handleClientChange}
          >
            <option value="">-- Select Client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="new">➕ New Client</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Full Name</span>
            <input
              className="input"
              value={clientForm.name}
              onChange={(e) =>
                setClientForm({ ...clientForm, name: e.target.value })
              }
              required
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Email</span>
            <input
              className="input"
              type="email"
              value={clientForm.email}
              onChange={(e) =>
                setClientForm({ ...clientForm, email: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Mobile Number</span>
            <input
              className="input"
              value={clientForm.mobile}
              onChange={(e) =>
                setClientForm({ ...clientForm, mobile: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Account Number</span>
            <input
              className="input"
              value={clientForm.accountNumber}
              onChange={(e) =>
                setClientForm({ ...clientForm, accountNumber: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Bank Name</span>
            <input
              className="input"
              value={clientForm.bankName}
              onChange={(e) =>
                setClientForm({ ...clientForm, bankName: e.target.value })
              }
            />
          </label>
        </div>

        {isNewClient && (
          <button
            className="btn w-full flex items-center justify-center"
            disabled={loadingClient}
          >
            {loadingClient ? "Saving..." : "Save Client"}
          </button>
        )}
      </form>

      {/* Tabs + Single Form */}
      <div className="bg-white shadow-lg p-8 rounded-xl w-full">
        <form onSubmit={saveData} className="space-y-6">
          <div className="flex gap-10 border-b mb-8">
            <button
              type="button"
              className={`pb-2 ${
                tab === "investment"
                  ? "border-b-2 border-brand-600 text-brand-700 font-semibold"
                  : ""
              }`}
              onClick={() => setTab("investment")}
            >
              💰 Add Investment
            </button>
            <button
              type="button"
              className={`pb-2 ${
                tab === "interest"
                  ? "border-b-2 border-brand-600 text-brand-700 font-semibold"
                  : ""
              }`}
              onClick={() => setTab("interest")}
            >
              📈 Interest Received
            </button>
          </div>

          {/* Investment Tab */}
          {tab === "investment" && (
            <div className="grid grid-cols-2 gap-6">
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Amount Received</span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={invForm.amountReceived}
                  onChange={(e) =>
                    setInvForm({ ...invForm, amountReceived: e.target.value })
                  }
                  required
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Money Transferred</span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={invForm.moneyTransferred}
                  onChange={(e) =>
                    setInvForm({ ...invForm, moneyTransferred: e.target.value })
                  }
                  required
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Date Invested</span>
                <input
                  className="input"
                  type="date"
                  value={invForm.dateInvested}
                  onChange={(e) =>
                    setInvForm({ ...invForm, dateInvested: e.target.value })
                  }
                  required
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">
                  Rate of Interest (%)
                </span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={invForm.rateOfInterest}
                  onChange={(e) =>
                    setInvForm({ ...invForm, rateOfInterest: e.target.value })
                  }
                  required
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">
                  Date Interest Start
                </span>
                <input
                  className="input"
                  type="date"
                  value={invForm.dateInterestStart}
                  onChange={(e) =>
                    setInvForm({
                      ...invForm,
                      dateInterestStart: e.target.value,
                    })
                  }
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">
                  Monthly Interest Day
                </span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="31"
                  value={invForm.monthlyInterestDay}
                  onChange={(e) =>
                    setInvForm({
                      ...invForm,
                      monthlyInterestDay: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">
                  Interest Amount (auto)
                </span>
                <input
                  className="input bg-gray-100"
                  type="number"
                  step="0.01"
                  value={invForm.interestAmount}
                  readOnly
                />
              </label>
            </div>
          )}

          {/* Interest Tab */}
          {tab === "interest" && (
            <div className="grid grid-cols-2 gap-6">
              <label className="flex flex-col col-span-2">
                <span className="text-sm text-gray-600">Select Investment</span>
                <select
                  className="input"
                  value={selectedInvestmentId}
                  onChange={(e) => setSelectedInvestmentId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Investment --</option>
                  {selectedClient?.investments.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {new Date(inv.dateInvested).toLocaleDateString()} — ₹
                      {inv.moneyTransferred}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Interest Received (5%)</span>
                <input
                  className="input bg-gray-100"
                  type="number"
                  step="0.01"
                  value={interestForm.interestReceived}
                  readOnly
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Profit Credited to Admin</span>
                <input
                  className="input bg-gray-100"
                  type="number"
                  step="0.01"
                  value={interestForm.profitCredited || 0}
                  readOnly
                />
              </label>


              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Profit Day</span>
                <input
                  className="input"
                  type="date"
                  value={interestForm.profitDay}
                  onChange={(e) =>
                    setInterestForm({
                      ...interestForm,
                      profitDay: e.target.value,
                    })
                  }
                />
              </label>
            </div>
          )}

          {/* Note */}
          <label className="flex flex-col mt-6">
            <span className="text-sm text-gray-600">Special Note</span>
            <textarea
              className="input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          {/* Save Button */}
          <button
            type="submit"
            className="btn w-full mt-6 flex items-center justify-center"
            disabled={loadingData}
          >
            {loadingData ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
