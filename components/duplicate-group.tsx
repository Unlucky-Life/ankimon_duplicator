"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, AlertTriangle } from "lucide-react"
import type { Pokemon } from "@/types/pokemon"

interface DuplicateGroupProps {
  duplicateKey: string
  group: (Pokemon & { originalIndex?: number })[]
  onRemoveDuplicates: (duplicateKey: string, indicesToRemove: number[]) => void
  getPokemonSprite: (pokemon: Pokemon) => string
}

export default function DuplicateGroup({
  duplicateKey,
  group,
  onRemoveDuplicates,
  getPokemonSprite,
}: DuplicateGroupProps) {
  const [selectedForRemoval, setSelectedForRemoval] = useState<number[]>([])

  const handleToggleSelection = (originalIndex: number) => {
    if (selectedForRemoval.includes(originalIndex)) {
      setSelectedForRemoval(selectedForRemoval.filter((index) => index !== originalIndex))
    } else {
      setSelectedForRemoval([...selectedForRemoval, originalIndex])
    }
  }

  const handleRemoveSelected = () => {
    if (selectedForRemoval.length === group.length) {
      alert("You cannot remove all Pokemon in a duplicate group. At least one must remain.")
      return
    }

    if (selectedForRemoval.length > 0) {
      onRemoveDuplicates(duplicateKey, selectedForRemoval)
      setSelectedForRemoval([])
    }
  }

  const handleKeepFirst = () => {
    const indicesToRemove = group
      .slice(1)
      .map((pokemon) => pokemon.originalIndex)
      .filter((index) => index !== undefined) as number[]
    onRemoveDuplicates(duplicateKey, indicesToRemove)
  }

  const handleKeepLast = () => {
    const indicesToRemove = group
      .slice(0, -1)
      .map((pokemon) => pokemon.originalIndex)
      .filter((index) => index !== undefined) as number[]
    onRemoveDuplicates(duplicateKey, indicesToRemove)
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Duplicate Group ({group.length} Pokemon)
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleKeepFirst} variant="outline" size="sm">
              Keep First
            </Button>
            <Button onClick={handleKeepLast} variant="outline" size="sm">
              Keep Last
            </Button>
            <Button
              onClick={handleRemoveSelected}
              variant="destructive"
              size="sm"
              disabled={selectedForRemoval.length === 0 || selectedForRemoval.length === group.length}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove Selected ({selectedForRemoval.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {group.map((pokemon, index) => (
            <Card
              key={`${pokemon.individual_id || pokemon.name}-${index}`}
              className={`relative ${selectedForRemoval.includes(pokemon.originalIndex || -1) ? "ring-2 ring-red-500 bg-red-50" : "bg-white"}`}
            >
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedForRemoval.includes(pokemon.originalIndex || -1)}
                  onCheckedChange={() => handleToggleSelection(pokemon.originalIndex || -1)}
                />
              </div>

              <div className="flex justify-between items-start p-4 pt-8">
                <div>
                  <h3 className="font-bold text-lg">
                    {pokemon.nickname ? `${pokemon.nickname} (${pokemon.name})` : pokemon.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    #{String(pokemon.id).padStart(3, "0")} • Level {pokemon.level}
                  </p>
                  {pokemon.individual_id && (
                    <p className="text-xs text-muted-foreground">ID: {pokemon.individual_id.slice(0, 8)}...</p>
                  )}
                </div>
              </div>

              <div className="flex flex-row">
                <div className="w-1/3 bg-slate-50 flex items-center justify-center">
                  <img
                    src={getPokemonSprite(pokemon) || "/placeholder.svg"}
                    alt={pokemon.name}
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
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

                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Moves:</p>
                    <div className="flex flex-wrap gap-1">
                      {pokemon.attacks.slice(0, 2).map((attack) => (
                        <Badge key={attack} variant="outline" className="bg-white text-xs">
                          {attack}
                        </Badge>
                      ))}
                      {pokemon.attacks.length > 2 && (
                        <Badge variant="outline" className="bg-white text-xs">
                          +{pokemon.attacks.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Tip:</strong> Select the Pokemon you want to remove by checking the boxes, then click "Remove
            Selected". You can also use "Keep First" or "Keep Last" for quick actions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
