"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Upload, Eye, Code, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { Pokemon } from "@/types/pokemon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DuplicateGroup from "@/components/duplicate-group"

export default function Home() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([])
  const [fileName, setFileName] = useState<string>("")
  const [viewMode, setViewMode] = useState<"json" | "visual">("visual")
  const [duplicates, setDuplicates] = useState<{ [key: string]: Pokemon[] }>({})
  const [duplicateDetectionMode, setDuplicateDetectionMode] = useState<"strict" | "loose">("strict")

  const detectDuplicates = (pokemons: Pokemon[], mode: "strict" | "loose" = "strict") => {
    const duplicateGroups: { [key: string]: Pokemon[] } = {}

    pokemons.forEach((pokemon, index) => {
      let key: string

      if (mode === "strict") {
        // Strict mode: same individual_id or exact same stats + name + level
        if (pokemon.individual_id) {
          key = pokemon.individual_id
        } else {
          key = `${pokemon.name}-${pokemon.level}-${pokemon.stats.hp}-${pokemon.stats.atk}-${pokemon.stats.def}-${pokemon.stats.spa}-${pokemon.stats.spd}-${pokemon.stats.spe}`
        }
      } else {
        // Loose mode: same name + level
        key = `${pokemon.name}-${pokemon.level}`
      }

      if (!duplicateGroups[key]) {
        duplicateGroups[key] = []
      }
      duplicateGroups[key].push({ ...pokemon, originalIndex: index } as Pokemon & { originalIndex: number })
    })

    // Filter out groups with only one Pokemon (not duplicates)
    const actualDuplicates: { [key: string]: Pokemon[] } = {}
    Object.entries(duplicateGroups).forEach(([key, group]) => {
      if (group.length > 1) {
        actualDuplicates[key] = group
      }
    })

    return actualDuplicates
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        // Handle both array and single object formats
        const pokemons = Array.isArray(json) ? json : [json]
        setPokemonList(pokemons)

        // Detect duplicates
        const foundDuplicates = detectDuplicates(pokemons, duplicateDetectionMode)
        setDuplicates(foundDuplicates)
      } catch (error) {
        console.error("Error parsing JSON:", error)
        alert("Invalid JSON file. Please upload a valid Pokemon JSON file.")
      }
    }
    reader.readAsText(file)
  }

  const handleRemovePokemon = (index: number) => {
    const updatedList = [...pokemonList]
    updatedList.splice(index, 1)
    setPokemonList(updatedList)
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(pokemonList, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileName = fileName || "pokemon.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileName)
    linkElement.click()
  }

  const handleRemoveDuplicates = (duplicateKey: string, indicesToRemove: number[]) => {
    const updatedList = pokemonList.filter((_, index) => !indicesToRemove.includes(index))
    setPokemonList(updatedList)

    // Re-detect duplicates after removal
    const foundDuplicates = detectDuplicates(updatedList, duplicateDetectionMode)
    setDuplicates(foundDuplicates)
  }

  const handleRemoveAllDuplicates = () => {
    const indicesToRemove: number[] = []

    Object.values(duplicates).forEach((group) => {
      // Keep the first Pokemon in each group, remove the rest
      group.slice(1).forEach((pokemon) => {
        const originalIndex = (pokemon as any).originalIndex
        if (originalIndex !== undefined) {
          indicesToRemove.push(originalIndex)
        }
      })
    })

    const updatedList = pokemonList.filter((_, index) => !indicesToRemove.includes(index))
    setPokemonList(updatedList)
    setDuplicates({})
  }

  // Get sprite URL based on Pokemon ID and shiny status
  const getPokemonSprite = (pokemon: Pokemon) => {
    const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"
    const shinyPath = pokemon.shiny ? "/shiny" : ""
    return `${baseUrl}${shinyPath}/${pokemon.id}.png`
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Pokemon JSON Editor</CardTitle>
          <CardDescription>Upload a JSON file, add Pokemon, and export the updated file</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload JSON</TabsTrigger>
              <TabsTrigger value="duplicates">
                Duplicates{" "}
                {Object.keys(duplicates).length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {Object.keys(duplicates).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="preview">Preview & Export</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="py-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="mb-4 text-muted-foreground">Upload your Pokemon JSON file</p>
                <Input type="file" accept=".json" onChange={handleFileUpload} className="max-w-sm" />
                {fileName && <p className="mt-4 text-sm">Uploaded: {fileName}</p>}
              </div>
            </TabsContent>

            <TabsContent value="duplicates" className="py-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Duplicate Pokemon Detection</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="detection-mode">Detection Mode:</Label>
                      <Select
                        value={duplicateDetectionMode}
                        onValueChange={(value: "strict" | "loose") => {
                          setDuplicateDetectionMode(value)
                          if (pokemonList.length > 0) {
                            const foundDuplicates = detectDuplicates(pokemonList, value)
                            setDuplicates(foundDuplicates)
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strict">Strict</SelectItem>
                          <SelectItem value="loose">Loose</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {Object.keys(duplicates).length > 0 && (
                      <Button onClick={handleRemoveAllDuplicates} variant="destructive">
                        Remove All Duplicates
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Strict mode:</strong> Detects Pokemon with identical individual_id or exact same stats +
                    name + level
                  </p>
                  <p>
                    <strong>Loose mode:</strong> Detects Pokemon with same name + level (regardless of stats)
                  </p>
                </div>

                <ScrollArea className="h-[500px] rounded-md border">
                  {Object.keys(duplicates).length > 0 ? (
                    <div className="p-4 space-y-6">
                      {Object.entries(duplicates).map(([key, group]) => (
                        <DuplicateGroup
                          key={key}
                          duplicateKey={key}
                          group={group}
                          onRemoveDuplicates={handleRemoveDuplicates}
                          getPokemonSprite={getPokemonSprite}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                      <p>No duplicates found</p>
                      <p className="text-sm">Upload a JSON file to check for duplicate Pokemon</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="py-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Pokemon List ({pokemonList.length})</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="view-mode"
                        checked={viewMode === "visual"}
                        onCheckedChange={(checked) => setViewMode(checked ? "visual" : "json")}
                      />
                      <Label htmlFor="view-mode">
                        {viewMode === "visual" ? (
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> Visual
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Code className="h-4 w-4" /> JSON
                          </div>
                        )}
                      </Label>
                    </div>
                    <Button onClick={handleExportJSON} disabled={pokemonList.length === 0}>
                      <Download className="mr-2 h-4 w-4" />
                      Export JSON
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[500px] rounded-md border">
                  {pokemonList.length > 0 ? (
                    viewMode === "json" ? (
                      <pre className="text-xs p-4">{JSON.stringify(pokemonList, null, 2)}</pre>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        {pokemonList.map((pokemon, index) => (
                          <Card key={pokemon.individual_id || index} className="overflow-hidden">
                            <div className="flex justify-between items-start p-4">
                              <div>
                                <h3 className="font-bold text-lg">
                                  {pokemon.nickname ? `${pokemon.nickname} (${pokemon.name})` : pokemon.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  #{String(pokemon.id).padStart(3, "0")} • Level {pokemon.level}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemovePokemon(index)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>

                            <div className="flex flex-row">
                              <div className="w-1/3 bg-slate-50 flex items-center justify-center">
                                <img
                                  src={getPokemonSprite(pokemon) || "/placeholder.svg"}
                                  alt={pokemon.name}
                                  className="w-24 h-24 object-contain"
                                  onError={(e) => {
                                    // Fallback if sprite not found
                                    ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=96&width=96"
                                  }}
                                />
                              </div>
                              <div className="w-2/3 p-4">
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {pokemon.type.map((type) => (
                                    <Badge key={type} variant="outline">
                                      {type}
                                    </Badge>
                                  ))}
                                  {pokemon.shiny && (
                                    <Badge variant="secondary" className="ml-1">
                                      Shiny
                                    </Badge>
                                  )}
                                  {pokemon.mega && (
                                    <Badge variant="secondary" className="ml-1">
                                      Mega
                                    </Badge>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                  <div>
                                    <span className="font-medium">HP:</span> {pokemon.stats.hp}
                                  </div>
                                  <div>
                                    <span className="font-medium">ATK:</span> {pokemon.stats.atk}
                                  </div>
                                  <div>
                                    <span className="font-medium">DEF:</span> {pokemon.stats.def}
                                  </div>
                                  <div>
                                    <span className="font-medium">SP.A:</span> {pokemon.stats.spa}
                                  </div>
                                  <div>
                                    <span className="font-medium">SP.D:</span> {pokemon.stats.spd}
                                  </div>
                                  <div>
                                    <span className="font-medium">SPE:</span> {pokemon.stats.spe}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <CardFooter className="flex flex-col items-start bg-slate-50 px-4 py-2">
                              <div className="w-full">
                                <p className="text-sm font-medium mb-1">Moves:</p>
                                <div className="flex flex-wrap gap-1">
                                  {pokemon.attacks.map((attack) => (
                                    <Badge key={attack} variant="outline" className="bg-white">
                                      {attack}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                      <p>No Pokemon added yet</p>
                      <p className="text-sm">Upload a JSON file or add Pokemon manually</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
