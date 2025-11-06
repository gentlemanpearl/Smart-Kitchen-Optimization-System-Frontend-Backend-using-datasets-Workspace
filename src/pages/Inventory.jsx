import { useState, useEffect } from "react"
import { fetchInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [useBackend, setUseBackend] = useState(true)

  // Load inventory from backend or localStorage
  useEffect(() => {
    const loadInventory = async () => {
      setLoading(true)
      try {
        if (useBackend) {
          const backendItems = await fetchInventoryItems()
          // Convert backend format to frontend format
          const formattedItems = backendItems.map(item => ({
            id: item._id || item.id,
            name: item.name,
            category: item.category,
            quantity: item.currentQuantity || item.quantity,
            unit: item.unit,
            threshold: item.threshold,
            perishable: item.perishable || false
          }))
          setItems(formattedItems)
          // Also save to localStorage as backup
          localStorage.setItem('kitchenInventory', JSON.stringify(formattedItems))
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('kitchenInventory')
          if (saved) {
            setItems(JSON.parse(saved))
          } else {
            // Default items
            setItems([
              { id: "1", name: "Yeast", category: "Other", quantity: 20, unit: "g", threshold: 25 },
              { id: "2", name: "Baking Soda", category: "Other", quantity: 50, unit: "g", threshold: 60 },
              { id: "3", name: "Cashew Nuts", category: "Other", quantity: 100, unit: "g", threshold: 20 },
              { id: "4", name: "Capsicum", category: "Vegetables", quantity: 4, unit: "pieces", threshold: 8 },
              { id: "5", name: "Cauliflower", category: "Vegetables", quantity: 2, unit: "pieces", threshold: 1 },
              { id: "6", name: "Mushrooms", category: "Vegetables", quantity: 300, unit: "g", threshold: 100 },
            ])
          }
        }
      } catch (error) {
        console.error('Error loading inventory:', error)
        // Fallback to localStorage
        setUseBackend(false)
        const saved = localStorage.getItem('kitchenInventory')
        if (saved) {
          setItems(JSON.parse(saved))
        }
      } finally {
        setLoading(false)
      }
    }

    loadInventory()
  }, [useBackend])

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    threshold: 0
  })

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddItem = async () => {
    if (newItem.name && newItem.category && newItem.unit) {
      try {
        if (useBackend) {
          const itemData = {
            name: newItem.name,
            category: newItem.category,
            currentQuantity: newItem.quantity,
            unit: newItem.unit,
            threshold: newItem.threshold,
            perishable: newItem.perishable || false
          }
          const savedItem = await createInventoryItem(itemData)
          const formattedItem = {
            id: savedItem._id || savedItem.id,
            name: savedItem.name,
            category: savedItem.category,
            quantity: savedItem.currentQuantity || savedItem.quantity,
            unit: savedItem.unit,
            threshold: savedItem.threshold,
            perishable: savedItem.perishable || false
          }
          setItems(prev => [...prev, formattedItem])
          localStorage.setItem('kitchenInventory', JSON.stringify([...items, formattedItem]))
        } else {
          const item = {
            id: Date.now().toString(),
            ...newItem
          }
          const newItems = [...items, item]
          setItems(newItems)
          localStorage.setItem('kitchenInventory', JSON.stringify(newItems))
        }
        window.dispatchEvent(new CustomEvent('inventoryUpdated'))
        setNewItem({ name: "", category: "", quantity: 0, unit: "", threshold: 0 })
        setIsAddDialogOpen(false)
      } catch (error) {
        console.error('Error adding item:', error)
        // Fallback to localStorage
        const item = {
          id: Date.now().toString(),
          ...newItem
        }
        const newItems = [...items, item]
        setItems(newItems)
        localStorage.setItem('kitchenInventory', JSON.stringify(newItems))
        setNewItem({ name: "", category: "", quantity: 0, unit: "", threshold: 0 })
        setIsAddDialogOpen(false)
      }
    }
  }

  const handleDeleteItem = async (id) => {
    try {
      if (useBackend) {
        await deleteInventoryItem(id)
      }
      const newItems = items.filter(item => item.id !== id)
      setItems(newItems)
      localStorage.setItem('kitchenInventory', JSON.stringify(newItems))
      window.dispatchEvent(new CustomEvent('inventoryUpdated'))
    } catch (error) {
      console.error('Error deleting item:', error)
      // Fallback to localStorage
      const newItems = items.filter(item => item.id !== id)
      setItems(newItems)
      localStorage.setItem('kitchenInventory', JSON.stringify(newItems))
      window.dispatchEvent(new CustomEvent('inventoryUpdated'))
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      "Vegetables": "bg-success text-success-foreground",
      "Other": "bg-muted text-muted-foreground",
      "Dairy": "bg-info text-info-foreground",
      "Spices": "bg-warning text-warning-foreground"
    }
    return colors[category] || "bg-muted text-muted-foreground"
  }

  const isLowStock = (item) => (item.quantity || item.currentQuantity || 0) <= (item.threshold || 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading inventory...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your kitchen inventory. Add, edit, or remove items as needed.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Spices">Spices</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="cups">Cups</SelectItem>
                      <SelectItem value="ml">Milliliters (ml)</SelectItem>
                      <SelectItem value="l">Liters (l)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="threshold">Low Stock Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newItem.threshold}
                  onChange={(e) => setNewItem({ ...newItem, threshold: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <Button onClick={handleAddItem} className="w-full bg-gradient-primary">
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Inventory Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.threshold}</TableCell>
                  <TableCell>
                    {isLowStock(item) ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="outline" className="text-success border-success">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="hover:bg-muted">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteItem(item.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

