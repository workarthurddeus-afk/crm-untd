import { beforeEach } from 'vitest'

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
  }
})
