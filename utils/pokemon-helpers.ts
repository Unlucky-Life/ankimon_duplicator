// Helper functions for Pokemon data

export function getPokemonIdFromNumber(id: number): string {
  // Convert number to 3-digit string with leading zeros
  return id.toString().padStart(3, "0")
}

export function getPokemonNumberFromId(id: string): number {
  // Convert string ID to number, removing leading zeros
  return Number.parseInt(id, 10)
}

export function sortPokemonNames(pokemonNames: Record<string, string>): [string, string][] {
  // Convert object to array of [id, name] pairs and sort by ID
  return Object.entries(pokemonNames).sort((a, b) => {
    return Number.parseInt(a[0], 10) - Number.parseInt(b[0], 10)
  })
}
