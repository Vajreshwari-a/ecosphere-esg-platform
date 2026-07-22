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
const [transactions, setTransactions] = useState([]);
const [newTransaction, setNewTransaction] = useState({
  department_id: "",
  emission_factor_id: "",
  quantity: "",
});
const [editingTransactionId, setEditingTransactionId] = useState(null);
  useEffect(() => {
  fetchDepartments();
  fetchEmissionFactors();
  fetchTransactions();
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
  async function fetchTransactions() {
  const { data, error } = await supabase
    .from("carbon_transactions")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  setTransactions(data);
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
async function addTransaction() {
  const factor = emissionFactors.find(
    (f) => f.id === newTransaction.emission_factor_id
  );

  const emissions =
    Number(newTransaction.quantity) *
    Number(factor.factor_value);

  const { error } = await supabase
    .from("carbon_transactions")
    .insert([
      {
        ...newTransaction,
        emissions,
      },
    ]);

  if (error) {
    console.error(error);
    return;
  }

  setNewTransaction({
    department_id: "",
    emission_factor_id: "",
    quantity: "",
  });

  fetchTransactions();
}
async function deleteTransaction(id) {
  const { error } = await supabase
    .from("carbon_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  fetchTransactions();
}
async function updateTransaction() {
  const factor = emissionFactors.find(
    (f) => f.id === newTransaction.emission_factor_id
  );

  const emissions =
    Number(newTransaction.quantity) *
    Number(factor.factor_value);

  const { error } = await supabase
    .from("carbon_transactions")
    .update({
      ...newTransaction,
      emissions,
    })
    .eq("id", editingTransactionId);

  if (error) {
    console.error(error);
    return;
  }

  setNewTransaction({
    department_id: "",
    emission_factor_id: "",
    quantity: "",
  });

  setEditingTransactionId(null);

  fetchTransactions();
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
<div className="bg-white rounded-lg shadow p-4 mb-4">
  <h2 className="text-xl font-semibold mb-4">
    Add Carbon Transaction
  </h2>

  <div className="flex gap-3">
    <select
      value={newTransaction.department_id}
      onChange={(e) =>
        setNewTransaction({
          ...newTransaction,
          department_id: e.target.value,
        })
      }
      className="border p-2 rounded flex-1"
    >
      <option value="">Select Department</option>

      {departments.map((dept) => (
        <option key={dept.id} value={dept.id}>
          {dept.name}
        </option>
      ))}
    </select>

    <select
      value={newTransaction.emission_factor_id}
      onChange={(e) =>
        setNewTransaction({
          ...newTransaction,
          emission_factor_id: e.target.value,
        })
      }
      className="border p-2 rounded flex-1"
    >
      <option value="">Select Emission Factor</option>

      {emissionFactors.map((factor) => (
        <option key={factor.id} value={factor.id}>
          {factor.name}
        </option>
      ))}
    </select>

    <input
      type="number"
      placeholder="Quantity"
      value={newTransaction.quantity}
      onChange={(e) =>
        setNewTransaction({
          ...newTransaction,
          quantity: e.target.value,
        })
      }
      className="border p-2 rounded"
    />
    <button
  onClick={
    editingTransactionId
      ? updateTransaction
      : addTransaction
  }
  className="bg-green-600 text-white px-5 rounded"
>
  {editingTransactionId ? "Update" : "Add"}
</button>
  </div>
</div>
<h2 className="text-xl font-semibold mt-8 mb-4">
  Carbon Transactions
</h2>

<DataTable
  columns={[
    { key: "department_id", label: "Department" },
    { key: "emission_factor_id", label: "Emission Factor" },
    { key: "quantity", label: "Quantity" },
    { key: "emissions", label: "Emissions" },
  ]}
  rows={transactions.map((transaction) => ({
    ...transaction,
    department_id:
      departments.find(
        (department) => department.id === transaction.department_id
      )?.name || "Unknown",

    emission_factor_id:
      emissionFactors.find(
        (factor) => factor.id === transaction.emission_factor_id
      )?.name || "Unknown",
  }))}
  actions={[
  {
    label: "Edit",
    onClick: (row) => {
      setEditingTransactionId(row.id);

      const department = departments.find(
        (d) => d.name === row.department_id
      );

      const factor = emissionFactors.find(
        (f) => f.name === row.emission_factor_id
      );

      setNewTransaction({
        department_id: department?.id || "",
        emission_factor_id: factor?.id || "",
        quantity: row.quantity,
      });
    },
  },
  {
    label: "Delete",
    onClick: (row) => deleteTransaction(row.id),
  },
]}
  emptyText="No carbon transactions found"
/>
      </div>
    </div>
  );
}