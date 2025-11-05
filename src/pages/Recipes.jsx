import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Users, ChefHat, Star } from "lucide-react"

export default function Recipes() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const recipes = [
    {
      id: "1",
      name: "Masala Chai",
      category: "Beverage",
      servings: 2,
      prepTime: 15,
      difficulty: "Easy",
      tags: ["beverage", "breakfast", "aromatic", "comforting"],
      description: "Traditional Indian spiced tea with aromatic spices and milk",
      canMake: true
    },
    {
      id: "2", 
      name: "Kadai Paneer",
      category: "Main Course",
      servings: 4,
      prepTime: 45,
      difficulty: "Medium",
      tags: ["restaurant style", "spicy", "creamy", "punjabi"],
      description: "Cottage cheese cooked with bell peppers in a spicy tomato gravy",
      canMake: false
    },
    {
      id: "3",
      name: "Naan",
      category: "Bread",
      servings: 4,
      prepTime: 60,
      difficulty: "Medium", 
      tags: ["leavened", "soft", "tandoori", "restaurant style"],
      description: "Soft and fluffy Indian bread perfect with curries",
      canMake: true
    },
    {
      id: "4",
      name: "Mushroom Do Pyaza", 
      category: "Main Course",
      servings: 4,
      prepTime: 40,
      difficulty: "Easy",
      tags: ["mushroom", "oniony", "creamy", "quick"],
      description: "Mushrooms cooked with double onions in a rich gravy",
      canMake: false
    },
    {
      id: "5",
      name: "Chole Bhature",
      category: "Main Course", 
      servings: 4,
      prepTime: 90,
      difficulty: "Medium",
      tags: ["street food", "punjabi", "spicy", "festive"],
      description: "Spicy chickpea curry served with deep-fried bread",
      canMake: false
    },
    {
      id: "6",
      name: "Masala Dosa",
      category: "Breakfast",
      servings: 4,
      prepTime: 120,
      difficulty: "Medium",
      tags: ["breakfast", "fermented", "crispy", "south indian"],
      description: "Crispy fermented crepe filled with spiced potato filling",
      canMake: true
    }
  ]

  const categories = ["all", ...new Set(recipes.map(r => r.category))]

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty) => {
    const colors = {
      "Easy": "bg-success text-success-foreground",
      "Medium": "bg-warning text-warning-foreground", 
      "Hard": "bg-destructive text-destructive-foreground"
    }
    return colors[difficulty] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Recipe Browser</h1>
        <p className="text-muted-foreground">Browse recipes and see what you can make with your current inventory.</p>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes by name or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-gradient-primary" : ""}
                >
                  {category === "all" ? "All Categories" : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card 
            key={recipe.id} 
            className={`shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              recipe.canMake ? 'ring-2 ring-success/20' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg">{recipe.name}</CardTitle>
                {recipe.canMake && (
                  <Badge className="bg-success text-success-foreground">
                    Can Make
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{recipe.category}</Badge>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {recipe.servings}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recipe.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{recipe.prepTime} mins</span>
                  </div>
                  <Badge className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {recipe.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {recipe.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{recipe.tags.length - 3}
                  </Badge>
                )}
              </div>
              
              <Button 
                className="w-full bg-gradient-primary hover:shadow-glow"
                disabled={!recipe.canMake}
              >
                <ChefHat className="h-4 w-4 mr-2" />
                {recipe.canMake ? "View Recipe" : "Missing Ingredients"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

