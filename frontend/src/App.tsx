import React, { useState } from 'react'
import Login from './pages/Login'
import Students from './pages/Students'

export default function App() {
  const [ok, setOk] = useState(!!localStorage.getItem('token'))
  return ok ? <Students onLogout={() => setOk(false)} /> : <Login onSuccess={() => setOk(true)} />
}
