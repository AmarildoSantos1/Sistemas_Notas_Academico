import React, { useState } from 'react'
import { login } from '../api'

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [u, setU] = useState('admin')
  const [p, setP] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      await login(u, p)
      onSuccess()
    } catch (e:any) {
      setErr(e.message || 'Erro de login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily:'system-ui' }}>
      <h2>Login do Admin</h2>
      <form onSubmit={submit}>
        <label>Usuário</label>
        <input value={u} onChange={e=>setU(e.target.value)} required style={{width:'100%',padding:8,margin:'6px 0'}} />
        <label>Senha</label>
        <input value={p} onChange={e=>setP(e.target.value)} type="password" required style={{width:'100%',padding:8,margin:'6px 0'}} />
        {err && <div style={{color:'crimson',marginTop:6}}>{err}</div>}
        <button disabled={loading} type="submit" style={{marginTop:10,padding:'8px 12px'}}>Entrar</button>
      </form>
      <p style={{opacity:.6, marginTop:16}}>Primeiro acesso: usuário <b>admin</b> / senha <b>1234</b></p>
    </div>
  )
}
