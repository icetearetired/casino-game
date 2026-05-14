'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
}

const INITIAL_ITEMS: ShopItem[] = [
  { id: '1', name: 'Basic Chip Pack', description: '1,000 chips', price: 4.99, category: 'chips', image: '💰' },
  { id: '2', name: 'Premium Chip Pack', description: '5,000 chips', price: 19.99, category: 'chips', image: '💎' },
  { id: '3', name: 'Gold Avatar', description: 'Exclusive avatar frame', price: 9.99, category: 'cosmetics', image: '👑' },
  { id: '4', name: 'Luxury Table Theme', description: 'Premium table design', price: 14.99, category: 'cosmetics', image: '🎰' },
]

export default function ShopManagementPage() {
  const [items, setItems] = useState<ShopItem[]>(INITIAL_ITEMS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ShopItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState<Partial<ShopItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'chips',
  })

  const handleEdit = (item: ShopItem) => {
    setEditingId(item.id)
    setEditForm({ ...item })
  }

  const handleSaveEdit = (id: string) => {
    if (editForm && editForm.id === id) {
      setItems(items.map(item => item.id === id ? editForm : item))
      setEditingId(null)
      setEditForm(null)
    }
  }

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleAddItem = () => {
    if (newItem.name && newItem.price !== undefined) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          name: newItem.name,
          description: newItem.description || '',
          price: newItem.price,
          category: newItem.category || 'chips',
          image: newItem.image || '📦',
        }
      ])
      setNewItem({ name: '', description: '', price: 0, category: 'chips' })
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shop Management</h1>
          <p className="text-muted-foreground">Manage in-game items and prices</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-accent text-black px-4 py-2 rounded-lg hover:bg-accent/90 transition font-semibold"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {showAddForm && (
        <div className="bg-secondary p-6 rounded-lg border border-accent/30 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Add New Item</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.name || ''}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded text-foreground placeholder-muted-foreground"
            />
            <input
              type="text"
              placeholder="Description"
              value={newItem.description || ''}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded text-foreground placeholder-muted-foreground"
            />
            <select
              value={newItem.category || 'chips'}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded text-foreground"
            >
              <option value="chips">Chips</option>
              <option value="cosmetics">Cosmetics</option>
              <option value="boosters">Boosters</option>
            </select>
            <input
              type="number"
              placeholder="Price"
              value={newItem.price || ''}
              onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-background rounded text-foreground placeholder-muted-foreground"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="flex-1 bg-accent text-black py-2 rounded hover:bg-accent/90 transition font-semibold"
              >
                Add Item
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewItem({ name: '', description: '', price: 0, category: 'chips' })
                }}
                className="flex-1 bg-secondary border border-accent/30 text-foreground py-2 rounded hover:bg-secondary/80 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-secondary p-4 rounded-lg border border-accent/20">
            {editingId === item.id && editForm ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background rounded text-foreground"
                />
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-background rounded text-foreground"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent text-black py-1 rounded hover:bg-accent/90 transition text-sm font-semibold"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditForm(null)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-secondary border border-accent/30 text-foreground py-1 rounded hover:bg-secondary/80 transition text-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">{item.image}</div>
                <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-accent font-bold text-lg">${item.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded hover:bg-accent/20 transition text-accent"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded hover:bg-red-500/20 transition text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
