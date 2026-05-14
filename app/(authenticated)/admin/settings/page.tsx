'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    announcement: 'Welcome to Lucky Streak Casino!',
    maintenanceMode: false,
    dailyRewardAmount: 100,
    dailyRewardMultiplier: 1.5,
    maxBetLimit: 10000,
    minBetLimit: 1,
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value,
    })
    setSaved(false)
  }

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log('Settings saved:', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Site Settings</h1>
        <p className="text-muted-foreground">Manage global site configuration</p>
      </div>

      <div className="bg-secondary p-6 rounded-lg border border-accent/20 space-y-6">
        {/* Announcement Banner */}
        <div className="space-y-2">
          <label className="block text-foreground font-semibold">Announcement Banner</label>
          <textarea
            value={settings.announcement}
            onChange={(e) => handleChange('announcement', e.target.value)}
            className="w-full px-3 py-2 bg-background rounded text-foreground placeholder-muted-foreground h-24"
            placeholder="Site-wide announcement message"
          />
          <p className="text-xs text-muted-foreground">This message will be displayed to all users on the home page</p>
        </div>

        {/* Maintenance Mode */}
        <div className="flex items-center justify-between py-3 border-t border-accent/20">
          <div>
            <label className="text-foreground font-semibold block">Maintenance Mode</label>
            <p className="text-xs text-muted-foreground">Disable access to games during maintenance</p>
          </div>
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
            className="w-5 h-5 rounded cursor-pointer"
          />
        </div>

        {/* Daily Reward Settings */}
        <div className="space-y-4 py-3 border-t border-accent/20">
          <h3 className="text-foreground font-semibold">Daily Reward Configuration</h3>
          
          <div>
            <label className="block text-sm text-foreground mb-2">Base Daily Reward</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={settings.dailyRewardAmount}
                onChange={(e) => handleChange('dailyRewardAmount', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 bg-background rounded text-foreground"
              />
              <span className="text-accent text-sm">chips</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground mb-2">Streak Multiplier</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                value={settings.dailyRewardMultiplier}
                onChange={(e) => handleChange('dailyRewardMultiplier', parseFloat(e.target.value))}
                className="flex-1 px-3 py-2 bg-background rounded text-foreground"
              />
              <span className="text-accent text-sm">x per day</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Day 1: {settings.dailyRewardAmount}, Day 2: {Math.floor(settings.dailyRewardAmount * settings.dailyRewardMultiplier)}, etc.
            </p>
          </div>
        </div>

        {/* Betting Limits */}
        <div className="space-y-4 py-3 border-t border-accent/20">
          <h3 className="text-foreground font-semibold">Betting Limits</h3>
          
          <div>
            <label className="block text-sm text-foreground mb-2">Minimum Bet</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={settings.minBetLimit}
                onChange={(e) => handleChange('minBetLimit', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 bg-background rounded text-foreground"
              />
              <span className="text-accent text-sm">chips</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground mb-2">Maximum Bet</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={settings.maxBetLimit}
                onChange={(e) => handleChange('maxBetLimit', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 bg-background rounded text-foreground"
              />
              <span className="text-accent text-sm">chips</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-accent/20">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-accent text-black px-6 py-2 rounded-lg hover:bg-accent/90 transition font-semibold"
          >
            <Save size={20} />
            Save Settings
          </button>
          {saved && (
            <div className="flex items-center text-green-400 text-sm">
              ✓ Settings saved successfully
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
