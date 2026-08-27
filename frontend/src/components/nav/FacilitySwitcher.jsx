import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export function FacilitySwitcher() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [value, setValue] = useState(window.localStorage.getItem("rhms-active-facility-id") || "");

  useEffect(() => {
    async function loadContext() {
      try {
        const response = await api.get("/platform/context");
        setFacilities(response.data.data.allowedFacilities || []);
      } catch {
        setFacilities([]);
      }
    }

    if (user) {
      loadContext();
    }
  }, [user]);

  if (!user || facilities.length <= 1) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 text-sm text-[var(--color-foreground-muted)]">
      <span>Facility</span>
      <select
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-2 text-sm"
        onChange={async (event) => {
          const facilityId = event.target.value;
          setValue(facilityId);
          window.localStorage.setItem("rhms-active-facility-id", facilityId);
          await api.post("/platform/switch-facility", { facilityId });
          window.location.reload();
        }}
        value={value}
      >
        {facilities.map((facility) => (
          <option key={facility._id} value={facility._id}>{facility.name}</option>
        ))}
      </select>
    </label>
  );
}
