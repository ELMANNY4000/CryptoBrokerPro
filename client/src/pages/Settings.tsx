import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(true);
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });
  
  const handleSaveChanges = () => {
    toast({
      title: "Settings Updated",
      description: "Your settings have been saved successfully.",
    });
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Settings</h2>
      
      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={user?.username} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wallet-address">Wallet Address</Label>
                <Input id="wallet-address" defaultValue={user?.walletAddress} disabled />
                <p className="text-xs text-neutral-300 mt-1">
                  This is your paper trading wallet address and cannot be changed.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => 
                toast({
                  title: "Password Updated",
                  description: "Your password has been updated successfully.",
                })
              }>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how CryptoTrader looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-neutral-300">
                    Use dark theme for the interface
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Theme Color</Label>
                <div className="flex space-x-2">
                  {['#3861FB', '#00C087', '#F7931A', '#627EEA', '#FF4D4F'].map((color) => (
                    <button 
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                        color === '#3861FB' ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => 
                        toast({
                          title: "Theme Updated",
                          description: "Your theme color has been updated.",
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges}>Save Preferences</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Trading Preferences</CardTitle>
              <CardDescription>
                Set your default trading options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="confirm-trades">Trade Confirmation</Label>
                  <p className="text-sm text-neutral-300">
                    Show confirmation dialog before executing trades
                  </p>
                </div>
                <Switch id="confirm-trades" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="default-chart">Default to Advanced Charts</Label>
                  <p className="text-sm text-neutral-300">
                    Use technical analysis charts by default
                  </p>
                </div>
                <Switch id="default-chart" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-currency">Default Currency</Label>
                <select 
                  id="default-currency"
                  className="w-full bg-neutral-400 border border-neutral-300 text-white rounded p-2"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="price-alerts">Price Alerts</Label>
                  <p className="text-sm text-neutral-300">
                    Receive notifications for price movements
                  </p>
                </div>
                <Switch id="price-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="trade-notifications">Trade Notifications</Label>
                  <p className="text-sm text-neutral-300">
                    Receive notifications for completed trades
                  </p>
                </div>
                <Switch id="trade-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mining-notifications">Mining Notifications</Label>
                  <p className="text-sm text-neutral-300">
                    Receive notifications for mining rewards
                  </p>
                </div>
                <Switch id="mining-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-neutral-300">
                    Receive important updates via email
                  </p>
                </div>
                <Switch id="email-notifications" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges}>Save Notification Settings</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Price Alert Configuration</CardTitle>
              <CardDescription>
                Set custom price alerts for cryptocurrencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-coin">Cryptocurrency</Label>
                    <select 
                      id="alert-coin"
                      className="w-full bg-neutral-400 border border-neutral-300 text-white rounded p-2"
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="BNB">Binance Coin (BNB)</option>
                      <option value="ADA">Cardano (ADA)</option>
                      <option value="XRP">Ripple (XRP)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-condition">Condition</Label>
                    <select 
                      id="alert-condition"
                      className="w-full bg-neutral-400 border border-neutral-300 text-white rounded p-2"
                    >
                      <option value="above">Price Above</option>
                      <option value="below">Price Below</option>
                      <option value="percent-increase">Percent Increase</option>
                      <option value="percent-decrease">Percent Decrease</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-value">Value</Label>
                    <Input 
                      id="alert-value"
                      type="number"
                      placeholder="e.g., 30000"
                      className="bg-neutral-400 border-neutral-300"
                    />
                  </div>
                </div>
                
                <Button className="w-full" onClick={() => 
                  toast({
                    title: "Alert Created",
                    description: "Your price alert has been set successfully.",
                  })
                }>
                  Add Price Alert
                </Button>
                
                <div className="mt-4">
                  <Label>Your Price Alerts</Label>
                  <div className="text-center py-4 text-sm text-neutral-300">
                    No price alerts configured yet
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
