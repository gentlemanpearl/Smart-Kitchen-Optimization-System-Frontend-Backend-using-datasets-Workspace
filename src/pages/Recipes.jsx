import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Users, ChefHat, Star, Loader2, AlertCircle } from "lucide-react"
import { fetchRecipes, fetchCategories, getImageUrl, checkBackendHealth } from "@/lib/api"

export default function Recipes() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [recipes, setRecipes] = useState([])
  const [categories, setCategories] = useState(["all"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backendOnline, setBackendOnline] = useState(false)

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then(online => {
      setBackendOnline(online)
      if (!online) {
        setError("Backend server is not running. Please start the backend server.")
        setLoading(false)
      }
    })
  }, [])

  // Fetch categories
  useEffect(() => {
    if (backendOnline) {
      fetchCategories()
        .then(cats => {
          setCategories(["all", ...cats])
        })
        .catch(err => {
          console.error("Error fetching categories:", err)
        })
    }
  }, [backendOnline])

  // Fetch recipes
  useEffect(() => {
    if (!backendOnline) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const searchTimeout = setTimeout(() => {
      fetchRecipes({
        search: searchTerm,
        category: selectedCategory,
        limit: 100
      })
        .then(data => {
          // Transform backend data to frontend format
          const transformedRecipes = data.recipes.map(recipe => {
            // Extract category from cuisine_path
            const category = recipe.cuisinePath
              ? recipe.cuisinePath.split('/').filter(p => p)[0] || 'Uncategorized'
              : 'Uncategorized'
            
            // Parse ingredients to create tags
            const ingredientsList = recipe.ingredients
              ? recipe.ingredients.split(',').slice(0, 5).map(i => i.trim())
              : []
            
            // Determine difficulty based on prep time
            const totalTime = recipe.totalTime || `${recipe.prepTime + recipe.cookTime} mins`
            let difficulty = "Easy"
            if (recipe.prepTime + recipe.cookTime > 60) difficulty = "Medium"
            if (recipe.prepTime + recipe.cookTime > 90) difficulty = "Hard"

            return {
              id: recipe.id,
              name: recipe.name,
              category: category,
              servings: recipe.servings || 4,
              prepTime: recipe.prepTime || 0,
              cookTime: recipe.cookTime || 0,
              totalTime: recipe.totalTime,
              difficulty: difficulty,
              tags: ingredientsList,
              description: recipe.directions 
                ? recipe.directions.substring(0, 150) + (recipe.directions.length > 150 ? '...' : '')
                : 'No description available',
              ingredients: recipe.ingredients,
              directions: recipe.directions,
              rating: recipe.rating,
              url: recipe.url,
              imgSrc: recipe.imgSrc,
              canMake: false // TODO: Check against inventory
            }
          })
          setRecipes(transformedRecipes)
          setLoading(false)
        })
        .catch(err => {
          console.error("Error fetching recipes:", err)
          setError("Failed to load recipes. Please try again later.")
          setLoading(false)
        })
    }, searchTerm ? 500 : 0) // Debounce search

    return () => clearTimeout(searchTimeout)
  }, [searchTerm, selectedCategory, backendOnline])

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading recipes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Error</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                {!backendOnline && (
                  <p className="text-xs text-muted-foreground mt-2">
                    To start the backend: <code className="bg-muted px-1 rounded">cd backend && npm start</code>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Recipe Browser</h1>
        <p className="text-muted-foreground">
          Browse recipes and see what you can make with your current inventory.
          {recipes.length > 0 && (
            <span className="ml-2 text-sm">({recipes.length} recipes available)</span>
          )}
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes by name or ingredients..."
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
        {filteredRecipes.map((recipe) => {
          const imageUrl = getImageUrl(recipe.imgSrc)
          
          return (
            <Card 
              key={recipe.id} 
              className={`shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                recipe.canMake ? 'ring-2 ring-success/20' : ''
              }`}
            >
              {imageUrl && (
                <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={imageUrl} 
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
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
                  {recipe.rating > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {recipe.rating.toFixed(1)}
                      </div>
                    </>
                  )}
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
                      <span>{recipe.prepTime + recipe.cookTime || recipe.totalTime || 'N/A'} mins</span>
                    </div>
                    <Badge className={getDifficultyColor(recipe.difficulty)}>
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </div>
                
                {recipe.tags.length > 0 && (
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
                )}
                
                <Button 
                  className="w-full bg-gradient-primary hover:shadow-glow"
                  disabled={!recipe.canMake}
                  onClick={() => {
                    if (recipe.url) {
                      window.open(recipe.url, '_blank')
                    }
                  }}
                >
                  <ChefHat className="h-4 w-4 mr-2" />
                  {recipe.canMake ? "View Recipe" : "Missing Ingredients"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRecipes.length === 0 && !loading && (
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
