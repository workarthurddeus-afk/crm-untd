export interface Entity {
  id: string
  createdAt: string
  updatedAt: string
}

export type EntityInput<T extends Entity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

export interface Repository<T extends Entity, TInput = EntityInput<T>> {
  list(filters?: Partial<T>): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(data: TInput): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  subscribe(listener: () => void): () => void
}
