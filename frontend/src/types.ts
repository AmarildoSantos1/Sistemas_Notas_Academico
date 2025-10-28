export type Stage = 'E1' | 'E2' | 'E3'

export interface Disciplina {
  id: string
  nome: string
  data_cadastro: string
  notas: Record<Stage, number | null>
  media: number | null
  status: string
}

export interface Aluno {
  id: string
  nome: string
  tipo_id: 'MATRICULA' | 'CPF'
  identificador: string
  data_cadastro: string
  disciplinas: Disciplina[]
}
