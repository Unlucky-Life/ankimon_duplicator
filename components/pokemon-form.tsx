"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Loader2 } from "lucide-react"
import type { Pokemon, PokemonStats } from "@/types/pokemon"
import { getPokemonNumberFromId, sortPokemonNames } from "@/utils/pokemon-helpers"
import { Badge } from "@/components/ui/badge"

interface PokemonFormProps {
  onAddPokemon: (pokemon: Pokemon) => void
}

interface MoveWithLevel {
  name: string
  level: number
  method: string
}

const POKEMON_TYPES = [
  "Normal",
  "Fire",
  "Water",
  "Electric",
  "Grass",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
]

const POKEMON_ABILITIES = [
  "Blaze",
  "Overgrow",
  "Torrent",
  "Static",
  "Intimidate",
  "Synchronize",
  "Chlorophyll",
  "Swift Swim",
  "Sand Stream",
  "Pressure",
  "Levitate",
]

const GROWTH_RATES = ["slow", "medium-slow", "medium", "medium-fast", "fast", "fluctuating", "erratic"]

export default function PokemonForm({ onAddPokemon }: PokemonFormProps) {
  const [pokemonNames, setPokemonNames] = useState<Record<string, string>>({})
  const [selectedPokemonId, setSelectedPokemonId] = useState<string>("")
  const [name, setName] = useState("")
  const [nickname, setNickname] = useState("")
  const [level, setLevel] = useState(1)
  const [gender, setGender] = useState("M")
  const [id, setId] = useState(1)
  const [ability, setAbility] = useState("Blaze")
  const [types, setTypes] = useState<string[]>(["Fire"])
  const [stats, setStats] = useState<PokemonStats>({
    hp: 50,
    atk: 50,
    def: 50,
    spa: 50,
    spd: 50,
    spe: 50,
    xp: 0,
  })
  const [ev, setEv] = useState<Omit<PokemonStats, "xp">>({
    hp: 0,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0,
  })
  const [iv, setIv] = useState<Omit<PokemonStats, "xp">>({
    hp: Math.floor(Math.random() * 32),
    atk: Math.floor(Math.random() * 32),
    def: Math.floor(Math.random() * 32),
    spa: Math.floor(Math.random() * 32),
    spd: Math.floor(Math.random() * 32),
    spe: Math.floor(Math.random() * 32),
  })
  const [attacks, setAttacks] = useState<string[]>(["tackle", "ember"])
  const [baseExperience, setBaseExperience] = useState(100)
  const [currentHp, setCurrentHp] = useState(50)
  const [growthRate, setGrowthRate] = useState("medium")
  const [friendship, setFriendship] = useState(0)
  const [pokemonDefeated, setPokemonDefeated] = useState(0)
  const [everstone, setEverstone] = useState(false)
  const [shiny, setShiny] = useState(false)
  const [mega, setMega] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availableAbilities, setAvailableAbilities] = useState<string[]>(POKEMON_ABILITIES)
  const [availableMoves, setAvailableMoves] = useState<MoveWithLevel[]>([])

  // Include Pokemon names data directly in the component
  useEffect(() => {
    // This is a hardcoded subset of Pokemon for demonstration
    // In a production app, you might want to split this into a separate file
    setPokemonNames({
      "001": "Bulbasaur",
      "002": "Ivysaur",
      "003": "Venusaur",
      "004": "Charmander",
      "005": "Charmeleon",
      "006": "Charizard",
      "007": "Squirtle",
      "008": "Wartortle",
      "009": "Blastoise",
      "025": "Pikachu",
      "026": "Raichu",
      "150": "Mewtwo",
      "151": "Mew",
      "152": "Chikorita",
      "155": "Cyndaquil",
      "158": "Totodile",
      "172": "Pichu",
      "196": "Espeon",
      "197": "Umbreon",
      "249": "Lugia",
      "250": "Ho-Oh",
      "251": "Celebi",
      "252": "Treecko",
      "255": "Torchic",
      "258": "Mudkip",
      "384": "Rayquaza",
      "493": "Arceus",
    })
  }, [])

  // Fetch Pokemon data from PokeAPI
  const fetchPokemonData = async (pokemonId: number) => {
    setIsLoading(true)
    try {
      // Fetch basic Pokemon data
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
      const pokemonData = await response.json()

      // Fetch species data for growth rate and base happiness (friendship)
      const speciesResponse = await fetch(pokemonData.species.url)
      const speciesData = await speciesResponse.json()

      // Extract types
      const pokemonTypes = pokemonData.types.map(
        (typeInfo: any) => typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1),
      )

      // Extract abilities
      const pokemonAbilities = pokemonData.abilities.map(
        (abilityInfo: any) =>
          abilityInfo.ability.name.charAt(0).toUpperCase() + abilityInfo.ability.name.slice(1).replace(/-/g, " "),
      )

      // Extract stats
      const pokemonStats: PokemonStats = {
        hp: pokemonData.stats.find((stat: any) => stat.stat.name === "hp")?.base_stat || 50,
        atk: pokemonData.stats.find((stat: any) => stat.stat.name === "attack")?.base_stat || 50,
        def: pokemonData.stats.find((stat: any) => stat.stat.name === "defense")?.base_stat || 50,
        spa: pokemonData.stats.find((stat: any) => stat.stat.name === "special-attack")?.base_stat || 50,
        spd: pokemonData.stats.find((stat: any) => stat.stat.name === "special-defense")?.base_stat || 50,
        spe: pokemonData.stats.find((stat: any) => stat.stat.name === "speed")?.base_stat || 50,
        xp: 0,
      }

      // Extract growth rate
      const growthRateFromAPI = speciesData.growth_rate.name

      // Extract base happiness (friendship)
      const baseFriendship = speciesData.base_happiness

      // Extract base experience
      const baseExp = pokemonData.base_experience || 100

      // Update form with fetched data
      setTypes(pokemonTypes.slice(0, 2)) // Max 2 types
      setAvailableAbilities(pokemonAbilities)
      if (pokemonAbilities.length > 0) {
        setAbility(pokemonAbilities[0])
      }
      setStats(pokemonStats)
      setCurrentHp(pokemonStats.hp)
      setGrowthRate(growthRateFromAPI)
      setFriendship(baseFriendship)
      setBaseExperience(baseExp)

      // Get moves for the Pokemon with level information
      const movesWithLevels: MoveWithLevel[] = []

      // Process each move to extract level and method information
      pokemonData.moves.forEach((moveInfo: any) => {
        const moveName = moveInfo.move.name.replace(/-/g, " ")
        const formattedName = moveName.charAt(0).toUpperCase() + moveName.slice(1)

        // Find the most recent game version's move learning method
        // We'll prioritize level-up moves from the most recent games
        const versionDetails = moveInfo.version_group_details.sort((a: any, b: any) => {
          // Sort by version group order (higher is more recent)
          return b.version_group.url.split("/")[6] - a.version_group.url.split("/")[6]
        })

        if (versionDetails.length > 0) {
          const latestVersion = versionDetails[0]
          const method = latestVersion.move_learn_method.name
          const level = latestVersion.level_learned_at

          movesWithLevels.push({
            name: formattedName,
            level: level,
            method: method,
          })
        }
      })

      // Sort moves: first by level-up (ascending), then by other methods
      movesWithLevels.sort((a, b) => {
        // First, prioritize level-up moves
        if (a.method === "level-up" && b.method !== "level-up") return -1
        if (a.method !== "level-up" && b.method === "level-up") return 1

        // For level-up moves, sort by level
        if (a.method === "level-up" && b.method === "level-up") {
          return a.level - b.level
        }

        // For non-level-up moves, sort alphabetically by method then name
        if (a.method !== b.method) return a.method.localeCompare(b.method)
        return a.name.localeCompare(b.name)
      })

      setAvailableMoves(movesWithLevels)

      // Set default moves (up to 4 level-appropriate moves)
      const levelUpMoves = movesWithLevels.filter((move) => move.method === "level-up" && move.level <= level).slice(-4) // Take the 4 highest level moves that are <= current level

      if (levelUpMoves.length > 0) {
        setAttacks(levelUpMoves.map((move) => move.name))
      } else if (movesWithLevels.length > 0) {
        // Fallback to any moves if no level-appropriate moves
        setAttacks(movesWithLevels.slice(0, 4).map((move) => move.name))
      }
    } catch (error) {
      console.error("Error fetching Pokemon data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update name and ID when a Pokemon is selected from the dropdown
  const handlePokemonSelect = (pokemonId: string) => {
    setSelectedPokemonId(pokemonId)
    setName(pokemonNames[pokemonId] || "")
    const numericId = getPokemonNumberFromId(pokemonId)
    setId(numericId)

    // Randomize IVs when a new Pokemon is selected
    setIv({
      hp: Math.floor(Math.random() * 32),
      atk: Math.floor(Math.random() * 32),
      def: Math.floor(Math.random() * 32),
      spa: Math.floor(Math.random() * 32),
      spd: Math.floor(Math.random() * 32),
      spe: Math.floor(Math.random() * 32),
    })

    // Fetch additional data from PokeAPI
    fetchPokemonData(numericId)
  }

  // Update moves when level changes to suggest level-appropriate moves
  useEffect(() => {
    if (availableMoves.length > 0) {
      const levelUpMoves = availableMoves.filter((move) => move.method === "level-up" && move.level <= level).slice(-4) // Take the 4 highest level moves that are <= current level

      if (levelUpMoves.length > 0) {
        setAttacks(levelUpMoves.map((move) => move.name))
      }
    }
  }, [level, availableMoves])

  const handleAddPokemon = () => {
    const currentDate = new Date().toISOString().replace("T", " ").substring(0, 19)

    const newPokemon: Pokemon = {
      name,
      nickname,
      level,
      gender,
      id,
      ability,
      type: types,
      stats,
      ev,
      iv,
      attacks,
      base_experience: baseExperience,
      current_hp: currentHp,
      growth_rate: growthRate,
      friendship,
      pokemon_defeated: pokemonDefeated,
      everstone,
      shiny,
      captured_date: currentDate,
      individual_id: uuidv4(),
      mega,
      "special-form": null,
      evos: [],
    }

    onAddPokemon(newPokemon)

    // Reset form or show success message
    alert("Pokemon added successfully!")
  }

  const handleStatChange = (stat: keyof PokemonStats, value: number) => {
    setStats({
      ...stats,
      [stat]: value,
    })
  }

  const handleEvChange = (stat: keyof Omit<PokemonStats, "xp">, value: number) => {
    setEv({
      ...ev,
      [stat]: value,
    })
  }

  const handleIvChange = (stat: keyof Omit<PokemonStats, "xp">, value: number) => {
    setIv({
      ...iv,
      [stat]: value,
    })
  }

  const handleTypeChange = (type: string) => {
    if (types.includes(type)) {
      setTypes(types.filter((t) => t !== type))
    } else {
      if (types.length < 2) {
        setTypes([...types, type])
      }
    }
  }

  const handleAttackChange = (attack: string) => {
    if (attacks.includes(attack)) {
      setAttacks(attacks.filter((a) => a !== attack))
    } else {
      if (attacks.length < 4) {
        setAttacks([...attacks, attack])
      }
    }
  }

  // Sort Pokemon names for the dropdown
  const sortedPokemonNames = sortPokemonNames(pokemonNames)

  // Get move label with level information
  const getMoveLabel = (move: MoveWithLevel) => {
    if (move.method === "level-up") {
      return `${move.name} (Lv. ${move.level})`
    } else if (move.method === "machine") {
      return `${move.name} (TM/HM)`
    } else if (move.method === "egg") {
      return `${move.name} (Egg)`
    } else if (move.method === "tutor") {
      return `${move.name} (Tutor)`
    } else {
      return `${move.name} (${move.method})`
    }
  }

  // Group moves by method for better organization
  const groupedMoves = availableMoves.reduce((groups: Record<string, MoveWithLevel[]>, move) => {
    const group = move.method
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(move)
    return groups
  }, {})

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pokemon-select">Select Pokemon</Label>
              <Select value={selectedPokemonId} onValueChange={handlePokemonSelect} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Choose a Pokemon"} />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[300px]">
                    {sortedPokemonNames.map(([id, name]) => (
                      <SelectItem key={id} value={id}>
                        #{id} - {name}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Fetching Pokemon data...</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Pokemon Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Typhlosion"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname (Optional)</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Blaze"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level (1-100)</Label>
                <Input
                  id="level"
                  type="number"
                  min={1}
                  max={100}
                  value={level}
                  onChange={(e) => setLevel(Number.parseInt(e.target.value))}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id">Pokedex ID</Label>
                <Input
                  id="id"
                  type="number"
                  min={1}
                  value={id}
                  onChange={(e) => setId(Number.parseInt(e.target.value))}
                  readOnly={!!selectedPokemonId || isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="N">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ability">Ability</Label>
                <Select value={ability} onValueChange={setAbility} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAbilities.map((ability) => (
                      <SelectItem key={ability} value={ability}>
                        {ability}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type (Max 2)</Label>
              <div className="grid grid-cols-3 gap-2">
                {POKEMON_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={types.includes(type)}
                      onCheckedChange={() => handleTypeChange(type)}
                      disabled={(!types.includes(type) && types.length >= 2) || isLoading}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="stats">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="ev">EV</TabsTrigger>
                <TabsTrigger value="iv">IV</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="hp">HP</Label>
                  <Input
                    id="hp"
                    type="number"
                    min={1}
                    max={255}
                    value={stats.hp}
                    onChange={(e) => handleStatChange("hp", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="atk">Attack</Label>
                  <Input
                    id="atk"
                    type="number"
                    min={1}
                    max={255}
                    value={stats.atk}
                    onChange={(e) => handleStatChange("atk", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="def">Defense</Label>
                  <Input
                    id="def"
                    type="number"
                    min={1}
                    max={255}
                    value={stats.def}
                    onChange={(e) => handleStatChange("def", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spa">Sp. Attack</Label>
                  <Input
                    id="spa"
                    type="number"
                    min={1}
                    max={255}
                    value={stats.spa}
                    onChange={(e) => handleStatChange("spa", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spd">Sp. Defense</Label>
                  <Input
                    id="spd"
                    type="number"
                    min={1}
                    max={255}
                    value={stats.spd}
                    onChange={(e) => handleStatChange("spd", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spe">Speed</Label>
                  <Input
                    id="spe"
                    type="number"
                    min={1}
                    max={255}
                    value={stats.spe}
                    onChange={(e) => handleStatChange("spe", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp">Experience</Label>
                  <Input
                    id="xp"
                    type="number"
                    min={0}
                    value={stats.xp}
                    onChange={(e) => handleStatChange("xp", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ev" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="ev-hp">HP EV</Label>
                  <Input
                    id="ev-hp"
                    type="number"
                    min={0}
                    max={255}
                    value={ev.hp}
                    onChange={(e) => handleEvChange("hp", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-atk">Attack EV</Label>
                  <Input
                    id="ev-atk"
                    type="number"
                    min={0}
                    max={255}
                    value={ev.atk}
                    onChange={(e) => handleEvChange("atk", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-def">Defense EV</Label>
                  <Input
                    id="ev-def"
                    type="number"
                    min={0}
                    max={255}
                    value={ev.def}
                    onChange={(e) => handleEvChange("def", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-spa">Sp. Attack EV</Label>
                  <Input
                    id="ev-spa"
                    type="number"
                    min={0}
                    max={255}
                    value={ev.spa}
                    onChange={(e) => handleEvChange("spa", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-spd">Sp. Defense EV</Label>
                  <Input
                    id="ev-spd"
                    type="number"
                    min={0}
                    max={255}
                    value={ev.spd}
                    onChange={(e) => handleEvChange("spd", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-spe">Speed EV</Label>
                  <Input
                    id="ev-spe"
                    type="number"
                    min={0}
                    max={255}
                    value={ev.spe}
                    onChange={(e) => handleEvChange("spe", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
              </TabsContent>

              <TabsContent value="iv" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="iv-hp">HP IV (0-31)</Label>
                  <Input
                    id="iv-hp"
                    type="number"
                    min={0}
                    max={31}
                    value={iv.hp}
                    onChange={(e) => handleIvChange("hp", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iv-atk">Attack IV (0-31)</Label>
                  <Input
                    id="iv-atk"
                    type="number"
                    min={0}
                    max={31}
                    value={iv.atk}
                    onChange={(e) => handleIvChange("atk", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iv-def">Defense IV (0-31)</Label>
                  <Input
                    id="iv-def"
                    type="number"
                    min={0}
                    max={31}
                    value={iv.def}
                    onChange={(e) => handleIvChange("def", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iv-spa">Sp. Attack IV (0-31)</Label>
                  <Input
                    id="iv-spa"
                    type="number"
                    min={0}
                    max={31}
                    value={iv.spa}
                    onChange={(e) => handleIvChange("spa", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iv-spd">Sp. Defense IV (0-31)</Label>
                  <Input
                    id="iv-spd"
                    type="number"
                    min={0}
                    max={31}
                    value={iv.spd}
                    onChange={(e) => handleIvChange("spd", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iv-spe">Speed IV (0-31)</Label>
                  <Input
                    id="iv-spe"
                    type="number"
                    min={0}
                    max={31}
                    value={iv.spe}
                    onChange={(e) => handleIvChange("spe", Number.parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Attacks (Max 4)</Label>
            <div className="h-[300px] overflow-y-auto border rounded-md p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableMoves.length > 0 ? (
                <div className="space-y-4">
                  {/* Level-up moves section */}
                  {groupedMoves["level-up"] && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Level-up Moves</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {groupedMoves["level-up"].map((move) => (
                          <div key={move.name} className="flex items-center space-x-2">
                            <Checkbox
                              id={`attack-${move.name}`}
                              checked={attacks.includes(move.name)}
                              onCheckedChange={() => handleAttackChange(move.name)}
                              disabled={(!attacks.includes(move.name) && attacks.length >= 4) || isLoading}
                            />
                            <label
                              htmlFor={`attack-${move.name}`}
                              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                                move.level > level ? "text-muted-foreground" : ""
                              }`}
                            >
                              {move.name}{" "}
                              <Badge variant="outline" className="ml-1">
                                Lv. {move.level}
                              </Badge>
                              {move.level > level && (
                                <span className="text-xs text-muted-foreground ml-1">(too high)</span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TM/HM moves section */}
                  {groupedMoves["machine"] && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">TM/HM Moves</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {groupedMoves["machine"].map((move) => (
                          <div key={move.name} className="flex items-center space-x-2">
                            <Checkbox
                              id={`attack-${move.name}`}
                              checked={attacks.includes(move.name)}
                              onCheckedChange={() => handleAttackChange(move.name)}
                              disabled={(!attacks.includes(move.name) && attacks.length >= 4) || isLoading}
                            />
                            <label
                              htmlFor={`attack-${move.name}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {move.name}{" "}
                              <Badge variant="outline" className="ml-1">
                                TM/HM
                              </Badge>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other move types */}
                  {Object.entries(groupedMoves)
                    .filter(([method]) => method !== "level-up" && method !== "machine")
                    .map(([method, moves]) => (
                      <div key={method} className="space-y-2">
                        <h4 className="font-medium text-sm capitalize">{method} Moves</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {moves.map((move) => (
                            <div key={move.name} className="flex items-center space-x-2">
                              <Checkbox
                                id={`attack-${move.name}`}
                                checked={attacks.includes(move.name)}
                                onCheckedChange={() => handleAttackChange(move.name)}
                                disabled={(!attacks.includes(move.name) && attacks.length >= 4) || isLoading}
                              />
                              <label
                                htmlFor={`attack-${move.name}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {move.name}{" "}
                                <Badge variant="outline" className="ml-1 capitalize">
                                  {method}
                                </Badge>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No moves available</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="base-exp">Base Experience</Label>
              <Input
                id="base-exp"
                type="number"
                min={1}
                value={baseExperience}
                onChange={(e) => setBaseExperience(Number.parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-hp">Current HP</Label>
              <Input
                id="current-hp"
                type="number"
                min={0}
                max={stats.hp}
                value={currentHp}
                onChange={(e) => setCurrentHp(Number.parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="growth-rate">Growth Rate</Label>
              <Select value={growthRate} onValueChange={setGrowthRate} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select growth rate" />
                </SelectTrigger>
                <SelectContent>
                  {GROWTH_RATES.map((rate) => (
                    <SelectItem key={rate} value={rate}>
                      {rate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="friendship">Friendship (0-255)</Label>
              <Input
                id="friendship"
                type="number"
                min={0}
                max={255}
                value={friendship}
                onChange={(e) => setFriendship(Number.parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defeated">Pokemon Defeated</Label>
              <Input
                id="defeated"
                type="number"
                min={0}
                value={pokemonDefeated}
                onChange={(e) => setPokemonDefeated(Number.parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="everstone"
                checked={everstone}
                onCheckedChange={(checked) => setEverstone(checked === true)}
                disabled={isLoading}
              />
              <label htmlFor="everstone" className="text-sm font-medium leading-none">
                Has Everstone
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="shiny"
                checked={shiny}
                onCheckedChange={(checked) => setShiny(checked === true)}
                disabled={isLoading}
              />
              <label htmlFor="shiny" className="text-sm font-medium leading-none">
                Is Shiny
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mega"
                checked={mega}
                onCheckedChange={(checked) => setMega(checked === true)}
                disabled={isLoading}
              />
              <label htmlFor="mega" className="text-sm font-medium leading-none">
                Is Mega Evolution
              </label>
            </div>
          </div>
        </div>

        <Button onClick={handleAddPokemon} className="w-full" disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pokemon to JSON
        </Button>
      </div>
    </ScrollArea>
  )
}
