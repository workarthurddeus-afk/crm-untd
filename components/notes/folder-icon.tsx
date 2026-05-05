import {
  Box,
  Folder,
  Handshake,
  Inbox,
  Lightbulb,
  MessageSquare,
  Star,
  Target,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  inbox: Inbox,
  target: Target,
  box: Box,
  handshake: Handshake,
  'message-square': MessageSquare,
  lightbulb: Lightbulb,
  star: Star,
  folder: Folder,
}

export function getFolderIcon(name?: string | null): LucideIcon {
  if (!name) return Folder
  return iconMap[name] ?? Folder
}
