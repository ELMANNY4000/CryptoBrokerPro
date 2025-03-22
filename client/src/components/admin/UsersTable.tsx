import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { UserCog } from "lucide-react";

interface UsersTableProps {
  users: User[];
  requestHeaders: Record<string, string>;
}

export function UsersTable({ users, requestHeaders }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          ...requestHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update user role");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role updated",
        description: `User role was updated successfully.`,
      });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });
  
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  };
  
  const handleRoleUpdate = () => {
    if (!selectedUser || !newRole) return;
    
    updateRoleMutation.mutate({
      userId: selectedUser.id,
      role: newRole,
    });
  };
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === "admin" 
                      ? "bg-red-900/20 text-red-500" 
                      : user.role === "moderator"
                      ? "bg-yellow-900/20 text-yellow-500"
                      : "bg-green-900/20 text-green-500"
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                    <UserCog className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">User: {selectedUser.username}</p>
                <p className="text-sm text-neutral-400">Email: {selectedUser.email}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleRoleUpdate}
              disabled={updateRoleMutation.isPending || !newRole || newRole === selectedUser?.role}
            >
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}