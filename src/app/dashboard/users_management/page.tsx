"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Loader2, Trash2, PenSquare, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthProtection from "@/components/AuthProtection";

interface User {
  id: string;
  username: string;
  email: string;
  country : string;
  createdAt: string;
}

const UsersManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    country : "",
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token); // Debugging
  
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to access this page",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
  
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Response status:", response.status); // Debugging
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Error data:", errorData); // Debugging
        throw new Error(errorData?.message || "Failed to fetch users");
      }
  
      const data = await response.json();
      console.log("Fetched users:", data.users); // Debugging
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error); // Debugging
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to delete user");
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      // Update the local state by filtering out the deleted user
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error deleting user",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  // Handle user update
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      const token = localStorage.getItem("token");
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
        email: formData.email,
        country : formData.country ,
      };

      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update user: ${response.status}`);
      }

      const responseData = await response.json();

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditDialogOpen(false);

      // Update the local state with the updated user data
      setUsers(users.map((user) =>
        user.id === editUser.id ? { ...user, ...updateData } : user
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error updating user",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  // Open edit dialog with user data
  const openEditDialog = (user: User) => {
    setEditUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      country : user.country  || "",
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
            <UserIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-purple-600">Users Management</h1>
          </div>
          <p className="text-gray-600 mb-6">Manage all registered users in the system</p>

          {users.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-500">There are no registered users in the system yet.</p>
            </div>
          ) : (
            <div className="rounded-lg border shadow-sm overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>country </TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.country }</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <PenSquare className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-sm"
                          onClick={() => handleDeleteUser(user.id)}
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

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Edit User Details</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
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
                  <label className="text-sm font-medium">country </label>
                  <Input
                    value={formData.country }
                    onChange={(e) => setFormData({ ...formData, country : e.target.value })}
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

export default UsersManagement;