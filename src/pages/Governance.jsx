import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import DataTable from '../components/DataTable'
import DashboardCard from '../components/DashboardCard'

export default function Governance() {
  const [policies, setPolicies] = useState([])
  const [policyTitle, setPolicyTitle] = useState('')
  const [policyBody, setPolicyBody] = useState('')
  const [editingPolicyId, setEditingPolicyId] = useState(null)

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])

  const [acknowledgements, setAcknowledgements] = useState([])
  const [ackEmployee, setAckEmployee] = useState('')
  const [ackPolicy, setAckPolicy] = useState('')

  const [audits, setAudits] = useState([])
  const [auditTitle, setAuditTitle] = useState('')
  const [auditDepartment, setAuditDepartment] = useState('')
  const [auditDate, setAuditDate] = useState('')
  const [auditFindings, setAuditFindings] = useState('')
  const [editingAuditId, setEditingAuditId] = useState(null)

  const [issues, setIssues] = useState([])
  const [issueAudit, setIssueAudit] = useState('')
  const [issueSeverity, setIssueSeverity] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [issueOwner, setIssueOwner] = useState('')
  const [issueDueDate, setIssueDueDate] = useState('')
  const [issueStatus, setIssueStatus] = useState('open')
  const [editingIssueId, setEditingIssueId] = useState(null)

  useEffect(() => {
    fetchPolicies()
    fetchEmployees()
    fetchDepartments()
    fetchAcknowledgements()
    fetchAudits()
    fetchIssues()
  }, [])

  async function fetchPolicies() {
    const { data, error } = await supabase.from('esg_policies').select('*')
    if (error) console.error(error)
    else setPolicies(data)
  }

  async function fetchEmployees() {
    const { data, error } = await supabase.from('employees').select('*')
    if (error) console.error(error)
    else setEmployees(data)
  }

  async function fetchDepartments() {
    const { data, error } = await supabase.from('departments').select('*')
    if (error) console.error(error)
    else setDepartments(data)
  }

  async function fetchAcknowledgements() {
    const { data, error } = await supabase
      .from('policy_acknowledgements')
      .select('*, employees(name), esg_policies(title)')
    if (error) console.error(error)
    else setAcknowledgements(data)
  }

  async function fetchAudits() {
    const { data, error } = await supabase.from('audits').select('*')
    if (error) console.error(error)
    else setAudits(data)
  }

  async function fetchIssues() {
    const { data, error } = await supabase
      .from('compliance_issues')
      .select('*, employees(name), audits(title)')
    if (error) console.error(error)
    else setIssues(data)
  }

  // --- Policies ---
  async function handleAddPolicy(e) {
    e.preventDefault()
    if (!policyTitle.trim()) return

    if (editingPolicyId) {
      const { error } = await supabase
        .from('esg_policies')
        .update({ title: policyTitle, body: policyBody })
        .eq('id', editingPolicyId)
      if (error) return console.error(error)
      setEditingPolicyId(null)
    } else {
      const { error } = await supabase
        .from('esg_policies')
        .insert({ title: policyTitle, body: policyBody })
      if (error) return console.error(error)
    }

    setPolicyTitle('')
    setPolicyBody('')
    fetchPolicies()
  }

  function editPolicy(policy) {
    setEditingPolicyId(policy.id)
    setPolicyTitle(policy.title)
    setPolicyBody(policy.body)
  }

  async function deletePolicy(id) {
    const { error } = await supabase.from('esg_policies').delete().eq('id', id)
    if (error) console.error(error)
    else fetchPolicies()
  }

  // --- Policy Acknowledgements ---
  async function handleAcknowledge(e) {
    e.preventDefault()
    if (!ackEmployee || !ackPolicy) return

    const { error } = await supabase.from('policy_acknowledgements').insert({
      employee_id: ackEmployee,
      policy_id: ackPolicy,
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      module: 'governance',
    })
    if (error) return console.error(error)

    setAckEmployee('')
    setAckPolicy('')
    fetchAcknowledgements()
  }

  // --- Audits ---
  async function handleAddAudit(e) {
    e.preventDefault()
    if (!auditTitle.trim()) return

    const payload = {
      title: auditTitle,
      department_id: auditDepartment || null,
      audit_date: auditDate || null,
      findings: auditFindings,
      module: 'governance',
    }

    if (editingAuditId) {
      const { error } = await supabase.from('audits').update(payload).eq('id', editingAuditId)
      if (error) return console.error(error)
      setEditingAuditId(null)
    } else {
      const { error } = await supabase.from('audits').insert(payload)
      if (error) return console.error(error)
    }

    setAuditTitle('')
    setAuditDepartment('')
    setAuditDate('')
    setAuditFindings('')
    fetchAudits()
  }

  function editAudit(audit) {
    setEditingAuditId(audit.id)
    setAuditTitle(audit.title)
    setAuditDepartment(audit.department_id || '')
    setAuditDate(audit.audit_date || '')
    setAuditFindings(audit.findings || '')
  }

  async function deleteAudit(id) {
    const { error } = await supabase.from('audits').delete().eq('id', id)
    if (error) console.error(error)
    else fetchAudits()
  }

  // --- Compliance Issues ---
  async function handleAddIssue(e) {
    e.preventDefault()
    // Owner and Due Date are mandatory fields (Compliance Issue Ownership rule)
    if (!issueOwner || !issueDueDate) {
      alert('Owner and Due Date are required for a Compliance Issue.')
      return
    }

    const payload = {
      audit_id: issueAudit || null,
      severity: issueSeverity,
      description: issueDescription,
      owner_employee_id: issueOwner,
      due_date: issueDueDate,
      status: issueStatus,
      module: 'governance',
    }

    if (editingIssueId) {
      const { error } = await supabase
        .from('compliance_issues')
        .update(payload)
        .eq('id', editingIssueId)
      if (error) return console.error(error)
      setEditingIssueId(null)
    } else {
      const { error } = await supabase.from('compliance_issues').insert(payload)
      if (error) return console.error(error)
    }

    setIssueAudit('')
    setIssueSeverity('')
    setIssueDescription('')
    setIssueOwner('')
    setIssueDueDate('')
    setIssueStatus('open')
    fetchIssues()
  }

  function editIssue(issue) {
    setEditingIssueId(issue.id)
    setIssueAudit(issue.audit_id || '')
    setIssueSeverity(issue.severity || '')
    setIssueDescription(issue.description || '')
    setIssueOwner(issue.owner_employee_id || '')
    setIssueDueDate(issue.due_date || '')
    setIssueStatus(issue.status || 'open')
  }

  async function deleteIssue(id) {
    const { error } = await supabase.from('compliance_issues').delete().eq('id', id)
    if (error) console.error(error)
    else fetchIssues()
  }

  function isOverdue(issue) {
    return issue.status === 'open' && issue.due_date && new Date(issue.due_date) < new Date()
  }

  // --- Summary stats ---
  const totalPolicies = policies.length
  const totalAcknowledgements = acknowledgements.length
  const openIssuesCount = issues.filter((i) => i.status === 'open').length
  const overdueCount = issues.filter(isOverdue).length

  // --- Columns ---
  const policyColumns = [
    { key: 'title', label: 'Title' },
    { key: 'body', label: 'Body' },
  ]

  const ackColumns = [
    { key: 'employee', label: 'Employee', render: (row) => row.employees?.name },
    { key: 'policy', label: 'Policy', render: (row) => row.esg_policies?.title },
    {
      key: 'acknowledged_at',
      label: 'Acknowledged At',
      render: (row) =>
        row.acknowledged_at ? new Date(row.acknowledged_at).toLocaleDateString() : '-',
    },
  ]

  const auditColumns = [
    { key: 'title', label: 'Title' },
    {
      key: 'department',
      label: 'Department',
      render: (row) => departments.find((d) => d.id === row.department_id)?.name || '-',
    },
    { key: 'audit_date', label: 'Audit Date' },
    { key: 'findings', label: 'Findings' },
  ]

  const issueColumns = [
    {
      key: 'severity',
      label: 'Severity',
      render: (row) => <span className="capitalize">{row.severity || '-'}</span>,
    },
    { key: 'description', label: 'Description' },
    { key: 'owner', label: 'Owner', render: (row) => row.employees?.name || '-' },
    { key: 'due_date', label: 'Due Date' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className="flex items-center gap-2">
          <span className="capitalize">{row.status}</span>
          {isOverdue(row) && (
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              Overdue
            </span>
          )}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Governance</h1>

      <div className="grid grid-cols-4 gap-4">
        <DashboardCard title="ESG Policies" value={totalPolicies} />
        <DashboardCard title="Acknowledgements Logged" value={totalAcknowledgements} />
        <DashboardCard title="Open Compliance Issues" value={openIssuesCount} />
        <DashboardCard
          title="Overdue Issues"
          value={overdueCount}
          accent={overdueCount > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* ESG Policies */}
      <div>
        <h2 className="text-lg font-semibold mb-2">ESG Policies</h2>
        <form
          onSubmit={handleAddPolicy}
          className="bg-white rounded-lg shadow p-4 mb-4 flex gap-3 flex-wrap"
        >
          <input
            type="text"
            placeholder="Policy title"
            value={policyTitle}
            onChange={(e) => setPolicyTitle(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            type="text"
            placeholder="Body / summary"
            value={policyBody}
            onChange={(e) => setPolicyBody(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {editingPolicyId ? 'Update' : 'Add'}
          </button>
        </form>
        <DataTable
          columns={policyColumns}
          rows={policies}
          emptyText="No ESG policies yet"
          actions={[
            { label: 'Edit', onClick: editPolicy },
            { label: 'Delete', onClick: (row) => deletePolicy(row.id) },
          ]}
        />
      </div>

      {/* Policy Acknowledgements */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Policy Acknowledgements</h2>
        <form
          onSubmit={handleAcknowledge}
          className="bg-white rounded-lg shadow p-4 mb-4 flex gap-3 items-center"
        >
          <select
            value={ackEmployee}
            onChange={(e) => setAckEmployee(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
          <select
            value={ackPolicy}
            onChange={(e) => setAckPolicy(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          >
            <option value="">Select policy</option>
            {policies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Mark Acknowledged
          </button>
        </form>
        <DataTable
          columns={ackColumns}
          rows={acknowledgements}
          emptyText="No acknowledgements logged yet"
        />
      </div>

      {/* Audits */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Audits</h2>
        <form
          onSubmit={handleAddAudit}
          className="bg-white rounded-lg shadow p-4 mb-4 flex gap-3 flex-wrap"
        >
          <input
            type="text"
            placeholder="Audit title"
            value={auditTitle}
            onChange={(e) => setAuditTitle(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <select
            value={auditDepartment}
            onChange={(e) => setAuditDepartment(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={auditDate}
            onChange={(e) => setAuditDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Findings"
            value={auditFindings}
            onChange={(e) => setAuditFindings(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {editingAuditId ? 'Update' : 'Add'}
          </button>
        </form>
        <DataTable
          columns={auditColumns}
          rows={audits}
          emptyText="No audits logged yet"
          actions={[
            { label: 'Edit', onClick: editAudit },
            { label: 'Delete', onClick: (row) => deleteAudit(row.id) },
          ]}
        />
      </div>

      {/* Compliance Issues */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Compliance Issues</h2>
        <form
          onSubmit={handleAddIssue}
          className="bg-white rounded-lg shadow p-4 mb-4 flex gap-3 flex-wrap items-center"
        >
          <select
            value={issueAudit}
            onChange={(e) => setIssueAudit(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Linked audit (optional)</option>
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <select
            value={issueSeverity}
            onChange={(e) => setIssueSeverity(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <select
            value={issueOwner}
            onChange={(e) => setIssueOwner(e.target.value)}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">Owner *</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={issueDueDate}
            onChange={(e) => setIssueDueDate(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <select
            value={issueStatus}
            onChange={(e) => setIssueStatus(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {editingIssueId ? 'Update' : 'Add'}
          </button>
        </form>
        <DataTable
          columns={issueColumns}
          rows={issues}
          emptyText="No compliance issues logged yet"
          actions={[
            { label: 'Edit', onClick: editIssue },
            { label: 'Delete', onClick: (row) => deleteIssue(row.id) },
          ]}
        />
      </div>
    </div>
  )
}
