export interface PokemonStats {
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
  xp: number
}

export interface PokemonBaseStats {
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
}

export interface Pokemon {
  name: string
  nickname: string
  level: number
  gender: string
  id: number
  ability: string
  type: string[]
  stats: PokemonStats
  ev: PokemonBaseStats
  iv: PokemonBaseStats
  attacks: string[]
  base_experience: number
  current_hp: number
  growth_rate: string
  friendship: number
  pokemon_defeated: number
  everstone: boolean
  shiny: boolean
  captured_date: string
  individual_id: string
  mega: boolean
  "special-form": null | string
  evos: string[]
}
