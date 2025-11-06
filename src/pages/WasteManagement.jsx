import { useState, useEffect } from "react"
import { fetchWastePrediction, fetchWasteRecords, createWasteRecord, deleteWasteRecord, fetchWasteStats } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, AlertTriangle, Recycle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

const WASTE_CATEGORIES = [
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'meat', label: 'Meat' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'grain', label: 'Grain' },
  { value: 'other', label: 'Other' }
]

const WASTE_REASONS = [
  { value: 'expired', label: 'Expired' },
  { value: 'spoiled', label: 'Spoiled' },
  { value: 'overcooked', label: 'Overcooked' },
  { value: 'leftover', label: 'Leftover' },
  { value: 'other', label: 'Other' }
]

const UNITS = [
  'g', 'kg', 'ml', 'l', 'pieces', 'cups', 'tbsp', 'tsp'
]

export default function WasteManagement() {
  const [wasteItems, setWasteItems] = useState([])
  const [predictedWaste, setPredictedWaste] = useState([])
  const [wasteStats, setWasteStats] = useState({
    totalWastedItems: 0,
    totalCost: 0,
    thisMonth: 0
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [useBackend, setUseBackend] = useState(true)
  const { toast } = useToast()

  // Load waste data from backend
  useEffect(() => {
    const loadWasteData = async () => {
      try {
        setLoading(true)
        
        if (useBackend) {
          // Fetch waste records and stats from backend
          const [recordsData, predictions, stats] = await Promise.all([
            fetchWasteRecords(),
            fetchWastePrediction(),
            fetchWasteStats()
          ])
          
          // Format waste records
          const records = recordsData.records || recordsData || []
          setWasteItems(records.map(record => ({
            id: record._id || record.id,
            itemName: record.itemName,
            category: record.category,
            quantity: record.quantity,
            unit: record.unit,
            reason: record.reason,
            dateWasted: record.dateWasted || record.dateWasted,
            estimatedCost: record.estimatedCost || 0,
            notes: record.notes || ''
          })))
          
          // Set stats
          if (recordsData.stats) {
            setWasteStats(recordsData.stats)
          } else {
            setWasteStats({
              totalWastedItems: stats.totalWastedItems || records.length,
              totalCost: stats.totalCost || records.reduce((sum, r) => sum + (r.estimatedCost || 0), 0),
              thisMonth: stats.thisMonthCount || records.filter(r => {
                const recordDate = new Date(r.dateWasted);
                const now = new Date();
                return recordDate.getMonth() === now.getMonth() && 
                       recordDate.getFullYear() === now.getFullYear();
              }).length
            })
          }
          
          setPredictedWaste(predictions || [])
          
          // Also save to localStorage as backup
          localStorage.setItem('wasteItems', JSON.stringify(records))
        } else {
          // Fallback to localStorage
          const savedWasteItems = localStorage.getItem('wasteItems')
          if (savedWasteItems) {
            const items = JSON.parse(savedWasteItems)
            setWasteItems(items)
            setWasteStats({
              totalWastedItems: items.length,
              totalCost: items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0),
              thisMonth: items.filter(item => {
                const recordDate = new Date(item.dateWasted);
                const now = new Date();
                return recordDate.getMonth() === now.getMonth() && 
                       recordDate.getFullYear() === now.getFullYear();
              }).length
            })
          }
        }
      } catch (error) {
        console.error('Error loading waste data:', error)
        // Fallback to localStorage
        setUseBackend(false)
        const savedWasteItems = localStorage.getItem('wasteItems')
        if (savedWasteItems) {
          const items = JSON.parse(savedWasteItems)
          setWasteItems(items)
          setWasteStats({
            totalWastedItems: items.length,
            totalCost: items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0),
            thisMonth: items.filter(item => {
              const recordDate = new Date(item.dateWasted);
              const now = new Date();
              return recordDate.getMonth() === now.getMonth() && 
                     recordDate.getFullYear() === now.getFullYear();
            }).length
          })
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadWasteData()
  }, [useBackend])

  // Form state
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    quantity: "",
    unit: "",
    reason: "",
    dateWasted: format(new Date(), 'yyyy-MM-dd'),
    estimatedCost: "",
    notes: ""
  })

  // Load waste items from localStorage
  useEffect(() => {
    const savedWasteItems = localStorage.getItem('wasteItems')
    if (savedWasteItems) {
      setWasteItems(JSON.parse(savedWasteItems))
    }
  }, [])

  // Save waste items to localStorage
  useEffect(() => {
    localStorage.setItem('wasteItems', JSON.stringify(wasteItems))
  }, [wasteItems])

  const handleAddWasteItem = async () => {
    if (!formData.itemName || !formData.category || !formData.quantity || !formData.unit || !formData.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      if (useBackend) {
        const wasteRecordData = {
          itemName: formData.itemName,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          reason: formData.reason,
          dateWasted: formData.dateWasted,
          estimatedCost: parseFloat(formData.estimatedCost) || 0,
          notes: formData.notes || ''
        }
        const savedRecord = await createWasteRecord(wasteRecordData)
        const newWasteItem = {
          id: savedRecord._id || savedRecord.id,
          itemName: savedRecord.itemName,
          category: savedRecord.category,
          quantity: savedRecord.quantity,
          unit: savedRecord.unit,
          reason: savedRecord.reason,
          dateWasted: savedRecord.dateWasted,
          estimatedCost: savedRecord.estimatedCost || 0,
          notes: savedRecord.notes || ''
        }
        setWasteItems(prev => [...prev, newWasteItem])
        localStorage.setItem('wasteItems', JSON.stringify([...wasteItems, newWasteItem]))
        
        // Update stats
        setWasteStats(prev => ({
          totalWastedItems: prev.totalWastedItems + 1,
          totalCost: prev.totalCost + (newWasteItem.estimatedCost || 0),
          thisMonth: new Date(newWasteItem.dateWasted).getMonth() === new Date().getMonth() ? prev.thisMonth + 1 : prev.thisMonth
        }))
      } else {
        const newWasteItem = {
          id: Date.now().toString(),
          itemName: formData.itemName,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          reason: formData.reason,
          dateWasted: formData.dateWasted,
          estimatedCost: parseFloat(formData.estimatedCost) || 0,
          notes: formData.notes
        }
        setWasteItems(prev => [...prev, newWasteItem])
        localStorage.setItem('wasteItems', JSON.stringify([...wasteItems, newWasteItem]))
        
        // Update stats
        setWasteStats(prev => ({
          totalWastedItems: prev.totalWastedItems + 1,
          totalCost: prev.totalCost + (newWasteItem.estimatedCost || 0),
          thisMonth: new Date(newWasteItem.dateWasted).getMonth() === new Date().getMonth() ? prev.thisMonth + 1 : prev.thisMonth
        }))
      }
      
      // Reset form
      setFormData({
        itemName: "",
        category: "",
        quantity: "",
        unit: "",
        reason: "",
        dateWasted: format(new Date(), 'yyyy-MM-dd'),
        estimatedCost: "",
        notes: ""
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Waste Item Added",
        description: `${formData.itemName} has been recorded as waste.`
      })
    } catch (error) {
      console.error('Error adding waste record:', error)
      // Fallback to localStorage
      const newWasteItem = {
        id: Date.now().toString(),
        itemName: formData.itemName,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        reason: formData.reason,
        dateWasted: formData.dateWasted,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        notes: formData.notes
      }
      setWasteItems(prev => [...prev, newWasteItem])
      localStorage.setItem('wasteItems', JSON.stringify([...wasteItems, newWasteItem]))
      setFormData({
        itemName: "",
        category: "",
        quantity: "",
        unit: "",
        reason: "",
        dateWasted: format(new Date(), 'yyyy-MM-dd'),
        estimatedCost: "",
        notes: ""
      })
      setIsAddDialogOpen(false)
      toast({
        title: "Waste Item Added",
        description: `${formData.itemName} has been recorded as waste.`
      })
    }
  }

  const handleDeleteWasteItem = async (id) => {
    try {
      if (useBackend) {
        await deleteWasteRecord(id)
      }
      const itemToDelete = wasteItems.find(item => item.id === id)
      const newWasteItems = wasteItems.filter(item => item.id !== id)
      setWasteItems(newWasteItems)
      localStorage.setItem('wasteItems', JSON.stringify(newWasteItems))
      
      // Update stats
      if (itemToDelete) {
        setWasteStats(prev => ({
          totalWastedItems: prev.totalWastedItems - 1,
          totalCost: prev.totalCost - (itemToDelete.estimatedCost || 0),
          thisMonth: new Date(itemToDelete.dateWasted).getMonth() === new Date().getMonth() ? prev.thisMonth - 1 : prev.thisMonth
        }))
      }
      
      toast({
        title: "Item Removed",
        description: "Waste item has been removed from records."
      })
    } catch (error) {
      console.error('Error deleting waste record:', error)
      // Fallback to localStorage
      const itemToDelete = wasteItems.find(item => item.id === id)
      const newWasteItems = wasteItems.filter(item => item.id !== id)
      setWasteItems(newWasteItems)
      localStorage.setItem('wasteItems', JSON.stringify(newWasteItems))
      
      if (itemToDelete) {
        setWasteStats(prev => ({
          totalWastedItems: prev.totalWastedItems - 1,
          totalCost: prev.totalCost - (itemToDelete.estimatedCost || 0),
          thisMonth: new Date(itemToDelete.dateWasted).getMonth() === new Date().getMonth() ? prev.thisMonth - 1 : prev.thisMonth
        }))
      }
      
      toast({
        title: "Item Removed",
        description: "Waste item has been removed from records."
      })
    }
  }

  const filteredWasteItems = wasteItems.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalWastedCost = wasteStats.totalCost || wasteItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
  const totalWastedItems = wasteStats.totalWastedItems || wasteItems.length

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading waste data...</div>
        </div>
      </div>
    )
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'vegetable': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'fruit': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'meat': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'dairy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'grain': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'spoiled': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'overcooked': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'leftover': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="animate-slide-up">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight gradient-text">
            Waste Management
          </h1>
          <p className="text-muted-foreground mt-1">Track and reduce food waste intelligently</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Waste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Waste Item</DialogTitle>
              <DialogDescription>
                Track wasted food items to help reduce future waste.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                  placeholder="e.g., Tomatoes"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {WASTE_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {WASTE_REASONS.map(reason => (
                      <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateWasted">Date Wasted</Label>
                  <Input
                    id="dateWasted"
                    type="date"
                    value={formData.dateWasted}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateWasted: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cost">Est. Cost (₹)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>
              
              <Button onClick={handleAddWasteItem} className="w-full">
                Record Waste Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="card-hover animate-bounce-in bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Total Wasted Items</CardTitle>
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-800 dark:text-red-300">{totalWastedItems}</div>
            <div className="w-full bg-red-200 dark:bg-red-900/50 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((totalWastedItems / 50) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover animate-bounce-in bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">Total Cost Wasted</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Trash2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800 dark:text-orange-300">₹{totalWastedCost.toFixed(2)}</div>
            <div className="w-full bg-orange-200 dark:bg-orange-900/50 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((totalWastedCost / 1000) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover animate-bounce-in bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">This Month</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Recycle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800 dark:text-green-300">
              {wasteStats.thisMonth || wasteItems.filter(item => 
                new Date(item.dateWasted).getMonth() === new Date().getMonth()
              ).length}
            </div>
            <div className="w-full bg-green-200 dark:bg-green-900/50 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((wasteItems.filter(item => new Date(item.dateWasted).getMonth() === new Date().getMonth()).length / 20) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waste Prediction Section */}
      {predictedWaste.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              AI Waste Prediction
            </CardTitle>
            <CardDescription>
              Items at risk of being wasted based on usage patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictedWaste.map((item) => (
                <div key={item._id || item.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.category} • {item.currentQuantity} {item.unit}
                      </div>
                    </div>
                    <Badge className={
                      item.wasteRisk === 'high' ? 'bg-red-500' :
                      item.wasteRisk === 'medium' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }>
                      {item.wasteRisk} risk
                    </Badge>
                  </div>
                  {item.reasons && item.reasons.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <ul className="list-disc list-inside">
                        {item.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Usage: {item.usagePercentage}% of threshold
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search waste items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Waste Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waste Records</CardTitle>
          <CardDescription>
            Track your food waste to identify patterns and reduce future waste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredWasteItems.length === 0 ? (
            <div className="text-center py-8">
              <Recycle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No waste items found matching your search." : "No waste items recorded yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWasteItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.itemName}</div>
                          {item.notes && (
                            <div className="text-sm text-muted-foreground">{item.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>
                        <Badge className={getReasonColor(item.reason)}>
                          {item.reason}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(item.dateWasted), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>₹{item.estimatedCost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWasteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

