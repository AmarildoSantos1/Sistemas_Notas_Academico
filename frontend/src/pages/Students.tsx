import React, { useEffect, useState } from 'react'
import { listStudents, createStudent, deleteStudent, logout, downloadTurmaCSV } from '../api'
import StudentDetail from './StudentDetail'
import type { Aluno } from '../types'

export default function Students({ onLogout }: { onLogout: () => void }) {
  const [items, setItems] = useState<Aluno[]>([])
  const [fNome, setFNome] = useState('')
  const [fTipo, setFTipo] = useState<'MATRICULA'|'CPF'|''>('')
  const [fIdent, setFIdent] = useState('')
  const [dmin, setDmin] = useState('')
  const [dmax, setDmax] = useState('')
  const [sel, setSel] = useState<Aluno | null>(null)
  const [novo, setNovo] = useState({nome:'', tipo_id:'MATRICULA' as 'MATRICULA'|'CPF', identificador:'', data_cadastro:''})

  async function refresh() {
    const params: Record<string,string> = {}
    if (fNome) params.name = fNome
    if (fTipo) params.tipo = fTipo
    if (fIdent) params.ident = fIdent
    if (dmin) params.date_min = dmin
    if (dmax) params.date_max = dmax
    const data = await listStudents(params)
    setItems(data)
    if (sel) setSel(data.find(a=>a.id===sel.id) || null)
  }
  useEffect(()=>{ refresh() }, [])

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    await createStudent(novo)
    setNovo({nome:'', tipo_id:'MATRICULA', identificador:'', data_cadastro:''})
    await refresh()
  }

  async function removeStudent(a: Aluno) {
    if (!confirm(`Remover o aluno ${a.nome}?`)) return
    await deleteStudent(a.id)
    await refresh()
  }

  async function doLogout() {
    try { await logout() } catch {}
    onLogout()
  }

  return (
    <div style={{maxWidth:1000, margin:'30px auto', fontFamily:'system-ui'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Alunos</h2>
        <div style={{display:'flex', gap:8}}>
          <button onClick={downloadTurmaCSV}>Exportar Turma (CSV)</button>
          <button onClick={doLogout}>Sair</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8, marginTop:12}}>
        <input placeholder="Nome contém" value={fNome} onChange={e=>setFNome(e.target.value)} />
        <select value={fTipo} onChange={e=>setFTipo(e.target.value as any)}>
          <option value="">Tipo (todos)</option>
          <option value="MATRICULA">MATRÍCULA</option>
          <option value="CPF">CPF</option>
        </select>
        <input placeholder="Identificador exato" value={fIdent} onChange={e=>setFIdent(e.target.value)} />
        <input type="date" value={dmin} onChange={e=>setDmin(e.target.value)} />
        <input type="date" value={dmax} onChange={e=>setDmax(e.target.value)} />
      </div>
      <button style={{marginTop:8}} onClick={refresh}>Filtrar</button>

      <h3 style={{marginTop:24}}>Novo aluno</h3>
      <form onSubmit={addStudent} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8}}>
        <input placeholder="Nome" value={novo.nome} onChange={e=>setNovo(s=>({...s, nome:e.target.value}))} required />
        <select value={novo.tipo_id} onChange={e=>setNovo(s=>({...s, tipo_id:e.target.value as any}))}>
          <option value="MATRICULA">MATRÍCULA</option>
          <option value="CPF">CPF</option>
        </select>
        <input placeholder="Identificador" value={novo.identificador} onChange={e=>setNovo(s=>({...s, identificador:e.target.value}))} required />
        <input type="date" value={novo.data_cadastro} onChange={e=>setNovo(s=>({...s, data_cadastro:e.target.value}))} />
        <button type="submit" style={{gridColumn:'span 4', justifySelf:'start'}}>Cadastrar</button>
      </form>

      <table style={{width:'100%', marginTop:16, borderCollapse:'collapse'}}>
        <thead>
          <tr><th align="left">Nome</th><th>Tipo</th><th>Identificador</th><th>Cadastro</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {items.map(a=>(
            <tr key={a.id} style={{borderTop:'1px solid #ddd'}}>
              <td>{a.nome}</td><td align="center">{a.tipo_id}</td><td align="center">{a.identificador}</td><td align="center">{a.data_cadastro}</td>
              <td align="right">
                <button onClick={()=>setSel(a)} style={{marginRight:8}}>Gerenciar</button>
                <button onClick={()=>removeStudent(a)} style={{color:'crimson'}}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sel && <StudentDetail aluno={sel} onClose={()=>setSel(null)} onChanged={refresh} />}
    </div>
  )
}
