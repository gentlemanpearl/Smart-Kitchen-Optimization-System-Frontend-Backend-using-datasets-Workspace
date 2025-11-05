import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings as SettingsIcon, Bell, Eye, Palette, Database, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    lowStockThreshold: [10],
    expiryWarningDays: [3],
    autoDeleteExpired: false,
    currency: "INR",
    language: "en",
    dataBackup: true,
    animationsEnabled: true
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    toast({
      title: "Setting Updated",
      description: `${key} has been updated successfully.`
    })
  }

  const resetToDefaults = () => {
    setSettings({
      notifications: true,
      darkMode: false,
      lowStockThreshold: [10],
      expiryWarningDays: [3],
      autoDeleteExpired: false,
      currency: "INR",
      language: "en",
      dataBackup: true,
      animationsEnabled: true
    })
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values."
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="animate-slide-up">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight gradient-text mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground">Customize your Smart Kitchen experience</p>
      </div>

      <div className="grid gap-6">
        {/* Notifications Settings */}
        <Card className="card-hover animate-bounce-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-primary/20">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for low stock and expiring items
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label>Low Stock Alert Threshold</Label>
              <div className="px-3">
                <Slider
                  value={settings.lowStockThreshold}
                  onValueChange={(value) => handleSettingChange('lowStockThreshold', value)}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 item</span>
                  <Badge variant="outline">{settings.lowStockThreshold[0]} items</Badge>
                  <span>50 items</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Expiry Warning (Days Before)</Label>
              <div className="px-3">
                <Slider
                  value={settings.expiryWarningDays}
                  onValueChange={(value) => handleSettingChange('expiryWarningDays', value)}
                  max={14}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 day</span>
                  <Badge variant="outline">{settings.expiryWarningDays[0]} days</Badge>
                  <span>14 days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="card-hover animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-accent/20">
                <Palette className="h-4 w-4 text-purple-600" />
              </div>
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on/off smooth animations and transitions
                </p>
              </div>
              <Switch
                id="animations"
                checked={settings.animationsEnabled}
                onCheckedChange={(checked) => handleSettingChange('animationsEnabled', checked)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage Settings */}
        <Card className="card-hover animate-bounce-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              Data & Storage
            </CardTitle>
            <CardDescription>
              Manage your data and storage preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoDelete">Auto-delete Expired Items</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically remove expired items from inventory
                </p>
              </div>
              <Switch
                id="autoDelete"
                checked={settings.autoDeleteExpired}
                onCheckedChange={(checked) => handleSettingChange('autoDeleteExpired', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dataBackup">Auto Data Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Regularly backup your data to prevent loss
                </p>
              </div>
              <Switch
                id="dataBackup"
                checked={settings.dataBackup}
                onCheckedChange={(checked) => handleSettingChange('dataBackup', checked)}
              />
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1 hover-scale">
                <Database className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" className="flex-1 hover-scale">
                <Eye className="mr-2 h-4 w-4" />
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="card-hover animate-bounce-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Zap className="h-4 w-4 text-yellow-600" />
              </div>
              Advanced
            </CardTitle>
            <CardDescription>
              Advanced configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="flex-1 hover-scale"
                onClick={resetToDefaults}
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button variant="outline" className="flex-1 hover-scale">
                <Database className="mr-2 h-4 w-4" />
                Import Settings
              </Button>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
              <h4 className="font-medium mb-2">Debug Information</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Version: 1.0.0</p>
                <p>Storage Used: 2.3 MB</p>
                <p>Last Backup: 2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

