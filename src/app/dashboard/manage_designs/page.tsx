// app/dashboard/manage_designs/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Phone from '@/components/Phone';
import { MODELS, FINISHES, MATERIALS } from '@/validators/option-validator';

type Design = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  commissionRate: number;
  status: 'pending' | 'approved' | 'rejected';
  configuration: {
    color: string;
    model: string;
    material: string;
    finish: string;
    croppedImageUrl: string;
    width: number;
    height: number;
  };
};

const ManageDesignsPage = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/designs', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        const data = await response.json();
        setDesigns(data);
      } catch (error) {
        console.error('Error fetching designs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  const updateDesignStatus = async (designId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/designs', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: designId, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update design status');
      }

      const updatedDesign = await response.json();

      // Update the local state
      setDesigns((prevDesigns) =>
        prevDesigns.map((design) =>
          design.id === designId ? { ...design, status: updatedDesign.status } : design
        )
      );
    } catch (error) {
      console.error('Error updating design status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update design status');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Designs</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : designs.length === 0 ? (
        <p className="text-gray-600">No designs found</p>
      ) : (
        <div className="grid gap-4">
          {designs.map((design) => (
            <div key={design.id} className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{design.title}</p>
                  <p className="text-muted-foreground">{design.description}</p>
                  <span className={`text-sm ${
                    design.status === 'approved' ? 'text-green-600' :
                    design.status === 'rejected' ? 'text-red-600' : 'text-primary'
                  }`}>
                    Status: {design.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    onClick={() => updateDesignStatus(design.id, 'approved')}
                    disabled={design.status !== 'pending'}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateDesignStatus(design.id, 'rejected')}
                    disabled={design.status !== 'pending'}
                  >
                    Reject
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">View Details</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Design Details</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[calc(80vh-100px)] pr-4">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="flex justify-center">
                            <Phone
                              className="max-w-[120px]"
                              style={{ backgroundColor: design.configuration.color }}
                              imgSrc={design.configuration.croppedImageUrl!}
                              model={design.configuration.model}
                            />
                          </div>
                          <div className="space-y-4">
                            <p className="font-medium">Title: {design.title}</p>
                            <p className="font-medium">Description: {design.description}</p>
                            <p className="font-medium">Tags: {design.tags.join(', ')}</p>
                            <p className="font-medium">Commission Rate: {design.commissionRate}%</p>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">View Configuration</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Configuration Details</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[calc(80vh-100px)] pr-4">
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium">Model</p>
                            <p className="text-muted-foreground">
                              {MODELS.options.find(m => m.value === design.configuration.model)?.label}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Material</p>
                            <p className="text-muted-foreground">
                              {MATERIALS.options.find(m => m.value === design.configuration.material)?.label}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Finish</p>
                            <p className="text-muted-foreground">
                              {FINISHES.options.find(f => f.value === design.configuration.finish)?.label}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Color</p>
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: design.configuration.color }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">Dimensions</p>
                            <p className="text-muted-foreground">
                              {design.configuration.width}mm × {design.configuration.height}mm
                            </p>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageDesignsPage;