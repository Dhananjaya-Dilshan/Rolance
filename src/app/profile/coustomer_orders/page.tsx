// app/dashboard/orders/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import AuthProtection from '@/components/AuthProtection'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MODELS, FINISHES, MATERIALS } from '@/validators/option-validator'
import { formatPrice } from '@/lib/utils'
import Phone from '@/components/Phone'
import { ScrollArea } from '@/components/ui/scroll-area'

type Order = {
  id: string
  configuration: {
    color: string
    model: string
    material: string
    finish: string
    croppedImageUrl: string
    width: number
    height: number
  }
  customer: {
    username: string
  }
  status: string
  amount: number
}

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/customer/orders', { // Updated endpoint
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) throw new Error('Failed to fetch orders')
        
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <AuthProtection requiredRole="customer"> {/* Updated role */}
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map(order => (
              <div key={order.id} className="p-4 border rounded-lg bg-card shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Order ID: {order.id}</p>
                    <p className="text-muted-foreground">
                      Model: {MODELS.options.find(m => m.value === order.configuration.model)?.label}
                    </p>
                    <span className={`text-sm ${
                      order.status === 'shipped' ? 'text-green-600' : 
                      order.status === 'rejected' ? 'text-red-600' : 'text-primary'
                    }`}>
                      Status: {order.status}
                    </span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        View Details
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                      </DialogHeader>
                      
                      <ScrollArea className="h-[calc(80vh-100px)] pr-4">
                        <div className="grid grid-cols-1 gap-6">
                          {/* Phone Preview */}
                          <div className="flex justify-center">
                            <Phone
                              className="max-w-[120px]"
                              style={{ backgroundColor: order.configuration.color }}
                              imgSrc={order.configuration.croppedImageUrl!}
                              model={order.configuration.model}
                            />
                          </div>

                          {/* Order Details */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="font-medium">Order ID</p>
                                <p className="text-muted-foreground">
                                  {order.id}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Total Amount</p>
                                <p className="text-muted-foreground">
                                  {formatPrice(order.amount)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="font-medium">Case Specifications</p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Model</p>
                                  <p>
                                    {MODELS.options.find(m => m.value === order.configuration.model)?.label}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Material</p>
                                  <p>
                                    {MATERIALS.options.find(m => m.value === order.configuration.material)?.label}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Finish</p>
                                  <p>
                                    {FINISHES.options.find(f => f.value === order.configuration.finish)?.label}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Color</p>
                                  <div 
                                    className="w-6 h-6 rounded-full border"
                                    style={{ backgroundColor: order.configuration.color }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="font-medium">Dimensions</p>
                              <p className="text-muted-foreground">
                                {order.configuration.width}mm × {order.configuration.height}mm
                              </p>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthProtection>
  )
}

export default CustomerOrdersPage