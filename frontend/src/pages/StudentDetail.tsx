import React, { useEffect, useState } from 'react'
import type { Aluno, Disciplina, Stage } from '../types'
import { listCourses, addCourse, deleteCourse, setGrade, updateCourse, downloadAlunoCSV } from '../api'

export default function StudentDetail({ aluno, onClose, onChanged }: { aluno: Aluno, onClose: ()=>void, onChanged: ()=>void }) {
  const [items, setItems] = useState<Disciplina[]>([])
  const [nome, setNome] = useState('')
  const [data, setData] = useState('')
  const [fNome, setFNome] = useState('')
  const [fEst, setFEst] = useState('')
  const [dmin, setDmin] = useState('')
  const [dmax, setDmax] = useState('')

  async function refresh() {
    const params: Record<string,string> = {}
    if (fNome) params.name = fNome
    if (fEst) params.stage_with_grade = fEst
    if (dmin) params.date_min = dmin
    if (dmax) params.date_max = dmax
    const ds = await listCourses(aluno.id, params)
    setItems(ds)
  }

  useEffect(()=>{ refresh() }, [aluno.id])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    await addCourse(aluno.id, { nome, data_cadastro: data || undefined })
    setNome(''); setData('')
    await refresh(); await onChanged()
  }

  async function del(d: Disciplina) {
    if (!confirm(`Remover a disciplina ${d.nome}?`)) return
    await deleteCourse(aluno.id, d.id)
    await refresh(); await onChanged()
  }

  async function update(d: Disciplina, novoNome: string, novaData: string) {
    await updateCourse(aluno.id, d.id, { nome: novoNome, data_cadastro: novaData || undefined })
    await refresh(); await onChanged()
  }

  async function grade(d: Disciplina, est: Stage, valor: string) {
    const n = Number(valor)
    if (isNaN(n)) return
    await setGrade(aluno.id, d.id, est, n)
    await refresh(); await onChanged()
  }

  return (
    <div style={{marginTop:24, padding:16, border:'1px solid #ddd', borderRadius:8}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h3>Gerenciar: {aluno.nome} — {aluno.tipo_id}:{aluno.identificador}</h3>
        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>downloadAlunoCSV(aluno.id)}>Boletim (CSV)</button>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8, marginTop:12}}>
        <input placeholder="Filtrar nome" value={fNome} onChange={e=>setFNome(e.target.value)} />
        <select value={fEst} onChange={e=>setFEst(e.target.value)}>
          <option value="">Com nota (todos)</option>
          <option value="1">E1</option>
          <option value="2">E2</option>
          <option value="3">E3</option>
          <option value="E1">E1 (texto)</option>
          <option value="E2">E2 (texto)</option>
          <option value="E3">E3 (texto)</option>
        </select>
        <input type="date" value={dmin} onChange={e=>setDmin(e.target.value)} />
        <input type="date" value={dmax} onChange={e=>setDmax(e.target.value)} />
      </div>
      <button style={{marginTop:8}} onClick={refresh}>Aplicar filtros</button>

      <h4 style={{marginTop:16}}>Nova disciplina</h4>
      <form onSubmit={add} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:8}}>
        <input placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} required />
        <input type="date" value={data} onChange={e=>setData(e.target.value)} />
        <button type="submit">Adicionar</button>
      </form>

      <table style={{width:'100%', marginTop:12, borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th align="left">Disciplina</th><th>Cadastro</th>
            <th>E1</th><th>E2</th><th>E3</th><th>Média</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map(d=>(
            <tr key={d.id} style={{borderTop:'1px solid #ddd'}}>
              <td>
                <b>{d.nome}</b><br/>
                <small>{d.id}</small>
              </td>
              <td align="center">
                <input defaultValue={d.data_cadastro} type="date"
                  onBlur={e=>update(d, d.nome, e.target.value)} />
              </td>
              {(['E1','E2','E3'] as Stage[]).map(est=>(
                <td key={est} align="center">
                  <input
                    style={{width:70}}
                    defaultValue={d.notas[est] ?? ''}
                    placeholder={est}
                    type="number" step="0.01" min={0} max={10}
                    onBlur={(e)=>grade(d, est, e.target.value)}
                  />
                </td>
              ))}
              <td align="center">{d.media ?? '-'}</td>
              <td align="center">{d.status}</td>
              <td align="right">
                <input defaultValue={d.nome} onBlur={e=>update(d, e.target.value, d.data_cadastro)} style={{width:140, marginRight:8}}/>
                <button onClick={()=>del(d)} style={{color:'crimson'}}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
