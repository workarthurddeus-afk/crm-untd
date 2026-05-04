import { Sun, Moon, type LucideIcon } from 'lucide-react'

export interface GreetingResult {
  label: string
  Icon: LucideIcon
  iconClass: string
}

export function greetingFor(date: Date): GreetingResult {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) {
    return { label: 'Bom dia', Icon: Sun, iconClass: 'text-warning' }
  }
  if (hour >= 12 && hour < 18) {
    return { label: 'Boa tarde', Icon: Sun, iconClass: 'text-info' }
  }
  if (hour >= 18 && hour < 24) {
    return { label: 'Boa noite', Icon: Moon, iconClass: 'text-primary' }
  }
  return { label: 'Boa madrugada', Icon: Moon, iconClass: 'text-text-muted' }
}
