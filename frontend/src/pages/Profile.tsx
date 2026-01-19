import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editMode, setEditMode] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [deleteData, setDeleteData] = useState({
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleDeleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDeleteData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const updatePayload: any = {}
      if (formData.name !== user?.name) updatePayload.name = formData.name
      if (formData.email !== user?.email) updatePayload.email = formData.email

      if (Object.keys(updatePayload).length === 0) {
        setError('No changes made')
        setLoading(false)
        return
      }

      const response = await authAPI.updateProfile(updatePayload)
      updateUser(response.data.user)
      setSuccess('Profile updated successfully!')
      setEditMode(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      if (!passwordData.currentPassword || !passwordData.newPassword) {
        setError('All password fields are required')
        setLoading(false)
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match')
        setLoading(false)
        return
      }

      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setSuccess('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowChangePassword(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!deleteData.password) {
        setError('Password is required')
        setLoading(false)
        return
      }

      await authAPI.deleteAccount(deleteData.password)
      logout()
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      setError(null)

      // Check file size (limit to 2MB)
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        setError('File size must be less than 2MB. Please compress your image.')
        setLoading(false)
        return
      }

      // Read file as base64
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            let profilePictureUrl = event.target?.result as string
            
            // If image is too large, compress it using canvas
            if (profilePictureUrl.length > 500000) {
              try {
                const img = new Image()
                img.onload = async () => {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  if (!ctx) throw new Error('Could not get canvas context')
                  
                  // Scale down image
                  const scale = Math.sqrt(500000 / profilePictureUrl.length)
                  canvas.width = img.width * scale
                  canvas.height = img.height * scale
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                  
                  profilePictureUrl = canvas.toDataURL('image/jpeg', 0.7)
                  
                  // Make API call with compressed image
                  const response = await authAPI.updateProfile({ profilePictureUrl })
                  updateUser(response.data.user)
                  setSuccess('Profile picture updated!')
                  setLoading(false)
                  resolve()
                }
                img.src = profilePictureUrl
              } catch (err) {
                // Fallback: just send the base64 as is
                const response = await authAPI.updateProfile({ profilePictureUrl })
                updateUser(response.data.user)
                setSuccess('Profile picture updated!')
                setLoading(false)
                resolve()
              }
            } else {
              // Image is small enough, send directly
              const response = await authAPI.updateProfile({ profilePictureUrl })
              updateUser(response.data.user)
              setSuccess('Profile picture updated!')
              setLoading(false)
              resolve()
            }
          } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to update profile picture'
            setError(errorMsg)
            setLoading(false)
            reject(err)
          }
        }
        reader.onerror = () => {
          setError('Failed to read file')
          setLoading(false)
          reject(new Error('Failed to read file'))
        }
        reader.readAsDataURL(file)
      })
    } catch (err: any) {
      setError(err.message || 'Failed to update profile picture')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 animate-fade-in py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-card-fade-in">
          <h1 className="text-4xl font-bold text-white">My Profile</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-2 rounded-lg hover:from-gray-800 hover:to-gray-900 smooth-transition font-medium"
          >
            Back
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 animate-modal-in">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4 animate-modal-in">
            {success}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl shadow-lg p-8 mb-6 border border-gray-700 animate-card-fade-in" style={{animationDelay: '0.1s'}}>
          <h2 className="text-2xl font-bold mb-6 text-white">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div
              onClick={handleProfilePictureClick}
              className="relative cursor-pointer group"
            >
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-indigo-500">
                  <span className="text-white text-5xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center smooth-transition">
                <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 smooth-transition">
                  Change
                </span>
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              <p className="text-gray-300 mb-2">Click on the profile picture to change it</p>
              <p className="text-gray-500 text-sm">Supports JPG, PNG, WebP. Max 2MB (auto-compressed if larger)</p>
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl shadow-lg p-8 mb-6 border border-gray-700 animate-card-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Basic Information</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-800 smooth-transition font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-indigo-500 focus:glow placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-indigo-500 focus:glow placeholder-gray-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 smooth-transition font-medium"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false)
                    setFormData({ name: user?.name || '', email: user?.email || '' })
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 smooth-transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-400 min-w-32">Name:</span>
                <span className="text-gray-200">{user?.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-400 min-w-32">Email:</span>
                <span className="text-gray-200">{user?.email}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-400 min-w-32">Role:</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-900 text-indigo-200">
                  {user?.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl shadow-lg p-8 border border-gray-700 animate-card-fade-in" style={{animationDelay: '0.3s'}}>
          <h2 className="text-2xl font-bold mb-6 text-white">Security</h2>

          {/* Change Password */}
          <div className="mb-6">
            {!showChangePassword ? (
              <button
                onClick={() => {
                  setShowChangePassword(true)
                  setError(null)
                  setSuccess(null)
                }}
                className="w-full text-left bg-gray-700 hover:bg-gray-650 p-4 rounded-lg smooth-transition border border-gray-600 hover:border-indigo-500"
              >
                <h3 className="text-lg font-semibold text-white">Change Password</h3>
                <p className="text-gray-400 text-sm mt-1">Update your password to keep your account secure</p>
              </button>
            ) : (
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-white">Change Password</h3>
                <div>
                  <label className="block text-gray-400 font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    className="w-full bg-gray-600 text-gray-100 border border-gray-500 rounded px-4 py-2 focus:outline-none focus:border-indigo-500 focus:glow placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full bg-gray-600 text-gray-100 border border-gray-500 rounded px-4 py-2 focus:outline-none focus:border-indigo-500 focus:glow placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full bg-gray-600 text-gray-100 border border-gray-500 rounded px-4 py-2 focus:outline-none focus:border-indigo-500 focus:glow placeholder-gray-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 smooth-transition font-medium"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => {
                      setShowChangePassword(false)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    disabled={loading}
                    className="flex-1 bg-gray-600 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-500 disabled:opacity-50 smooth-transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete Account */}
          <div>
            {!showDeleteAccount ? (
              <button
                onClick={() => {
                  setShowDeleteAccount(true)
                  setError(null)
                  setSuccess(null)
                }}
                className="w-full text-left bg-red-900 hover:bg-red-800 p-4 rounded-lg smooth-transition border border-red-700 hover:border-red-600"
              >
                <h3 className="text-lg font-semibold text-red-200">Delete Account</h3>
                <p className="text-red-300 text-sm mt-1">This action cannot be undone. Please proceed with caution.</p>
              </button>
            ) : (
              <div className="bg-red-900 border border-red-700 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-red-200">Delete Account</h3>
                <p className="text-red-300 text-sm">
                  Are you sure you want to delete your account? This action cannot be undone and you will lose access to all your reservations.
                </p>
                <div>
                  <label className="block text-red-300 font-medium mb-2">Enter your password to confirm</label>
                  <input
                    type="password"
                    name="password"
                    value={deleteData.password}
                    onChange={handleDeleteChange}
                    placeholder="Enter your password"
                    className="w-full bg-red-800 text-red-100 border border-red-600 rounded px-4 py-2 focus:outline-none focus:border-red-500 placeholder-red-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex-1 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 smooth-transition font-medium"
                  >
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteAccount(false)
                      setDeleteData({ password: '' })
                    }}
                    disabled={loading}
                    className="flex-1 bg-red-800 text-red-200 px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 smooth-transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
