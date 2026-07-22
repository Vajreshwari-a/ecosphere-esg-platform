import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import DashboardCard from "../components/DashboardCard";
import DataTable from "../components/DataTable";

export default function Environmental() {
  const [departments, setDepartments] = useState([]);
  const [emissionFactors, setEmissionFactors] = useState([]);
  const [newFactor, setNewFactor] = useState({
  name: "",
  factor_value: "",
  unit: "",
});
const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchEmissionFactors();
  }, []);

  async function fetchDepartments() {
    const { data, error } = await supabase
      .from("departments")
      .select("*");

    if (error) {
      console.error(error);
    } else {
      setDepartments(data);
    }
  }

  async function fetchEmissionFactors() {
    const { data, error } = await supabase
      .from("emission_factors")
      .select("*");

    if (error) {
      console.error(error);
    } else {
      setEmissionFactors(data);
    }
  }
  async function addEmissionFactor() {
  const { error } = await supabase
    .from("emission_factors")
    .insert([newFactor]);

  if (error) {
    console.error(error);
    return;
  }
  
  setNewFactor({
    name: "",
    factor_value: "",
    unit: "",
  });

  fetchEmissionFactors();
}
async function updateEmissionFactor() {
  const { error } = await supabase
    .from("emission_factors")
    .update(newFactor)
    .eq("id", editingId);

  if (error) {
    console.error(error);
    return;
  }

  setNewFactor({
    name: "",
    factor_value: "",
    unit: "",
  });

  setEditingId(null);

  fetchEmissionFactors();
}
async function deleteEmissionFactor(id) {
  const { error } = await supabase
    .from("emission_factors")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  fetchEmissionFactors();
}
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Environmental Module
      </h1>

      <DashboardCard
        title="Departments Found"
        value={departments.length}
      />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">
          Emission Factors
        </h2>
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex gap-3">
  <input
    type="text"
    placeholder="Factor Name"
    value={newFactor.name}
    onChange={(e) =>
      setNewFactor({ ...newFactor, name: e.target.value })
    }
    className="border p-2 rounded flex-1"
  />

  <input
    type="number"
    placeholder="Factor Value"
    value={newFactor.factor_value}
    onChange={(e) =>
      setNewFactor({
        ...newFactor,
        factor_value: e.target.value,
      })
    }
    className="border p-2 rounded"
  />

  <input
    type="text"
    placeholder="Unit"
    value={newFactor.unit}
    onChange={(e) =>
      setNewFactor({ ...newFactor, unit: e.target.value })
    }
    className="border p-2 rounded"
  />

  <button
  onClick={editingId ? updateEmissionFactor : addEmissionFactor}
  className="bg-green-600 text-white px-5 rounded"
>
  {editingId ? "Update" : "Add"}
</button>
</div>
        <DataTable
  columns={[
    { key: "name", label: "Name" },
    { key: "factor_value", label: "Factor Value" },
    { key: "unit", label: "Unit" },
  ]}
  rows={emissionFactors}
 actions={[
  {
    label: "Edit",
    onClick: (row) => {
      setEditingId(row.id);
      setNewFactor({
        name: row.name,
        factor_value: row.factor_value,
        unit: row.unit,
      });
    },
  },
  {
  label: "Delete",
  onClick: (row) => deleteEmissionFactor(row.id),
},
]}
  emptyText="No emission factors found"
/>
      </div>
    </div>
  );
}