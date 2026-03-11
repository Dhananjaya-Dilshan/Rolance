'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PhoneModel } from '@prisma/client';

// Type definitions
interface Design {
  id: string;
  title: string;
  description: string;
  tags: string[];
  commissionRate: number;
  status: string;
  createdAt: string;
  configuration: {
  id: string;
  imageUrl: string;
  croppedImageUrl: string | null;
  model: PhoneModel;
  color: string | null;
  };
}

const ManageDesigns = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Form state for editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [commissionRate, setCommissionRate] = useState(0);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'customer') {
      toast({
        title: 'Authentication required',
        description: 'Please log in as a customer to view your designs.',
        variant: 'destructive',
      });
      router.push('/login');
    } else {
      fetchDesigns();
    }
  }, [router, toast]);

  // Fetch designs from the API
  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const customerId = JSON.parse(localStorage.getItem('user') || '{}').id;
  
      if (!token || !customerId) {
        throw new Error('No authentication token or user ID found');
      }
  
      const response = await fetch(`/api/designs?customerId=${customerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch designs');
      }
      
      const designs = await response.json();
      
      // Log the fetched designs for debugging
      console.log('Fetched Designs:', designs);
      
      // Set designs directly
      setDesigns(Array.isArray(designs) ? designs : []);
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast({
        title: 'Fetch Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      setDesigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle design edit
  const handleEditDesign = (design: Design) => {
    setSelectedDesign(design);
    setTitle(design.title);
    setDescription(design.description);
    setTags(design.tags.join(', '));
    setCommissionRate(design.commissionRate);
    setIsEditDialogOpen(true);
  };

  // Handle design delete
  const handleDeleteDesign = (design: Design) => {
    setSelectedDesign(design);
    setIsDeleteDialogOpen(true);
  };

  // Handle design view
  const handleViewDesign = (design: Design) => {
    setSelectedDesign(design);
    setIsViewDialogOpen(true);
  };

  // Submit design update
  const submitDesignUpdate = async () => {
    if (!selectedDesign) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/designs/${selectedDesign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
          commissionRate,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update design');
      }
      
      const updatedDesign = await response.json();
      
      toast({
        title: 'Design Updated',
        description: 'Your design has been updated successfully.',
      });
      
      setIsEditDialogOpen(false);
      fetchDesigns(); // Refresh designs list
    } catch (error) {
      console.error('Error updating design:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update design. Please try again.',
        variant: 'destructive',
      });
    }
  };
  

  // Confirm design deletion
  const confirmDeleteDesign = async () => {
    if (!selectedDesign) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/designs/${selectedDesign.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete design');
      }
      
      toast({
        title: 'Design Deleted',
        description: 'Your design has been deleted successfully.',
      });
      
      setIsDeleteDialogOpen(false);
      fetchDesigns(); // Refresh designs list
    } catch (error) {
      console.error('Error deleting design:', error);
      toast({
        title: 'Deletion Failed',
        description: error instanceof Error ? error.message : 'Failed to delete design. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get badge color based on design status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 mt-8">
        <h1 className="text-3xl font-bold mb-6">Manage Your Designs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex space-x-2 mt-4">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Your Designs</h1>
        <Button onClick={() => router.push('/configure')}>Create New Design</Button>
      </div>

      {designs && designs.length === 0 ? (
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md"
          >
            <AlertCircle className="h-12 w-12 mx-auto text-purple-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No designs found</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any designs yet. Start by creating your first custom design!
            </p>
            <Button onClick={() => router.push('/configure')} className="px-8">
              Create Design
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <motion.div
              key={design.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={design.configuration.croppedImageUrl || design.configuration.imageUrl}
                    alt={design.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(design.status)}`}>
                    {design.status.charAt(0).toUpperCase() + design.status.slice(1)}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{design.title}</CardTitle>
                  <CardDescription>
                    {new Date(design.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {design.description || 'No description provided'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {design.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {design.tags.length > 3 && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        +{design.tags.length - 3}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDesign(design)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditDesign(design)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteDesign(design)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Design</DialogTitle>
            <DialogDescription>
              Make changes to your design details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Design title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Design description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., modern, minimal, colorful"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Commission Rate (%)</Label>
              <Input
                id="commission"
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitDesignUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Design</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this design? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteDesign}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Design Dialog */}
      {selectedDesign && (
  <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
    <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{selectedDesign.title}</DialogTitle>
      </DialogHeader>
      <div className="p-1 space-y-4">
        <div className="aspect-square max-h-64 overflow-hidden rounded-md mb-4">
          <img
            src={selectedDesign.configuration.croppedImageUrl || selectedDesign.configuration.imageUrl}
            alt={selectedDesign.title}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm">Status</h4>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadgeColor(selectedDesign.status)}`}>
              {selectedDesign.status.charAt(0).toUpperCase() + selectedDesign.status.slice(1)}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-sm">Description</h4>
            <p className="text-gray-700 mt-1">
              {selectedDesign.description || 'No description provided'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm">Commission Rate</h4>
            <p className="text-gray-700 mt-1">{selectedDesign.commissionRate}%</p>
          </div>
          <div>
            <h4 className="font-medium text-sm">Tags</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedDesign.tags.length > 0 ? (
                selectedDesign.tags.map((tag, i) => (
                  <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No tags</span>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm">Created On</h4>
            <p className="text-gray-700 mt-1">
              {new Date(selectedDesign.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
    </div>
  );
};

export default ManageDesigns;