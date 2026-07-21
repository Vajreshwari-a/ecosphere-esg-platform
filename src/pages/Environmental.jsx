import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import DashboardCard from "../components/DashboardCard";

export default function Environmental() {
  const [departments, setDepartments] = useState([]);
  const [emissionFactors, setEmissionFactors] = useState([]);

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

        {emissionFactors.map((factor) => (
          <div
            key={factor.id}
            className="border p-3 rounded mb-2"
          >
            <h3 className="font-semibold">{factor.name}</h3>
            <p>Factor: {factor.factor_value}</p>
            <p>Unit: {factor.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}