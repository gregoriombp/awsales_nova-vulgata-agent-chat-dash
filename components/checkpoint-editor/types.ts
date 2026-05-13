export type AbilityCategory = "agent" | "flow" | "context" | "aops" | "integration"

export type Ability = {
  id: string
  label: string
  trigger: string
  description: string
  category: AbilityCategory
  group?: string
  icon?: string
  accent?: string
}

export type AbilityGroup = {
  id: AbilityCategory | string
  title: string
  description: string
  icon?: string
  items: Ability[]
  collapsible?: boolean
}

export type CheckpointVariable = {
  id: string
  name: string
  description?: string
}

export type FollowUp = {
  id: string
  name: string
  hint?: string
}
