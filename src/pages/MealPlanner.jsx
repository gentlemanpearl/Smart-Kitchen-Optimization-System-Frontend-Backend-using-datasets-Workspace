import { useState, useEffect } from "react"
import { fetchMealPlans, createMealPlan, deleteMealPlan, fetchRecipes } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

export default function MealPlanner() {
  const [mealPlans, setMealPlans] = useState([])
  const [availableRecipes, setAvailableRecipes] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedMealType, setSelectedMealType] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [useBackend, setUseBackend] = useState(true)
  const { toast } = useToast()

  // Load meal plans and recipes from backend
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        if (useBackend) {
          // Fetch meal plans from backend
          const plans = await fetchMealPlans()
          setMealPlans(plans.map(plan => ({
            id: plan._id || plan.id,
            day: plan.day,
            mealType: plan.mealType,
            recipeName: plan.recipeName,
            notes: plan.notes || ''
          })))
          
          // Fetch recipes from backend for dropdown
          const recipesData = await fetchRecipes({ limit: 100 })
          const recipeNames = recipesData.recipes?.map(r => r.name) || []
          setAvailableRecipes(recipeNames.length > 0 ? recipeNames : [
            'Butter Chicken', 'Vegetable Biryani', 'Paneer Tikka Masala', 'Dal Tadka',
            'Chicken Curry', 'Aloo Gobi', 'Fish Curry', 'Rajma', 'Chole Bhature',
            'Masala Dosa', 'Idli Sambar', 'Poha', 'Upma', 'Paratha'
          ])
          
          // Also save to localStorage as backup
          localStorage.setItem('mealPlans', JSON.stringify(plans))
        } else {
          // Fallback to localStorage
          const savedMealPlans = localStorage.getItem('mealPlans')
          if (savedMealPlans) {
            setMealPlans(JSON.parse(savedMealPlans))
          }
          setAvailableRecipes([
            'Butter Chicken', 'Vegetable Biryani', 'Paneer Tikka Masala', 'Dal Tadka',
            'Chicken Curry', 'Aloo Gobi', 'Fish Curry', 'Rajma', 'Chole Bhature',
            'Masala Dosa', 'Idli Sambar', 'Poha', 'Upma', 'Paratha'
          ])
        }
      } catch (error) {
        console.error('Error loading meal plans:', error)
        // Fallback to localStorage
        setUseBackend(false)
        const savedMealPlans = localStorage.getItem('mealPlans')
        if (savedMealPlans) {
          setMealPlans(JSON.parse(savedMealPlans))
        }
        setAvailableRecipes([
          'Butter Chicken', 'Vegetable Biryani', 'Paneer Tikka Masala', 'Dal Tadka',
          'Chicken Curry', 'Aloo Gobi', 'Fish Curry', 'Rajma', 'Chole Bhature',
          'Masala Dosa', 'Idli Sambar', 'Poha', 'Upma', 'Paratha'
        ])
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [useBackend])

  const handleAddMeal = async () => {
    if (!selectedDay || !selectedMealType || !selectedRecipe) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      if (useBackend) {
        const mealPlanData = {
          day: selectedDay,
          mealType: selectedMealType,
          recipeName: selectedRecipe,
          notes: notes || '',
          servings: 4
        }
        const savedMealPlan = await createMealPlan(mealPlanData)
        const newMealPlan = {
          id: savedMealPlan._id || savedMealPlan.id,
          day: savedMealPlan.day,
          mealType: savedMealPlan.mealType,
          recipeName: savedMealPlan.recipeName,
          notes: savedMealPlan.notes || ''
        }
        setMealPlans(prev => [...prev, newMealPlan])
        localStorage.setItem('mealPlans', JSON.stringify([...mealPlans, newMealPlan]))
      } else {
        const newMealPlan = {
          id: Date.now().toString(),
          day: selectedDay,
          mealType: selectedMealType,
          recipeName: selectedRecipe,
          notes
        }
        setMealPlans(prev => [...prev, newMealPlan])
        localStorage.setItem('mealPlans', JSON.stringify([...mealPlans, newMealPlan]))
      }
      
      // Reset form
      setSelectedDay("")
      setSelectedMealType("")
      setSelectedRecipe("")
      setNotes("")
      setIsAddDialogOpen(false)

      toast({
        title: "Meal Added",
        description: `${selectedRecipe} added to ${selectedDay} ${selectedMealType}.`
      })
    } catch (error) {
      console.error('Error adding meal plan:', error)
      // Fallback to localStorage
      const newMealPlan = {
        id: Date.now().toString(),
        day: selectedDay,
        mealType: selectedMealType,
        recipeName: selectedRecipe,
        notes
      }
      setMealPlans(prev => [...prev, newMealPlan])
      localStorage.setItem('mealPlans', JSON.stringify([...mealPlans, newMealPlan]))
      setSelectedDay("")
      setSelectedMealType("")
      setSelectedRecipe("")
      setNotes("")
      setIsAddDialogOpen(false)
      toast({
        title: "Meal Added",
        description: `${selectedRecipe} added to ${selectedDay} ${selectedMealType}.`
      })
    }
  }

  const handleDeleteMeal = async (id) => {
    try {
      if (useBackend) {
        await deleteMealPlan(id)
      }
      const newMealPlans = mealPlans.filter(meal => meal.id !== id)
      setMealPlans(newMealPlans)
      localStorage.setItem('mealPlans', JSON.stringify(newMealPlans))
      toast({
        title: "Meal Removed",
        description: "Meal has been removed from your plan."
      })
    } catch (error) {
      console.error('Error deleting meal plan:', error)
      // Fallback to localStorage
      const newMealPlans = mealPlans.filter(meal => meal.id !== id)
      setMealPlans(newMealPlans)
      localStorage.setItem('mealPlans', JSON.stringify(newMealPlans))
      toast({
        title: "Meal Removed",
        description: "Meal has been removed from your plan."
      })
    }
  }

  const getMealsForDay = (day) => {
    return mealPlans.filter(meal => meal.day === day)
  }

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'lunch': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'dinner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'snack': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading meal plans...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="animate-slide-up">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight gradient-text">
            Meal Planner
          </h1>
          <p className="text-muted-foreground mt-1">Plan your weekly meals intelligently</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Meal to Plan</DialogTitle>
              <DialogDescription>
                Add a meal to your weekly meal plan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="day">Day</Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="mealType">Meal Type</Label>
                <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="recipe">Recipe</Label>
                <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRecipes.map(recipe => (
                      <SelectItem key={recipe} value={recipe}>{recipe}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special notes..."
                />
              </div>
              
              <Button onClick={handleAddMeal} className="w-full">
                Add Meal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayMeals = getMealsForDay(day)
          const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
          return (
            <Card 
              key={day} 
              className={`card-hover animate-bounce-in ${isToday ? 'ring-2 ring-primary bg-gradient-to-br from-primary/5 to-primary/10' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isToday ? 'text-primary' : ''}`}>
                  <div className={`p-1 rounded-lg ${isToday ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Calendar className="h-4 w-4" />
                  </div>
                  {day}
                  {isToday && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
                  )}
                </CardTitle>
                <CardDescription>
                  {dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''} planned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dayMeals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No meals planned
                    </p>
                  ) : (
                    dayMeals.map((meal, mealIndex) => (
                      <div 
                        key={meal.id} 
                        className="p-3 border rounded-lg space-y-2 hover-scale bg-gradient-to-r from-background to-muted/30 animate-slide-up"
                        style={{ animationDelay: `${mealIndex * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <Badge className={`${getMealTypeColor(meal.mealType)} hover:scale-105 transition-transform`}>
                            {meal.mealType}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-medium text-sm">{meal.recipeName}</p>
                        {meal.notes && (
                          <p className="text-xs text-muted-foreground italic">{meal.notes}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

