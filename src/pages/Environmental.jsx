import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function Environmental() {
  const [emissionFactors, setEmissionFactors] = useState([]);

  useEffect(() => {
    fetchEmissionFactors();
  }, []);

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

    {emissionFactors.map((factor) => (
      <div
        key={factor.id}
        className="border p-3 rounded mb-2"
      >
        <h2 className="font-semibold">{factor.name}</h2>
        <p>Factor: {factor.factor_value}</p>
        <p>Unit: {factor.unit}</p>
      </div>
    ))}
  </div>
);
}