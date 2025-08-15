"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

// Types
interface User {
  ID: number;
  name: string;
  email: string | null;
  phone: string;
  user_type: "normal" | "worker" | "broker" | "contractor" | "admin";
  gender: string;
  is_active: boolean;
  role_application_status: "none" | "pending" | "approved" | "rejected";
  wallet_balance: number;
  wallet_limit: number;
  has_active_subscription: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

// Form schemas
const userUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  user_type: z.enum(["normal", "worker", "broker", "contractor", "admin"]),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  is_active: z.boolean(),
  role_application_status: z.enum(["none", "pending", "approved", "rejected"]),
  wallet_balance: z.number().min(0, "Wallet balance cannot be negative"),
  wallet_limit: z.number().min(0, "Wallet limit cannot be negative"),
  has_active_subscription: z.boolean(),
});

type UserUpdateForm = z.infer<typeof userUpdateSchema>;

// Filter interface
interface Filters {
  user_type: string;
  is_active: string;
  role_application_status: string;
  has_active_subscription: string;
  search: string;
  date_from: string;
  date_to: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    user_type: "",
    is_active: "",
    role_application_status: "",
    has_active_subscription: "",
    search: "",
    date_from: "",
    date_to: "",
  });

  const form = useForm<UserUpdateForm>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      user_type: "normal",
      gender: "prefer_not_to_say",
      is_active: true,
      role_application_status: "none",
      wallet_balance: 0,
      wallet_limit: 100000,
      has_active_subscription: false,
    },
  });

  // Fetch users
  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) => value !== "" && value !== "all"
          )
        ),
      });

      const response = await apiClient.get<{ data: UsersResponse }>(
        `/admin/users?${params}`
      );
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single user
  const fetchUser = async (userId: number) => {
    try {
      const response = await apiClient.get<{ data: { user: User } }>(
        `/admin/users/${userId}`
      );
      return response.data.data.user;
    } catch (error) {
      toast.error("Failed to fetch user details");
      console.error("Error fetching user:", error);
      return null;
    }
  };

  // Update user
  const updateUser = async (userId: number, data: UserUpdateForm) => {
    try {
      const response = await apiClient.put<{ data: { user: User } }>(
        `/admin/users/${userId}`,
        data
      );
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      fetchUsers(pagination?.page || 1);
      return response.data.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update user";
      toast.error(message);
      console.error("Error updating user:", error);
      return null;
    }
  };

  // Delete user
  const deleteUser = async (userId: number) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers(pagination?.page || 1);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete user";
      toast.error(message);
      console.error("Error deleting user:", error);
    }
  };

  // Toggle user activation
  const toggleUserActivation = async (userId: number) => {
    try {
      const response = await apiClient.post<{
        data: { user: User; message: string };
      }>(`/admin/users/${userId}/activate`);
      toast.success(response.data.data.message);
      fetchUsers(pagination?.page || 1);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to toggle user activation";
      toast.error(message);
      console.error("Error toggling user activation:", error);
    }
  };

  // Handle edit user
  const handleEditUser = async (user: User) => {
    setSelectedUser(user);
    form.reset({
      name: user.name,
      email: user.email || "",
      phone: user.phone,
      user_type: user.user_type,
      gender: user.gender as any,
      is_active: user.is_active,
      role_application_status: user.role_application_status,
      wallet_balance: user.wallet_balance,
      wallet_limit: user.wallet_limit,
      has_active_subscription: user.has_active_subscription,
    });
    setIsEditDialogOpen(true);
  };

  // Handle view user
  const handleViewUser = async (user: User) => {
    const detailedUser = await fetchUser(user.ID);
    if (detailedUser) {
      setSelectedUser(detailedUser);
      setIsViewDialogOpen(true);
    }
  };

  // Handle form submission
  const onSubmit = async (data: UserUpdateForm) => {
    if (selectedUser) {
      await updateUser(selectedUser.ID, data);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchUsers(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      user_type: "all",
      is_active: "all",
      role_application_status: "all",
      has_active_subscription: "all",
      search: "",
      date_from: "",
      date_to: "",
    });
    fetchUsers(1);
  };

  // Get user type badge color
  const getUserTypeBadge = (userType: string) => {
    const colors = {
      normal: "bg-gray-100 text-gray-800",
      worker: "bg-blue-100 text-blue-800",
      broker: "bg-green-100 text-green-800",
      contractor: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };
    return colors[userType as keyof typeof colors] || colors.normal;
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const colors = {
      none: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || colors.none;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage all users in the system
          </p>
        </div>
        <Button
          onClick={() => fetchUsers(pagination?.page || 1)}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, email, phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_type">User Type</Label>
              <Select
                value={filters.user_type}
                onValueChange={(value) =>
                  handleFilterChange("user_type", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="broker">Broker</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                value={filters.is_active}
                onValueChange={(value) =>
                  handleFilterChange("is_active", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_application_status">Role Status</Label>
              <Select
                value={filters.role_application_status}
                onValueChange={(value) =>
                  handleFilterChange("role_application_status", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="has_active_subscription">Subscription</Label>
              <Select
                value={filters.has_active_subscription}
                onValueChange={(value) =>
                  handleFilterChange("has_active_subscription", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All subscriptions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subscriptions</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_from">Date From</Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_to">Date To</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters}>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role Status</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.ID}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.ID}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{user.phone}</div>
                          {user.email && (
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getUserTypeBadge(user.user_type)}>
                          {user.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.is_active ? "default" : "secondary"}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadge(
                            user.role_application_status
                          )}
                        >
                          {user.role_application_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            ₹{user.wallet_balance.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Limit: ₹{user.wallet_limit.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.has_active_subscription
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.has_active_subscription ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserActivation(user.ID)}
                          >
                            {user.is_active ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.name}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.ID)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers(pagination.page - 1)}
                      disabled={!pagination.has_prev}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers(pagination.page + 1)}
                      disabled={!pagination.has_next}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="user_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="worker">Worker</SelectItem>
                          <SelectItem value="broker">Broker</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role_application_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Application Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wallet_balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Balance</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wallet_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Limit</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable or disable this user account
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="has_active_subscription"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Subscription
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Mark if user has active subscription
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedUser.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">
                    {selectedUser.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User Type</Label>
                  <Badge className={getUserTypeBadge(selectedUser.user_type)}>
                    {selectedUser.user_type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <p className="text-sm">
                    {selectedUser.gender || "Not specified"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={selectedUser.is_active ? "default" : "secondary"}
                  >
                    {selectedUser.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Role Application Status
                  </Label>
                  <Badge
                    className={getStatusBadge(
                      selectedUser.role_application_status
                    )}
                  >
                    {selectedUser.role_application_status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Subscription</Label>
                  <Badge
                    variant={
                      selectedUser.has_active_subscription
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedUser.has_active_subscription
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Wallet Balance</Label>
                  <p className="text-sm">
                    ₹{selectedUser.wallet_balance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Wallet Limit</Label>
                  <p className="text-sm">
                    ₹{selectedUser.wallet_limit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created At</Label>
                  <p className="text-sm">
                    {new Date(selectedUser.CreatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm">
                    {new Date(selectedUser.UpdatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
