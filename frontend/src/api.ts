const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

let token: string | null = localStorage.getItem('token')

export function setToken(t: string | null) {
  token = t
  if (t) localStorage.setItem('token', t)
  else localStorage.removeItem('token')
}

async function req(path: string, init?: RequestInit) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const r = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers||{}) } })
  if (!r.ok) {
    const text = await r.text().catch(()=> '')
    throw new Error(text || `Erro HTTP ${r.status}`)
  }
  const ct = r.headers.get('content-type') || ''
  if (ct.includes('application/json')) return r.json()
  return r
}

export async function login(username: string, password: string) {
  const data = await req('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
  setToken((data as any).token)
}

export async function logout() {
  await req('/auth/logout', { method: 'POST' })
  setToken(null)
}

export async function listStudents(params?: Record<string,string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return req('/students'+qs) as Promise<import('./types').Aluno[]>
}

export async function createStudent(a: Partial<import('./types').Aluno>) {
  return req('/students', { method:'POST', body: JSON.stringify(a) })
}

export async function deleteStudent(id: string) {
  return req(`/students/${id}`, { method:'DELETE' })
}

export async function listCourses(aid: string, params?: Record<string,string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return req(`/students/${aid}/courses${qs}`) as Promise<import('./types').Disciplina[]>
}

export async function addCourse(aid: string, payload: {nome: string, data_cadastro?: string}) {
  return req(`/students/${aid}/courses`, { method:'POST', body: JSON.stringify(payload) })
}

export async function updateCourse(aid: string, did: string, payload: {nome: string, data_cadastro?: string}) {
  return req(`/students/${aid}/courses/${did}`, { method:'PUT', body: JSON.stringify(payload) })
}

export async function deleteCourse(aid: string, did: string) {
  return req(`/students/${aid}/courses/${did}`, { method:'DELETE' })
}

export async function setGrade(aid: string, did: string, estagio: 'E1'|'E2'|'E3', nota: number) {
  return req(`/students/${aid}/courses/${did}/grade`, { method:'PATCH', body: JSON.stringify({ estagio, nota }) })
}

export function downloadAlunoCSV(aid: string) {
  const url = `${BASE}/students/${aid}/report.csv`
  window.open(url, "_blank")
}

export function downloadTurmaCSV() {
  const url = `${BASE}/reports/class.csv`
  window.open(url, "_blank")
}
