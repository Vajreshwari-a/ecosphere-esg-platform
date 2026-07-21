import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import DashboardCard from '../components/DashboardCard'

export default function Environmental() {
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    supabase.from('departments').select('*').then(({ data, error }) => {
      if (error) console.error(error)
      else setDepartments(data)
    })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Environmental</h1>
      <DashboardCard title="Departments found" value={departments.length} />
    </div>
  )
}