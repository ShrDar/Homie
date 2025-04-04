"use client"
import { HomieUser } from "@/homieTypes/homieTypes";
import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { storage, ID } from "@/config/AppWriteClient";
import { getProfileUrl } from "@/extra/helpers";
import { IoIosImages } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { signupWithCreds } from "@/actions/auth";
import Image from "next/image";
import { FiUser, FiEdit2 } from "react-icons/fi";

export default function UsersPage() {
  const [users, setUsers] = useState<HomieUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<HomieUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
    role: ""
  });
  const [addUserForm, setAddUserForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [currentImage, setCurrentImage] = useState("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  useEffect(() => {
    fetchUsers();
  }, []);
  const handleDelete = async (user: HomieUser) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user._id}`, {
        method: "DELETE",
      });

      if (user.image && !user.image.startsWith("htt")) {
        try {
          await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", user.image);
        } catch (imageError) {
          console.error("Error deleting profile image:", imageError);
        }
      }
      
      if (response.ok) {
        toast.success("User deleted successfully");
        fetchUsers();
        setIsEditing(false);
      } else {
        const errorMessage = await response.text();
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      toast.error("Error deleting user");
      console.error("Error deleting user:", err);
    }
  };
  const fetchUsers = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`);
    const data = await response.json();
    setUsers(data);
  };
  const handleEdit = (user: HomieUser) => {
    setSelectedUser(user);
    setCurrentImage(user.image || "");
    setEditForm({
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      role: user.role || "USER"
    });
    setIsEditing(true);
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      let imageId = selectedUser.image;
      if (currentFile) {
        if (selectedUser.image && !selectedUser.image.startsWith("htt")) {
          try {
            await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", selectedUser.image);
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }
        const id = ID.unique();
        await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", id, currentFile);
        imageId = id;
      }
      
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${selectedUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          username: editForm.username,
          bio: editForm.bio,
        })
      });

      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${selectedUser._id}/image`, {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageId }),
    });
      
      await fetchUsers();
      setIsEditing(false);
      setCurrentFile(null);
      setCurrentImage("");
      toast.success("User updated successfully");
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update user");
    }
  };
  const handlePicChange = (file: File | undefined) => {
    if (file && file.type.startsWith("image/")) {
      setCurrentFile(file);
      const imageUrl = URL.createObjectURL(file);
      setCurrentImage(imageUrl);
    }
  };
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("");
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("");
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else if (/\s/.test(password)) {
      setPasswordError("Password cannot contain spaces");
    } else {
      setPasswordError("");
    }
    validateConfirmPassword(addUserForm.confirmPassword, password);
  };
  const validateConfirmPassword = (confirmPass: string, pass: string = addUserForm.password) => {
    if (!confirmPass) {
      setConfirmPasswordError("");
    } else if (confirmPass !== pass) {
      setConfirmPasswordError("Passwords don't match");
    } else if(confirmPass.length < 8) {
      setConfirmPasswordError("Password must be at least 8 characters long");
    } else {
      setConfirmPasswordError("");
    }
  };
  const validateUsername = async (username: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/`);
    const users = await response.json();
    const repeatedUser = users.some((user: { username: string }) => user.username === username);

    if (repeatedUser) {
      setUsernameError("Username Taken");
    }
    else if (/\s/.test(username)) {
      setUsernameError("Username cannot contain spaces");
    }
    else if (/[^a-zA-Z0-9_]/.test(username)) {
      setUsernameError("Username cannot contain special characters");
    }
    else {
      setUsernameError("");
    }
  };
  const handleAddUser = async () => {
    const { email, firstName, lastName, username, password, confirmPassword } = addUserForm;

    validateEmail(email);
    validatePassword(password);
    validateConfirmPassword(confirmPassword);
    await validateUsername(username);

    if (email === "" || password === "" || confirmPassword === "" || firstName === "" || lastName === "") {
      toast.error("Empty Fields");
      return;
    }

    if (emailError) {
      toast.error(emailError);
      return;
    } else if (passwordError) {
      toast.error(passwordError);
      return;
    } else if (confirmPasswordError) {
      toast.error(confirmPasswordError);
      return;
    } else if (usernameError) {
      toast.error(usernameError);
      return;
    }

    if (emailError || passwordError || confirmPasswordError || !email || !password || !confirmPassword) {
      return;
    }

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const defaultImages = ['https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa0bcf002e60148154/view?project=67aa0803002c7db860ad&mode=admin', 'https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa130a0027cba1a4ac/view?project=67aa0803002c7db860ad&mode=admin', 'https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa131a003596256ea6/view?project=67aa0803002c7db860ad&mode=admin', 'https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa132700151f0a8682/view?project=67aa0803002c7db860ad&mode=admin', 'https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa1336000dac6ec818/view?project=67aa0803002c7db860ad&mode=admin'];
      const image = defaultImages[Math.floor(Math.random() * defaultImages.length)];
      const result = await signupWithCreds(email, password, fullName, image, username);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User created successfully");
        await fetchUsers();
        setIsAddingUser(false);
        setAddUserForm({
          email: "",
          firstName: "",
          lastName: "",
          username: "",
          password: "",
          confirmPassword: ""
        });
        setCurrentFile(null);
        setCurrentImage("");
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Failed to create user");
    }
  }
  return (
    <div className="max-h-screen bg-bgPrimary p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fontPrimary flex items-center gap-3">
              <FiUser className="text-fontPrimary" />
              User Management
            </h1>
            <p className="mt-2 text-gray-400">
              Monitor and manage all users across the platform
            </p>
          </div>

          <div className="searchUsers">
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 rounded-full bg-bgSecondary text-center"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsAddingUser(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 flex items-center gap-2 font-medium shadow-lg transition-all hover:scale-105"
            >
              <FiUser size={18} />
              Add User
            </button>
            <div className="bg-bgSecondary rounded-lg px-4 py-2">
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-fontPrimary">{users.length}</p>
            </div>
            <div className="bg-bgSecondary rounded-lg px-4 py-2">
              <p className="text-sm text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-blue-400">
                {users.filter(user => user.role === 'ADMIN').length}
              </p>
            </div>
            <div className="bg-bgSecondary rounded-lg px-4 py-2">
              <p className="text-sm text-gray-400">Normal Users</p>
              <p className="text-2xl font-bold text-green-400">
                {users.filter(user => user.homies && user.homies.length > 0).length}
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-bgSecondary rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full max-h-[80vh] overflow-y-auto">
          <table className="w-full ">
            <thead>
              <tr className="border-b border-[#585858]">
                <th className="text-left px-12 py-6 m w-16"></th>
                <th className="text-left p-4 text-gray-400 font-medium">Name</th>
                <th className="text-left p-4 text-gray-400 font-medium">Username</th>
                <th className="text-center p-4 text-gray-400 font-medium">Homies</th>
                <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(user => 
                searchTerm === "" || user.username.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((user: HomieUser) => (
                <tr key={user._id} className="border-b border-[#585858] hover:bg-bgPrimary/30 transition-colors">
                  <td className="p-6">
                    <Image 
                      src={getProfileUrl(user.image || "")} 
                      alt={user.name} 
                      width={100}
                      height={100}
                      className="w-20 aspect-square rounded-full object-cover"
                    />
                  </td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">@{user.username}</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {user.homies?.length || 0} homies
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      className="p-2 bg-bgPrimary text-blue-400 rounded-lg hover:bg-bgPrimary/80 transition-colors"
                      onClick={() => handleEdit(user)}
                    >
                      <FiEdit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedUser && (
        <>
          <div onClick={() => setIsEditing(false)} className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm">
          </div>
          <div className="bg-bgPrimary fixed z-[100] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-lg p-6 w-full max-w-2xl">
            <div className="flex flex-col items-center mb-8">
              <h3 className="text-2xl font-bold mb-6">Edit User</h3>
              <div className="relative mb-6">
                <Image 
                  src={getProfileUrl(currentImage || selectedUser.image || "")}
                  alt={selectedUser.name}
                  width={500}
                  height={500}
                  className="w-32 h-32 rounded-full object-cover bg-bgSecondary"
                />
                <label htmlFor="profilePic" className="absolute bottom-0 right-0 cursor-pointer hover:brightness-90 bg-primary p-2 rounded-full">
                  <IoIosImages color="white" size={20}/>
                </label>
                <input 
                  className="hidden" 
                  type="file" 
                  accept="image/*" 
                  id="profilePic" 
                  onChange={(e) => handlePicChange(e.target.files?.[0])} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full p-2 rounded-md bg-bgSecondary border border-borderPrimary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full p-2 rounded-md bg-bgSecondary border border-borderPrimary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full p-2 rounded-md bg-bgSecondary border border-borderPrimary"
                      rows={3}
                    />
                  </div>
                </form>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium">Homies - {selectedUser.homies?.length || 0}</h4>
                <div className="bg-bgSecondary border border-borderPrimary rounded-md p-4 max-h-[400px] overflow-y-auto">
                  {selectedUser.homies && selectedUser.homies.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.homies.map((homieId: string) => {
                        const homie = users.find(u => u._id === homieId);
                        return (
                          <div key={homieId} className="flex items-center gap-3 p-2 rounded-md hover:bg-bgPrimary">
                            <Image 
                              src={getProfileUrl(homie?.image || "")} 
                              alt={homie?.name || 'Unknown User'} 
                              width={200}
                              height={200}
                              className="w-10 rounded-full aspect-square object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{homie?.name || 'Unknown User'}</p>
                              <p className="text-sm text-gray-500">@{homie?.username}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No homies yet</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      setEditForm({...editForm, role: newRole});
                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${selectedUser._id}/role`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ role: newRole })
                        });
                        if (response.ok) {
                          toast.success('Role updated successfully');
                          await fetchUsers();
                        } else {
                          toast.error('Failed to update role');
                        }
                      } catch (error) {
                        console.error('Error updating role:', error);
                        toast.error('Failed to update role');
                      }
                    }}
                    className="w-full p-2 rounded-md bg-bgSecondary border border-borderPrimary"
                  >
                    <option className="" value="USER">User</option>
                    <option className="" value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-borderPrimary">
              <button 
                onClick={() => handleDelete(selectedUser)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-md flex items-center gap-2"
              >
                <Trash2 size={20} />
                <span>Delete User</span>
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-md border border-borderPrimary hover:bg-bgSecondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/80"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </>
      )}
    {/* Add User Modal */}
      {isAddingUser && (
        <>
          <div onClick={() => setIsAddingUser(false)} className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bgPrimary p-8 rounded-lg w-full max-w-md z-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Add New User</h3>
              <button
                onClick={() => setIsAddingUser(false)}
                className="text-gray-500 hover:text-[#585858]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={addUserForm.firstName}
                  onChange={(e) => setAddUserForm({ ...addUserForm, firstName: e.target.value })}
                  className="w-1/2 bg-bgSecondary border-2 border-transparent focus:outline-none focus:border-primary rounded px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={addUserForm.lastName}
                  onChange={(e) => setAddUserForm({ ...addUserForm, lastName: e.target.value })}
                  className="w-1/2 bg-bgSecondary border-2 border-transparent focus:outline-none focus:border-primary rounded px-4 py-2"
                />
              </div>

              <input
                type="text"
                placeholder="Username"
                value={addUserForm.username}
                onChange={(e) => {
                  setAddUserForm({ ...addUserForm, username: e.target.value });
                  validateUsername(e.target.value);
                }}
                className={`w-full bg-bgSecondary border-2 focus:outline-none rounded px-4 py-2 ${usernameError ? 'border-red-500' : 'border-transparent focus:border-primary'}`}
              />
              {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}

              <input
                type="email"
                placeholder="Email"
                value={addUserForm.email}
                onChange={(e) => {
                  setAddUserForm({ ...addUserForm, email: e.target.value });
                  validateEmail(e.target.value);
                }}
                className={`w-full bg-bgSecondary border-2 focus:outline-none rounded px-4 py-2 ${emailError ? 'border-red-500' : 'border-transparent focus:border-primary'}`}
              />
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={addUserForm.password}
                  onChange={(e) => {
                    setAddUserForm({ ...addUserForm, password: e.target.value });
                    validatePassword(e.target.value);
                  }}
                  className={`w-full bg-bgSecondary border-2 focus:outline-none rounded px-4 py-2 ${passwordError ? 'border-red-500' : 'border-transparent focus:border-primary'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={addUserForm.confirmPassword}
                onChange={(e) => {
                  setAddUserForm({ ...addUserForm, confirmPassword: e.target.value });
                  validateConfirmPassword(e.target.value);
                }}
                className={`w-full bg-bgSecondary border-2 focus:outline-none rounded px-4 py-2 ${confirmPasswordError ? 'border-red-500' : 'border-transparent focus:border-primary'}`}
              />
              {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}

              <button
                onClick={handleAddUser}
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/80 transition-colors"
              >
                Create User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}