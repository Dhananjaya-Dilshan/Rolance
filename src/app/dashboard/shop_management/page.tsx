"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, PenSquare, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthProtection from "@/components/AuthProtection";

interface Shop {
  id: string;
  ShopName: string;
  email: string;
  ContactNumber: string;
  country: string;
  ShopAddress: string;
  username: string;
  createdAt: string;
  image?: string;
}

const ShopManagement = () => {
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editShop, setEditShop] = useState<Shop | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    ShopName: '',
    email: '',
    ContactNumber: '',
    country: '',
    ShopAddress: '',
  });

  // Fetch shops
  const fetchShops = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to access this page",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/shops', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shops');
      }

      const data = await response.json();
      setShops(data.shops);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shops",
        variant: "destructive",
      });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Handle shop deletion
  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('Are you sure you want to delete this shop?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete shop');
      }

      toast({
        title: "Success",
        description: "Shop deleted successfully",
      });

      // Update the local state by filtering out the deleted shop
      setShops(shops.filter(shop => shop.id !== shopId));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error deleting shop",
        variant: "destructive",
      });
      console.error('Error:', error);
    }
  };

  // Handle shop update
  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShop) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      // Prepare the data in the format the API expects
      const updateData = {
        username: formData.username,
        ShopName: formData.ShopName,
        email: formData.email,
        ContactNumber: formData.ContactNumber,
        country: formData.country,
        ShopAddress: formData.ShopAddress,
      };

      const response = await fetch(`/api/admin/shops/${editShop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update shop: ${response.status}`);
      }

      const responseData = await response.json();

      toast({
        title: "Success",
        description: "Shop updated successfully",
      });

      setIsEditDialogOpen(false);

      // Update the local state with the updated shop data
      setShops(shops.map(shop =>
        shop.id === editShop.id
          ? { ...shop, ...updateData }
          : shop
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error updating shop",
        variant: "destructive",
      });
      console.error('Error:', error);
    }
  };

  // Open edit dialog with shop data
  const openEditDialog = (shop: Shop) => {
    setEditShop(shop);
    setFormData({
      username: shop.username || '',
      ShopName: shop.ShopName || '',
      email: shop.email || '',
      ContactNumber: shop.ContactNumber || '',
      country: shop.country || '',
      ShopAddress: shop.ShopAddress || '',
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-purple-600">Shop Management</h1>
        </div>
        <p className="text-gray-600 mb-6">Manage all registered shops in the system</p>

        {shops.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Shops Found</h3>
            <p className="text-gray-500">There are no registered shops in the system yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border shadow-sm overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell>{shop.username}</TableCell>
                    <TableCell className="font-medium">{shop.ShopName}</TableCell>
                    <TableCell>{shop.email}</TableCell>
                    <TableCell>{shop.ContactNumber}</TableCell>
                    <TableCell>{shop.country}</TableCell>
                    <TableCell>{shop.ShopAddress}</TableCell>
                    <TableCell>
                      {new Date(shop.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm"
                        onClick={() => openEditDialog(shop)}
                      >
                        <PenSquare className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-sm"
                        onClick={() => handleDeleteShop(shop.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Shop Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Shop Details</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateShop} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shop Name</label>
                  <Input
                    value={formData.ShopName}
                    onChange={(e) => setFormData({ ...formData, ShopName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Number</label>
                <Input
                  value={formData.ContactNumber}
                  onChange={(e) => setFormData({ ...formData, ContactNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Shop Address</label>
                <Input
                  value={formData.ShopAddress}
                  onChange={(e) => setFormData({ ...formData, ShopAddress: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default ShopManagement;