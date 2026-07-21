import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import DataTable from '../components/DataTable'
import DashboardCard from '../components/DashboardCard'
export default function Social() {
  const [activities, setActivities] = useState([])
  const [employees, setEmployees] = useState([])
  const [participations, setParticipations] = useState([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedActivity, setSelectedActivity] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchActivities()
    fetchEmployees()
    fetchParticipations()
  }, [])

  async function fetchActivities() {
    const { data, error } = await supabase.from('csr_activities').select('*')
    if (error) console.error(error)
    else setActivities(data)
  }

  async function fetchEmployees() {
    const { data, error } = await supabase.from('employees').select('*')
    if (error) console.error(error)
    else setEmployees(data)
  }

  async function fetchParticipations() {
    // The "employees(name), csr_activities(title)" part pulls in the
    // related employee's name and activity's title in the same query,
    // instead of you having to look them up separately.
    const { data, error } = await supabase
      .from('employee_participation')
      .select('*, employees(name), csr_activities(title)')
    if (error) console.error(error)
    else setParticipations(data)
  }

  async function handleAddActivity(e) {
    e.preventDefault()
    if (!title.trim()) return
    const { error } = await supabase
      .from('csr_activities')
      .insert({ title, description, module: 'social' })
    if (error) return console.error(error)
    setTitle('')
    setDescription('')
    fetchActivities()
  }

  async function handleLogParticipation(e) {
    e.preventDefault()
    if (!selectedEmployee || !selectedActivity) return

    let proof_url = null

    if (proofFile) {
      setUploading(true)
      const fileName = `${Date.now()}-${proofFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(fileName, proofFile)

      if (uploadError) {
        console.error(uploadError)
        setUploading(false)
        return
      }

      // Turn the uploaded file's path into a public URL we can store.
      const { data: urlData } = supabase.storage
        .from('proofs')
        .getPublicUrl(fileName)
      proof_url = urlData.publicUrl
      setUploading(false)
    }

    const { error } = await supabase.from('employee_participation').insert({
      employee_id: selectedEmployee,
      activity_id: selectedActivity,
      proof_url,
      approval_status: 'pending',
      module: 'social',
    })

    if (error) return console.error(error)

    setSelectedEmployee('')
    setSelectedActivity('')
    setProofFile(null)
    fetchParticipations()
  }

  async function handleApprove(row) {
    // Evidence Requirement rule: block approval if no proof was uploaded.
    if (!row.proof_url) {
      alert('Cannot approve — no proof file was attached.')
      return
    }
    const { error } = await supabase
      .from('employee_participation')
      .update({ approval_status: 'approved' })
      .eq('id', row.id)
    if (error) console.error(error)
    else fetchParticipations()
  }

  async function handleReject(row) {
    const { error } = await supabase
      .from('employee_participation')
      .update({ approval_status: 'rejected' })
      .eq('id', row.id)
    if (error) console.error(error)
    else fetchParticipations()
  }

  const activityColumns = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
  ]

  const participationColumns = [
    { key: 'employee', label: 'Employee', render: (row) => row.employees?.name },
    { key: 'activity', label: 'Activity', render: (row) => row.csr_activities?.title },
    { key: 'proof_url', label: 'Proof', render: (row) => row.proof_url ? '✅ Attached' : '— None' },
    { key: 'approval_status', label: 'Status' },
  ]
// Add this above the return statement, after your existing fetch functions:
const totalEmployees = employees.length
const femaleCount = employees.filter((e) => e.gender === 'F').length
const departmentsRepresented = new Set(employees.map((e) => e.department_id)).size

const diversityPercent = totalEmployees > 0
  ? Math.round((femaleCount / totalEmployees) * 100)
  : 0
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Social</h1>
      <div className="grid grid-cols-4 gap-4">
  <DashboardCard title="Total Employees" value={totalEmployees} />
  <DashboardCard title="Female Representation" value={`${diversityPercent}%`} />
  <DashboardCard title="Departments Represented" value={departmentsRepresented} />
  <DashboardCard title="Training Completion" value="78%" />
</div>

      {/* CSR Activities */}
      <div>
        <h2 className="text-lg font-semibold mb-2">CSR Activities</h2>
        <form onSubmit={handleAddActivity} className="bg-white rounded-lg shadow p-4 mb-4 flex gap-3">
          <input type="text" placeholder="Activity title" value={title}
            onChange={(e) => setTitle(e.target.value)} className="border rounded px-3 py-2 flex-1" />
          <input type="text" placeholder="Description" value={description}
            onChange={(e) => setDescription(e.target.value)} className="border rounded px-3 py-2 flex-1" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
        </form>
        <DataTable columns={activityColumns} rows={activities} emptyText="No CSR activities yet" />
      </div>

      {/* Employee Participation */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Employee Participation</h2>
        <form onSubmit={handleLogParticipation} className="bg-white rounded-lg shadow p-4 mb-4 flex gap-3 items-center">
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
            className="border rounded px-3 py-2 flex-1">
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <select value={selectedActivity} onChange={(e) => setSelectedActivity(e.target.value)}
            className="border rounded px-3 py-2 flex-1">
            <option value="">Select activity</option>
            {activities.map((act) => (
              <option key={act.id} value={act.id}>{act.title}</option>
            ))}
          </select>
          <input type="file" onChange={(e) => setProofFile(e.target.files[0])} className="flex-1 text-sm" />
          <button type="submit" disabled={uploading}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300">
            {uploading ? 'Uploading...' : 'Log'}
          </button>
        </form>
        <DataTable
          columns={participationColumns}
          rows={participations}
          emptyText="No participation logged yet"
          actions={[
            { label: 'Approve', onClick: handleApprove, isDisabled: (row) => !row.proof_url || row.approval_status === 'approved' },
            { label: 'Reject', onClick: handleReject, isDisabled: (row) => row.approval_status === 'rejected' },
          ]}
        />
      </div>
    </div>
  )
}