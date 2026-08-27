import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Tabs } from "../../components/ui/Tabs";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

function MedicineForm({ onCreated }) {
  const [form, setForm] = useState({
    genericName: "",
    brandName: "",
    category: "General",
    dosageForm: "tablet",
    strength: "",
    unit: "tablet",
    manufacturer: "",
    minimumStockLevel: 10,
    reorderLevel: 20,
  });

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post("/pharmacy/medicines", form);
    setForm({
      genericName: "",
      brandName: "",
      category: "General",
      dosageForm: "tablet",
      strength: "",
      unit: "tablet",
      manufacturer: "",
      minimumStockLevel: 10,
      reorderLevel: 20,
    });
    await onCreated();
  }

  return (
    <Card>
      <CardHeader eyebrow="Master Data" title="Add medicine" />
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input label="Generic name" onChange={(event) => setForm((current) => ({ ...current, genericName: event.target.value }))} value={form.genericName} />
          <Input label="Brand name" onChange={(event) => setForm((current) => ({ ...current, brandName: event.target.value }))} value={form.brandName} />
          <Input label="Category" onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} value={form.category} />
          <Input label="Strength" onChange={(event) => setForm((current) => ({ ...current, strength: event.target.value }))} value={form.strength} />
          <Input label="Manufacturer" onChange={(event) => setForm((current) => ({ ...current, manufacturer: event.target.value }))} value={form.manufacturer} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min stock" onChange={(event) => setForm((current) => ({ ...current, minimumStockLevel: Number(event.target.value) }))} type="number" value={form.minimumStockLevel} />
            <Input label="Reorder" onChange={(event) => setForm((current) => ({ ...current, reorderLevel: Number(event.target.value) }))} type="number" value={form.reorderLevel} />
          </div>
          <div className="md:col-span-2">
            <Button size="lg" type="submit">Create medicine</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StockReceiptForm({ medicines, onReceived }) {
  const [form, setForm] = useState({
    medicineId: "",
    batchNumber: "",
    expiryDate: "",
    unitCost: 0,
    receivedQuantity: 0,
    storageLocation: "Main Pharmacy Shelf",
    purchaseReference: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post("/pharmacy/stock/receive", form);
    setForm({
      medicineId: "",
      batchNumber: "",
      expiryDate: "",
      unitCost: 0,
      receivedQuantity: 0,
      storageLocation: "Main Pharmacy Shelf",
      purchaseReference: "",
    });
    await onReceived();
  }

  return (
    <Card>
      <CardHeader eyebrow="Inventory" title="Receive stock" />
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Medicine</span>
            <select
              className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
              onChange={(event) => setForm((current) => ({ ...current, medicineId: event.target.value }))}
              value={form.medicineId}
            >
              <option value="">Select medicine</option>
              {medicines.map((medicine) => (
                <option key={medicine._id} value={medicine._id}>{medicine.genericName}</option>
              ))}
            </select>
          </label>
          <Input label="Batch number" onChange={(event) => setForm((current) => ({ ...current, batchNumber: event.target.value }))} value={form.batchNumber} />
          <Input label="Expiry date" onChange={(event) => setForm((current) => ({ ...current, expiryDate: event.target.value }))} type="date" value={form.expiryDate} />
          <Input label="Unit cost" onChange={(event) => setForm((current) => ({ ...current, unitCost: Number(event.target.value) }))} type="number" value={form.unitCost} />
          <Input label="Received quantity" onChange={(event) => setForm((current) => ({ ...current, receivedQuantity: Number(event.target.value) }))} type="number" value={form.receivedQuantity} />
          <Input label="Reference" onChange={(event) => setForm((current) => ({ ...current, purchaseReference: event.target.value }))} value={form.purchaseReference} />
          <div className="md:col-span-2">
            <Button size="lg" type="submit">Receive stock</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DispenseWorkspace({ prescription, onDispensed }) {
  const [availability, setAvailability] = useState({});
  const [dispenseItems, setDispenseItems] = useState([]);

  useEffect(() => {
    async function loadAvailability() {
      if (!prescription) {
        setAvailability({});
        setDispenseItems([]);
        return;
      }

      const nextAvailability = {};
      const nextItems = [];
      for (const [index, item] of prescription.items.entries()) {
        if (!item.medicineRef) {
          nextAvailability[index] = { totalAvailable: 0, recommendedBatch: null, batches: [] };
          nextItems.push({ itemIndex: index, batchId: "", dispensedQuantity: 0, markOutOfStock: true });
          continue;
        }
        const response = await api.get(`/pharmacy/medicines/${item.medicineRef}/availability`);
        nextAvailability[index] = response.data.data;
        nextItems.push({
          itemIndex: index,
          batchId: response.data.data.recommendedBatch?._id || "",
          dispensedQuantity: Math.max(item.quantity - (item.dispensedQuantity || 0), 0),
          markOutOfStock: response.data.data.totalAvailable <= 0,
        });
      }
      setAvailability(nextAvailability);
      setDispenseItems(nextItems);
    }

    loadAvailability();
  }, [prescription]);

  if (!prescription) {
    return (
      <Card>
        <CardHeader eyebrow="Dispensing" title="Prescription workspace" />
        <CardContent>
          <p className="text-sm text-[var(--color-foreground-muted)]">Select a pending prescription to dispense medicines with FEFO batch guidance.</p>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post(`/pharmacy/prescriptions/${prescription._id}/dispense`, {
      items: dispenseItems,
      notes: "Dispensed from pharmacy workspace",
      partialDispensingReason: dispenseItems.some((item) => item.markOutOfStock || item.dispensedQuantity === 0) ? "Partial dispensing due to stock constraints" : "",
    });
    await onDispensed();
  }

  return (
    <Card>
      <CardHeader
        description={`${prescription.patientId} • ${prescription.doctorName || "Doctor assigned"}`}
        eyebrow={prescription.prescriptionNumber}
        title="Dispense prescription"
      />
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {prescription.items.map((item, index) => (
            <div key={`${prescription._id}-${index}`} className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-[var(--color-foreground)]">{item.name}</h4>
                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
                    {item.strength || "Strength pending"} • Qty {item.quantity} • Remaining {Math.max(item.quantity - (item.dispensedQuantity || 0), 0)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">Available: {availability[index]?.totalAvailable || 0}</p>
                </div>
                <Badge tone={availability[index]?.totalAvailable > 0 ? "success" : "danger"}>
                  {availability[index]?.recommendedBatch ? `FEFO ${availability[index].recommendedBatch.batchNumber}` : "No valid batch"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Batch</span>
                  <select
                    className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                    onChange={(event) => setDispenseItems((current) => current.map((entry) => entry.itemIndex === index ? { ...entry, batchId: event.target.value, markOutOfStock: false } : entry))}
                    value={dispenseItems.find((entry) => entry.itemIndex === index)?.batchId || ""}
                  >
                    <option value="">Select batch</option>
                    {(availability[index]?.batches || []).map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.batchNumber} • exp {new Date(batch.expiryDate).toLocaleDateString("en-IN")}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  label="Dispense qty"
                  onChange={(event) => setDispenseItems((current) => current.map((entry) => entry.itemIndex === index ? { ...entry, dispensedQuantity: Number(event.target.value), markOutOfStock: Number(event.target.value) === 0 } : entry))}
                  type="number"
                  value={dispenseItems.find((entry) => entry.itemIndex === index)?.dispensedQuantity ?? 0}
                />
                <label className="mt-8 flex items-center gap-3 text-sm text-[var(--color-foreground-muted)]">
                  <input
                    checked={Boolean(dispenseItems.find((entry) => entry.itemIndex === index)?.markOutOfStock)}
                    onChange={(event) => setDispenseItems((current) => current.map((entry) => entry.itemIndex === index ? { ...entry, markOutOfStock: event.target.checked, dispensedQuantity: event.target.checked ? 0 : entry.dispensedQuantity } : entry))}
                    type="checkbox"
                  />
                  Mark out of stock
                </label>
              </div>
            </div>
          ))}
          <Button size="lg" type="submit">Confirm dispensing</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PharmacyPage() {
  const location = useLocation();
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState("");

  async function loadAll() {
    const [medicinesResponse, prescriptionsResponse, statsResponse, lowResponse, expiryResponse] = await Promise.all([
      api.get("/pharmacy/medicines", { params: { search } }),
      api.get("/pharmacy/prescriptions/pending"),
      api.get("/pharmacy/stats/daily"),
      api.get("/pharmacy/stock/alerts/low"),
      api.get("/pharmacy/stock/alerts/expiry"),
    ]);
    setMedicines(medicinesResponse.data.data.items);
    setPendingPrescriptions(prescriptionsResponse.data.data);
    setStats(statsResponse.data.data);
    setLowStock(lowResponse.data.data);
    setExpiryAlerts(expiryResponse.data.data);
  }

  useEffect(() => {
    loadAll();
  }, [search]);

  const selectedPrescription = useMemo(
    () => pendingPrescriptions.find((item) => item._id === selectedPrescriptionId) || pendingPrescriptions[0] || null,
    [pendingPrescriptions, selectedPrescriptionId],
  );

  const statCards = stats
    ? [
        { label: "Pending", value: String(stats.pendingPrescriptions), detail: "Waiting for pharmacist", accent: "linear-gradient(135deg,#2E7D32,#6bd388)" },
        { label: "Dispensed Today", value: String(stats.dispensedToday), detail: "Closed today", accent: "linear-gradient(135deg,#00879a,#6bd8e2)" },
        { label: "Low Stock", value: String(stats.lowStockCount), detail: "Needs reorder", accent: "linear-gradient(135deg,#d89812,#f7d27d)" },
        { label: "Expiry Alerts", value: String(stats.expiryAlertCount), detail: "Batches at risk", accent: "linear-gradient(135deg,#c83f3f,#f6a09e)" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="Medicine inventory, stock movement controls, and prescription dispensing are now connected to the live pharmacy workflow."
        eyebrow="Pharmacy"
        title="Pharmacy operations"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <StatCard accent={item.accent} detail={item.detail} key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <Tabs
        items={[
          { label: "Dashboard", value: "dashboard" },
          { label: "Medicines", value: "medicines" },
          { label: "Dispensing", value: "dispensing" },
          { label: "Alerts", value: "alerts" },
        ]}
        onChange={setTab}
        value={tab}
      />

      {tab === "dashboard" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <MedicineForm onCreated={loadAll} />
          <StockReceiptForm medicines={medicines} onReceived={loadAll} />
        </section>
      ) : null}

      {tab === "medicines" ? (
        <Card>
          <CardHeader eyebrow="Inventory List" title="Medicine master and availability" />
          <CardContent className="space-y-4">
            <Input label="Search medicines" onChange={(event) => setSearch(event.target.value)} value={search} />
            <DataTable
              columns={[
                { key: "medicineCode", label: "Code" },
                { key: "genericName", label: "Generic" },
                { key: "brandName", label: "Brand" },
                { key: "category", label: "Category" },
                { key: "strength", label: "Strength" },
                { key: "activeStatus", label: "Status", render: (value) => <Badge tone={value ? "success" : "danger"}>{value ? "active" : "inactive"}</Badge> },
              ]}
              rows={medicines}
            />
          </CardContent>
        </Card>
      ) : null}

      {tab === "dispensing" ? (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader eyebrow="Queue" title="Pending prescriptions" />
            <CardContent className="space-y-3">
              {pendingPrescriptions.map((prescription) => (
                <button
                  className={`block w-full rounded-[1.5rem] border p-4 text-left ${
                    selectedPrescription?._id === prescription._id
                      ? "border-[var(--color-brand)] bg-[var(--color-surface-elevated)]"
                      : "border-[var(--color-border)]"
                  }`}
                  key={prescription._id}
                  onClick={() => setSelectedPrescriptionId(prescription._id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-foreground-muted)]">{prescription.prescriptionNumber}</p>
                      <h4 className="mt-1 font-semibold text-[var(--color-foreground)]">{prescription.patientId}</h4>
                      <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{prescription.doctorName || "Doctor assigned"}</p>
                    </div>
                    <Badge tone={prescription.status === "partially_dispensed" ? "warning" : "info"}>{prescription.status}</Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
          <DispenseWorkspace onDispensed={loadAll} prescription={selectedPrescription} />
        </section>
      ) : null}

      {tab === "alerts" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader eyebrow="Low Stock" title="Medicines requiring attention" />
            <CardContent>
              <DataTable
                columns={[
                  { key: "genericName", label: "Medicine" },
                  { key: "totalAvailable", label: "Available" },
                  { key: "reorderLevel", label: "Reorder" },
                ]}
                rows={lowStock}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader eyebrow="Expiry" title="Batch expiry alerts" />
            <CardContent>
              <DataTable
                columns={[
                  { key: "batchNumber", label: "Batch" },
                  { key: "risk", label: "Risk", render: (value) => <Badge tone={String(value).includes("7") || value === "expired" ? "danger" : "warning"}>{value}</Badge> },
                  { key: "expiryDate", label: "Expiry", render: (value) => new Date(value).toLocaleDateString("en-IN") },
                ]}
                rows={expiryAlerts}
              />
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
