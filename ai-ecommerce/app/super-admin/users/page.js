// // app/super-admin/users/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import {
//   Users,
//   UserPlus,
//   UserCircle,
//   UserCheck,
//   UserX,
//   Mail,
//   Phone,
//   Calendar,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   AlertCircle,
//   Loader2,
//   Plus,
//   Search,
//   RefreshCw,
//   Edit,
//   Trash2,
//   Eye,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   MoreVertical,
//   Building2,
//   Shield,
//   ShieldCheck,
//   ShieldAlert,
//   ShieldOff,
//   Key,
//   Lock,
//   Unlock,
//   Fingerprint,
//   ScanFace,
//   QrCode,
//   Barcode,
//   Camera,
//   Video,
//   Mic,
//   Headphones,
//   Speaker,
//   Volume2,
//   Music,
//   Play,
//   Pause,
//   Stop,
//   SkipBack,
//   SkipForward,
//   Shuffle,
//   Repeat,
//   Heart,
//   ThumbsUp,
//   ThumbsDown,
//   Smile,
//   Frown,
//   Meh,
//   Laugh,
//   Angry,
//   Sad,
//   Surprise,
//   Ghost,
//   Robot,
//   Cat,
//   Dog,
//   Bird,
//   Fish,
//   Bug,
//   Leaf,
//   Tree,
//   Flower,
//   Mountain,
//   Sunset,
//   Sunrise,
//   Cloud,
//   CloudRain,
//   CloudSnow,
//   CloudLightning,
//   Wind,
//   Thermometer,
//   Droplets,
//   Eye as EyeIcon,
//   EyeOff,
//   Lock as LockIcon,
//   Unlock as UnlockIcon,
//   Key as KeyIcon,
//   Fingerprint as FingerprintIcon,
//   ScanFace as ScanFaceIcon,
//   QrCode as QrCodeIcon,
//   Barcode as BarcodeIcon,
//   Camera as CameraIcon,
//   Video as VideoIcon,
//   Mic as MicIcon,
//   Headphones as HeadphonesIcon,
//   Speaker as SpeakerIcon,
//   Volume2 as Volume2Icon,
//   Music as MusicIcon,
//   Play as PlayIcon,
//   Pause as PauseIcon,
//   Stop as StopIcon,
//   SkipBack as SkipBackIcon,
//   SkipForward as SkipForwardIcon,
//   Shuffle as ShuffleIcon,
//   Repeat as RepeatIcon,
//   Heart as HeartIcon,
//   ThumbsUp as ThumbsUpIcon,
//   ThumbsDown as ThumbsDownIcon,
//   Smile as SmileIcon,
//   Frown as FrownIcon,
//   Meh as MehIcon,
//   Laugh as LaughIcon,
//   Angry as AngryIcon,
//   Sad as SadIcon,
//   Surprise as SurpriseIcon,
//   Ghost as GhostIcon,
//   Robot as RobotIcon,
//   Cat as CatIcon,
//   Dog as DogIcon,
//   Bird as BirdIcon,
//   Fish as FishIcon,
//   Bug as BugIcon,
//   Leaf as LeafIcon,
//   Tree as TreeIcon,
//   Flower as FlowerIcon,
//   Mountain as MountainIcon,
//   Sunset as SunsetIcon,
//   Sunrise as SunriseIcon,
//   Cloud as CloudIcon,
//   CloudRain as CloudRainIcon,
//   CloudSnow as CloudSnowIcon,
//   CloudLightning as CloudLightningIcon,
//   Wind as WindIcon,
//   Thermometer as ThermometerIcon,
//   Droplets as DropletsIcon,
//   Save,
//   X,
//   Filter,
//   TrendingUp,
//   TrendingDown,
//   Activity,
//   Bell,
//   Settings,
//   LogOut,
//   Menu,
//   Sun,
//   Moon,
//   Home,
//   BarChart3,
//   PieChart,
//   LineChart,
//   FileText,
//   CreditCard,
//   Package,
//   ShoppingCart,
//   Calendar as CalendarIcon,
//   DollarSign,
//   Award,
//   Zap,
//   Globe,
//   MapPin,
//   Copy,
//   Check,
//   AlertTriangle,
//   Info,
//   HelpCircle,
//   Printer,
//   Share2,
//   Bookmark,
//   Star,
//   Database,
//   HardDrive,
//   Server,
//   Cpu,
//   Wifi,
//   Smartphone,
//   Tablet,
//   Laptop,
//   Monitor,
//   Watch,
//   Clock as ClockIcon,
//   Bell as BellIcon,
//   Settings as SettingsIcon,
//   LogOut as LogOutIcon,
//   Menu as MenuIcon,
//   Sun as SunIcon,
//   Moon as MoonIcon,
//   Home as HomeIcon,
// } from 'lucide-react';
// import { format, formatDistanceToNow } from 'date-fns';

// // ============== STATS CARD ==============
// const StatsCard = ({ title, value, icon: Icon, change, changeType, color, loading }) => {
//   if (loading) {
//     return (
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
//         <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
//         <div className="h-8 bg-gray-300 rounded w-32"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
//       <div className="flex items-center justify-between mb-4">
//         <div className={`p-3 rounded-lg bg-${color}-100`}>
//           <Icon className={`w-6 h-6 text-${color}-600`} />
//         </div>
//         {change !== undefined && (
//           <div className={`flex items-center text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
//             {changeType === 'positive' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
//             {Math.abs(change)}%
//           </div>
//         )}
//       </div>
//       <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
//       <p className="text-sm text-gray-600 mt-1">{title}</p>
//     </div>
//   );
// };

// // ============== USER CARD ==============
// const UserCard = ({ user, onView, onEdit, onToggleStatus, onDelete }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center">
//           <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
//             {user.fullName?.charAt(0).toUpperCase()}
//           </div>
//           <div className="ml-4">
//             <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
//             <p className="text-sm text-gray-500">{user.email}</p>
//           </div>
//         </div>
//         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//           user.status === 'active' ? 'bg-green-100 text-green-800' :
//           user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
//           user.status === 'suspended' ? 'bg-red-100 text-red-800' :
//           'bg-yellow-100 text-yellow-800'
//         }`}>
//           {user.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
//           {user.status === 'inactive' && <Clock className="w-3 h-3 mr-1" />}
//           {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
//           {user.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
//           {user.status}
//         </span>
//       </div>

//       <div className="space-y-3 mb-4">
//         <div className="flex items-center text-sm text-gray-600">
//           <Building2 className="w-4 h-4 mr-2 text-gray-400" />
//           {user.companyName || 'No Company'}
//         </div>
//         <div className="flex items-center text-sm text-gray-600">
//           <Mail className="w-4 h-4 mr-2 text-gray-400" />
//           {user.email}
//         </div>
//         <div className="flex items-center text-sm text-gray-600">
//           <Phone className="w-4 h-4 mr-2 text-gray-400" />
//           {user.phone || 'No phone'}
//         </div>
//         <div className="flex items-center text-sm text-gray-600">
//           <Shield className="w-4 h-4 mr-2 text-gray-400" />
//           Role: <span className="ml-1 font-medium text-gray-900 capitalize">{user.role}</span>
//         </div>
//         <div className="flex items-center text-sm text-gray-600">
//           <Calendar className="w-4 h-4 mr-2 text-gray-400" />
//           Joined: {format(new Date(user.createdAt), 'dd MMM yyyy')}
//         </div>
//         {user.lastLogin && (
//           <div className="flex items-center text-sm text-gray-600">
//             <Clock className="w-4 h-4 mr-2 text-gray-400" />
//             Last login: {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
//           </div>
//         )}
//       </div>

//       <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//         <div className="flex gap-2">
//           <button
//             onClick={() => onView(user)}
//             className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
//             title="View Details"
//           >
//             <Eye className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => onEdit(user)}
//             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//             title="Edit User"
//           >
//             <Edit className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => onToggleStatus(user)}
//             className={`p-2 rounded-lg ${
//               user.status === 'active'
//                 ? 'text-yellow-600 hover:bg-yellow-50'
//                 : 'text-green-600 hover:bg-green-50'
//             }`}
//             title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
//           >
//             {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
//           </button>
//           <button
//             onClick={() => onDelete(user)}
//             className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//             title="Delete User"
//           >
//             <Trash2 className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============== USER TABLE ROW ==============
// const UserTableRow = ({ user, onView, onEdit, onToggleStatus, onDelete, selected, onSelect }) => {
//   return (
//     <tr className="hover:bg-gray-50 transition-colors">
//       <td className="px-6 py-4 whitespace-nowrap">
//         <input
//           type="checkbox"
//           checked={selected}
//           onChange={(e) => onSelect(user.id, e.target.checked)}
//           className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//         />
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="flex items-center">
//           <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
//             <span className="text-sm font-medium text-indigo-600">
//               {user.fullName?.charAt(0).toUpperCase()}
//             </span>
//           </div>
//           <div className="ml-3">
//             <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
//             <p className="text-xs text-gray-500">{user.email}</p>
//           </div>
//         </div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">{user.companyName || '-'}</div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
//           {user.role}
//         </span>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//           user.status === 'active' ? 'bg-green-100 text-green-800' :
//           user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
//           user.status === 'suspended' ? 'bg-red-100 text-red-800' :
//           'bg-yellow-100 text-yellow-800'
//         }`}>
//           {user.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
//           {user.status === 'inactive' && <Clock className="w-3 h-3 mr-1" />}
//           {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
//           {user.status}
//         </span>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//         {user.phone || '-'}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//         {format(new Date(user.createdAt), 'dd MMM yyyy')}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//         {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-right">
//         <button onClick={() => onView(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">
//           <Eye className="w-4 h-4" />
//         </button>
//         <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-900 mr-3">
//           <Edit className="w-4 h-4" />
//         </button>
//         <button
//           onClick={() => onToggleStatus(user)}
//           className={`mr-3 ${
//             user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
//           }`}
//         >
//           {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
//         </button>
//         <button onClick={() => onDelete(user)} className="text-red-600 hover:text-red-900">
//           <Trash2 className="w-4 h-4" />
//         </button>
//       </td>
//     </tr>
//   );
// };

// // ============== ROLE CARD ==============
// const RoleCard = ({ role, onEdit, onDelete, onToggleStatus }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
//       <div className="flex items-start justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
//           <p className="text-sm text-gray-500 mt-1">{role.description}</p>
//         </div>
//         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//           role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           {role.isActive ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
//           {role.isActive ? 'Active' : 'Inactive'}
//         </span>
//       </div>

//       <div className="mb-4">
//         <p className="text-sm font-medium text-gray-700 mb-2">Users: {role.usersCount || 0}</p>
//         <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
//         <div className="flex flex-wrap gap-2">
//           {role.permissions?.slice(0, 5).map((perm, index) => (
//             <span key={index} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
//               {perm}
//             </span>
//           ))}
//           {role.permissions?.length > 5 && (
//             <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
//               +{role.permissions.length - 5} more
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//         <div className="flex gap-2">
//           <button
//             onClick={() => onEdit(role)}
//             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//             title="Edit Role"
//           >
//             <Edit className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => onToggleStatus(role)}
//             className={`p-2 rounded-lg ${
//               role.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
//             }`}
//             title={role.isActive ? 'Deactivate Role' : 'Activate Role'}
//           >
//             {role.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
//           </button>
//           <button
//             onClick={() => onDelete(role)}
//             className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//             title="Delete Role"
//           >
//             <Trash2 className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============== PERMISSION GROUP ==============
// const PermissionGroup = ({ title, permissions, selectedPermissions, onToggle }) => {
//   return (
//     <div className="border border-gray-200 rounded-lg p-4">
//       <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//         {permissions.map((perm) => (
//           <label key={perm.id} className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={selectedPermissions.includes(perm.id)}
//               onChange={(e) => onToggle(perm.id, e.target.checked)}
//               className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//             />
//             <span className="text-sm text-gray-700">{perm.name}</span>
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ============== ACTIVITY TIMELINE ==============
// const ActivityTimeline = ({ activities }) => {
//   return (
//     <div className="flow-root">
//       <ul className="-mb-8">
//         {activities.map((activity, index) => (
//           <li key={activity.id}>
//             <div className="relative pb-8">
//               {index < activities.length - 1 && (
//                 <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
//               )}
//               <div className="relative flex space-x-3">
//                 <div>
//                   <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
//                     activity.type === 'login' ? 'bg-green-500' :
//                     activity.type === 'logout' ? 'bg-gray-500' :
//                     activity.type === 'update' ? 'bg-blue-500' :
//                     activity.type === 'create' ? 'bg-purple-500' :
//                     'bg-yellow-500'
//                   }`}>
//                     {activity.type === 'login' && <LogIn className="w-4 h-4 text-white" />}
//                     {activity.type === 'logout' && <LogOut className="w-4 h-4 text-white" />}
//                     {activity.type === 'update' && <Edit className="w-4 h-4 text-white" />}
//                     {activity.type === 'create' && <Plus className="w-4 h-4 text-white" />}
//                     {activity.type === 'delete' && <Trash2 className="w-4 h-4 text-white" />}
//                   </span>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div>
//                     <p className="text-sm text-gray-900">{activity.description}</p>
//                     <p className="mt-0.5 text-xs text-gray-500">
//                       {format(new Date(activity.timestamp), 'dd MMM yyyy HH:mm')}
//                     </p>
//                   </div>
//                   {activity.ip && (
//                     <p className="mt-1 text-xs text-gray-400">IP: {activity.ip}</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// // ============== MAIN COMPONENT ==============
// export default function UsersPage() {
//   const router = useRouter();
//   const { data: session, status } = useSession();

//   // State
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('users'); // users, roles, permissions, activity

//   // Data states
//   const [users, setUsers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [permissions, setPermissions] = useState([]);
//   const [activities, setActivities] = useState([]);
//   const [companies, setCompanies] = useState([]);
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     activeUsers: 0,
//     pendingUsers: 0,
//     suspendedUsers: 0,
//     totalRoles: 0,
//     onlineNow: 0
//   });

//   // Modal states
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [showRoleModal, setShowRoleModal] = useState(false);
//   const [showPermissionModal, setShowPermissionModal] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [showBulkActionModal, setShowBulkActionModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedRole, setSelectedRole] = useState(null);
//   const [selectedUsers, setSelectedUsers] = useState([]);

//   // Form states
//   const [userForm, setUserForm] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//     role: 'user',
//     companyId: '',
//     status: 'active'
//   });

//   const [roleForm, setRoleForm] = useState({
//     name: '',
//     description: '',
//     permissions: [],
//     isActive: true
//   });

//   const [permissionForm, setPermissionForm] = useState({
//     name: '',
//     key: '',
//     group: '',
//     description: ''
//   });

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);
//   const [total, setTotal] = useState(0);

//   // Filters
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [companyFilter, setCompanyFilter] = useState('all');

//   // Auth check
//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/login');
//     }
//     if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
//       router.push('/dashboard');
//     }
//   }, [status, session, router]);

//   // Fetch data based on active tab
//   useEffect(() => {
//     fetchData();
//   }, [activeTab, page, search, statusFilter, roleFilter, companyFilter]);

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams({
//         type: activeTab,
//         page: page.toString(),
//         limit: limit.toString(),
//         ...(search && { search }),
//         ...(statusFilter !== 'all' && { status: statusFilter }),
//         ...(roleFilter !== 'all' && { role: roleFilter }),
//         ...(companyFilter !== 'all' && { companyId: companyFilter })
//       });

//       const response = await fetch(`/api/companies/users?${params}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to fetch data');
//       }

//       // Update state based on active tab
//       switch(activeTab) {
//         case 'users':
//           setUsers(data.data || []);
//           setStats(data.stats || {});
//           setTotal(data.pagination?.total || 0);
//           break;
//         case 'roles':
//           setRoles(data.data || []);
//           setStats(data.stats || {});
//           break;
//         case 'permissions':
//           setPermissions(data.data || []);
//           break;
//         case 'activity':
//           setActivities(data.data || []);
//           break;
//       }

//       // Fetch companies for dropdown
//       if (companies.length === 0) {
//         const companiesRes = await fetch('/api/companies?limit=100');
//         const companiesData = await companiesRes.json();
//         setCompanies(companiesData.data || []);
//       }
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // User CRUD operations
//   const handleCreateUser = async () => {
//     try {
//       if (userForm.password !== userForm.confirmPassword) {
//         alert('Passwords do not match');
//         return;
//       }

//       const response = await fetch('/api/companies/users', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           type: 'user',
//           ...userForm
//         })
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message);

//       setShowUserModal(false);
//       resetUserForm();
//       fetchData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleUpdateUser = async () => {
//     try {
//       const response = await fetch(`/api/companies/users`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           type: 'user',
//           id: selectedUser.id,
//           ...userForm
//         })
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message);

//       setShowUserModal(false);
//       setSelectedUser(null);
//       resetUserForm();
//       fetchData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleToggleUserStatus = async (user) => {
//     try {
//       const newStatus = user.status === 'active' ? 'suspended' : 'active';
      
//       const response = await fetch(`/api/companies/users`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           type: 'user',
//           id: user.id,
//           status: newStatus
//         })
//       });

//       if (!response.ok) throw new Error('Failed to update user status');
//       fetchData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleDeleteUser = async () => {
//     try {
//       const response = await fetch(`/api/companies/users`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           type: 'user',
//           id: selectedUser.id
//         })
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message);

//       setShowDeleteConfirm(false);
//       setSelectedUser(null);
//       fetchData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   // Bulk actions
//   const handleBulkAction = async (action) => {
//     if (selectedUsers.length === 0) return;

//     try {
//       const response = await fetch(`/api/companies/users`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           type: 'bulk',
//           action: action,
//           userIds: selectedUsers
//         })
//       });

//       if (!response.ok) throw new Error(`Failed to ${action} users`);
      
//       setSelectedUsers([]);
//       setShowBulkActionModal(false);
//       fetchData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   // Role CRUD operations
//   const handleCreateRole = async () => {
//     try {
//       const response = await fetch('/api/companies/users', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           type: 'role',
//           ...roleForm
//         })
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message);

//       setShowRoleModal(false);
//       resetRoleForm();
//       fetchData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleUpdateRole = async () => {
//     try {
//       const response = await fetch(`/api/companies/users`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           type: 'role',
//           id: selectedRole.id,
//           ...roleForm
//         })
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message);

//       setShowRoleModal(false);
//       setSelectedRole(null);
//       resetRoleForm();
//       fetchData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleDeleteRole = async () => {
//     try {
//       const response = await fetch(`/api/companies/users`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           type: 'role',
//           id: selectedRole.id
//         })
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message);

//       setShowDeleteConfirm(false);
//       setSelectedRole(null);
//       fetchData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   // Permission helpers
//   const handleTogglePermission = (permId, checked) => {
//     if (checked) {
//       setRoleForm({
//         ...roleForm,
//         permissions: [...roleForm.permissions, permId]
//       });
//     } else {
//       setRoleForm({
//         ...roleForm,
//         permissions: roleForm.permissions.filter(id => id !== permId)
//       });
//     }
//   };

//   // Reset forms
//   const resetUserForm = () => {
//     setUserForm({
//       fullName: '',
//       email: '',
//       phone: '',
//       password: '',
//       confirmPassword: '',
//       role: 'user',
//       companyId: '',
//       status: 'active'
//     });
//   };

//   const resetRoleForm = () => {
//     setRoleForm({
//       name: '',
//       description: '',
//       permissions: [],
//       isActive: true
//     });
//   };

//   // Select all users
//   const handleSelectAll = (checked) => {
//     if (checked) {
//       setSelectedUsers(users.map(u => u.id));
//     } else {
//       setSelectedUsers([]);
//     }
//   };

//   const handleSelectUser = (userId, checked) => {
//     if (checked) {
//       setSelectedUsers([...selectedUsers, userId]);
//     } else {
//       setSelectedUsers(selectedUsers.filter(id => id !== userId));
//     }
//   };

//   const tabs = [
//     { id: 'users', label: 'Users', icon: Users, count: stats.totalUsers },
//     { id: 'roles', label: 'Roles', icon: Shield, count: stats.totalRoles },
//     { id: 'permissions', label: 'Permissions', icon: Key, count: permissions.length },
//     { id: 'activity', label: 'Activity Log', icon: Activity, count: activities.length }
//   ];

//   const permissionGroups = {
//     users: [
//       { id: 'users.view', name: 'View Users' },
//       { id: 'users.create', name: 'Create Users' },
//       { id: 'users.edit', name: 'Edit Users' },
//       { id: 'users.delete', name: 'Delete Users' },
//       { id: 'users.manage', name: 'Manage Users' }
//     ],
//     companies: [
//       { id: 'companies.view', name: 'View Companies' },
//       { id: 'companies.create', name: 'Create Companies' },
//       { id: 'companies.edit', name: 'Edit Companies' },
//       { id: 'companies.delete', name: 'Delete Companies' },
//       { id: 'companies.manage', name: 'Manage Companies' }
//     ],
//     products: [
//       { id: 'products.view', name: 'View Products' },
//       { id: 'products.create', name: 'Create Products' },
//       { id: 'products.edit', name: 'Edit Products' },
//       { id: 'products.delete', name: 'Delete Products' },
//       { id: 'products.manage', name: 'Manage Products' }
//     ],
//     orders: [
//       { id: 'orders.view', name: 'View Orders' },
//       { id: 'orders.create', name: 'Create Orders' },
//       { id: 'orders.edit', name: 'Edit Orders' },
//       { id: 'orders.delete', name: 'Delete Orders' },
//       { id: 'orders.manage', name: 'Manage Orders' }
//     ],
//     subscriptions: [
//       { id: 'subscriptions.view', name: 'View Subscriptions' },
//       { id: 'subscriptions.edit', name: 'Edit Subscriptions' },
//       { id: 'subscriptions.cancel', name: 'Cancel Subscriptions' },
//       { id: 'subscriptions.manage', name: 'Manage Subscriptions' }
//     ],
//     settings: [
//       { id: 'settings.view', name: 'View Settings' },
//       { id: 'settings.edit', name: 'Edit Settings' },
//       { id: 'settings.manage', name: 'Manage Settings' }
//     ]
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center">
//               <button
//                 onClick={() => router.push('/super-admin/dashboard')}
//                 className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <ChevronLeft className="w-5 h-5 text-gray-600" />
//               </button>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">User Management</h1>
//                 <p className="text-sm text-gray-500">Manage users, roles, permissions & activity</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               {activeTab === 'users' && (
//                 <>
//                   {selectedUsers.length > 0 && (
//                     <button
//                       onClick={() => setShowBulkActionModal(true)}
//                       className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center text-sm"
//                     >
//                       <Users className="w-4 h-4 mr-2" />
//                       Bulk Actions ({selectedUsers.length})
//                     </button>
//                   )}
//                   <button
//                     onClick={() => {
//                       resetUserForm();
//                       setSelectedUser(null);
//                       setShowUserModal(true);
//                     }}
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center text-sm"
//                   >
//                     <UserPlus className="w-4 h-4 mr-2" />
//                     Add User
//                   </button>
//                 </>
//               )}
//               {activeTab === 'roles' && (
//                 <button
//                   onClick={() => {
//                     resetRoleForm();
//                     setSelectedRole(null);
//                     setShowRoleModal(true);
//                   }}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center text-sm"
//                 >
//                   <Shield className="w-4 h-4 mr-2" />
//                   Create Role
//                 </button>
//               )}
//               <button
//                 onClick={fetchData}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//                 disabled={loading}
//               >
//                 <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <StatsCard
//             title="Total Users"
//             value={stats.totalUsers}
//             icon={Users}
//             change={12.5}
//             changeType="positive"
//             color="indigo"
//             loading={loading}
//           />
//           <StatsCard
//             title="Active Users"
//             value={stats.activeUsers}
//             icon={UserCheck}
//             change={8.3}
//             changeType="positive"
//             color="green"
//             loading={loading}
//           />
//           <StatsCard
//             title="Online Now"
//             value={stats.onlineNow}
//             icon={Activity}
//             color="purple"
//             loading={loading}
//           />
//           <StatsCard
//             title="Total Roles"
//             value={stats.totalRoles}
//             icon={Shield}
//             color="blue"
//             loading={loading}
//           />
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
//           <div className="border-b border-gray-200">
//             <nav className="flex overflow-x-auto px-6" aria-label="Tabs">
//               {tabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`
//                       py-4 px-6 inline-flex items-center border-b-2 font-medium text-sm whitespace-nowrap transition-colors
//                       ${activeTab === tab.id
//                         ? 'border-indigo-600 text-indigo-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                       }
//                     `}
//                   >
//                     <Icon className="w-5 h-5 mr-2" />
//                     {tab.label}
//                     {tab.count > 0 && (
//                       <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
//                         activeTab === tab.id
//                           ? 'bg-indigo-100 text-indigo-600'
//                           : 'bg-gray-100 text-gray-600'
//                       }`}>
//                         {tab.count}
//                       </span>
//                     )}
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>

//           {/* Filters */}
//           <div className="p-4 border-b border-gray-200 bg-gray-50">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder={`Search ${activeTab}...`}
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
//                 />
//               </div>
//               {activeTab === 'users' && (
//                 <>
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                     <option value="suspended">Suspended</option>
//                     <option value="pending">Pending</option>
//                   </select>
//                   <select
//                     value={roleFilter}
//                     onChange={(e) => setRoleFilter(e.target.value)}
//                     className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="all">All Roles</option>
//                     {roles.map(role => (
//                       <option key={role.id} value={role.name}>{role.name}</option>
//                     ))}
//                   </select>
//                   <select
//                     value={companyFilter}
//                     onChange={(e) => setCompanyFilter(e.target.value)}
//                     className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="all">All Companies</option>
//                     {companies.map(company => (
//                       <option key={company.id} value={company.id}>{company.name}</option>
//                     ))}
//                   </select>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className="p-4 bg-red-50 border-b border-red-200">
//               <div className="flex items-center">
//                 <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
//                 <p className="text-sm text-red-600">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Content Area */}
//           <div className="p-6">
//             {loading ? (
//               <div className="flex items-center justify-center py-12">
//                 <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
//               </div>
//             ) : (
//               <>
//                 {/* Users Grid/Table */}
//                 {activeTab === 'users' && (
//                   <>
//                     {/* Mobile Grid View */}
//                     <div className="lg:hidden grid grid-cols-1 gap-4">
//                       {users.length === 0 ? (
//                         <div className="text-center py-12">
//                           <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                           <p className="text-gray-500">No users found</p>
//                         </div>
//                       ) : (
//                         users.map(user => (
//                           <UserCard
//                             key={user.id}
//                             user={user}
//                             onView={(u) => {
//                               setSelectedUser(u);
//                               setActiveTab('activity');
//                             }}
//                             onEdit={(u) => {
//                               setSelectedUser(u);
//                               setUserForm({
//                                 fullName: u.fullName,
//                                 email: u.email,
//                                 phone: u.phone || '',
//                                 role: u.role,
//                                 companyId: u.companyId || '',
//                                 status: u.status
//                               });
//                               setShowUserModal(true);
//                             }}
//                             onToggleStatus={handleToggleUserStatus}
//                             onDelete={(u) => {
//                               setSelectedUser(u);
//                               setShowDeleteConfirm(true);
//                             }}
//                           />
//                         ))
//                       )}
//                     </div>

//                     {/* Desktop Table View */}
//                     <div className="hidden lg:block overflow-x-auto">
//                       <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-6 py-3 text-left">
//                               <input
//                                 type="checkbox"
//                                 checked={selectedUsers.length === users.length && users.length > 0}
//                                 onChange={(e) => handleSelectAll(e.target.checked)}
//                                 className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                               />
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
//                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                           {users.length === 0 ? (
//                             <tr>
//                               <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
//                                 No users found
//                               </td>
//                             </tr>
//                           ) : (
//                             users.map(user => (
//                               <UserTableRow
//                                 key={user.id}
//                                 user={user}
//                                 selected={selectedUsers.includes(user.id)}
//                                 onSelect={handleSelectUser}
//                                 onView={(u) => {
//                                   setSelectedUser(u);
//                                   setActiveTab('activity');
//                                 }}
//                                 onEdit={(u) => {
//                                   setSelectedUser(u);
//                                   setUserForm({
//                                     fullName: u.fullName,
//                                     email: u.email,
//                                     phone: u.phone || '',
//                                     role: u.role,
//                                     companyId: u.companyId || '',
//                                     status: u.status
//                                   });
//                                   setShowUserModal(true);
//                                 }}
//                                 onToggleStatus={handleToggleUserStatus}
//                                 onDelete={(u) => {
//                                   setSelectedUser(u);
//                                   setShowDeleteConfirm(true);
//                                 }}
//                               />
//                             ))
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   </>
//                 )}

//                 {/* Roles Grid */}
//                 {activeTab === 'roles' && (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {roles.length === 0 ? (
//                       <div className="col-span-full text-center py-12">
//                         <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                         <p className="text-gray-500">No roles found</p>
//                         <button
//                           onClick={() => {
//                             resetRoleForm();
//                             setSelectedRole(null);
//                             setShowRoleModal(true);
//                           }}
//                           className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center"
//                         >
//                           <Shield className="w-4 h-4 mr-2" />
//                           Create First Role
//                         </button>
//                       </div>
//                     ) : (
//                       roles.map(role => (
//                         <RoleCard
//                           key={role.id}
//                           role={role}
//                           onEdit={(r) => {
//                             setSelectedRole(r);
//                             setRoleForm({
//                               name: r.name,
//                               description: r.description || '',
//                               permissions: r.permissions || [],
//                               isActive: r.isActive
//                             });
//                             setShowRoleModal(true);
//                           }}
//                           onDelete={(r) => {
//                             setSelectedRole(r);
//                             setShowDeleteConfirm(true);
//                           }}
//                           onToggleStatus={async (r) => {
//                             try {
//                               await fetch(`/api/companies/users`, {
//                                 method: 'PUT',
//                                 headers: { 'Content-Type': 'application/json' },
//                                 body: JSON.stringify({
//                                   type: 'role',
//                                   id: r.id,
//                                   isActive: !r.isActive
//                                 })
//                               });
//                               fetchData();
//                             } catch (err) {
//                               alert(err.message);
//                             }
//                           }}
//                         />
//                       ))
//                     )}
//                   </div>
//                 )}

//                 {/* Permissions Grid */}
//                 {activeTab === 'permissions' && (
//                   <div>
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       {Object.entries(permissionGroups).map(([group, perms]) => (
//                         <PermissionGroup
//                           key={group}
//                           title={group.charAt(0).toUpperCase() + group.slice(1)}
//                           permissions={perms}
//                           selectedPermissions={[]}
//                           onToggle={() => {}}
//                         />
//                       ))}
//                     </div>
//                     <div className="mt-6 flex justify-end">
//                       <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
//                         Save Permissions
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Activity Log */}
//                 {activeTab === 'activity' && (
//                   <div>
//                     {selectedUser && (
//                       <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//                         <div className="flex items-center">
//                           <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
//                             <span className="text-lg font-medium text-indigo-600">
//                               {selectedUser.fullName?.charAt(0).toUpperCase()}
//                             </span>
//                           </div>
//                           <div className="ml-4">
//                             <h3 className="text-lg font-medium text-gray-900">{selectedUser.fullName}</h3>
//                             <p className="text-sm text-gray-500">{selectedUser.email}</p>
//                           </div>
//                           <button
//                             onClick={() => setSelectedUser(null)}
//                             className="ml-auto p-2 hover:bg-gray-200 rounded-lg"
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                     {activities.length === 0 ? (
//                       <div className="text-center py-12">
//                         <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                         <p className="text-gray-500">No activity found</p>
//                       </div>
//                     ) : (
//                       <ActivityTimeline activities={activities} />
//                     )}
//                   </div>
//                 )}

//                 {/* Pagination */}
//                 {total > limit && activeTab === 'users' && (
//                   <div className="mt-6 flex items-center justify-between">
//                     <p className="text-sm text-gray-700">
//                       Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
//                     </p>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => setPage(p => Math.max(1, p - 1))}
//                         disabled={page === 1}
//                         className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
//                       >
//                         <ChevronLeft className="w-5 h-5" />
//                       </button>
//                       <span className="px-3 py-1 text-sm">Page {page}</span>
//                       <button
//                         onClick={() => setPage(p => p + 1)}
//                         disabled={page * limit >= total}
//                         className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
//                       >
//                         <ChevronRight className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* User Modal */}
//       {showUserModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-bold text-gray-900">
//                 {selectedUser ? 'Edit User' : 'Create New User'}
//               </h2>
//             </div>
//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
//                   <input
//                     type="text"
//                     value={userForm.fullName}
//                     onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     placeholder="John Doe"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input
//                     type="email"
//                     value={userForm.email}
//                     onChange={(e) => setUserForm({...userForm, email: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     placeholder="john@example.com"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                   <input
//                     type="tel"
//                     value={userForm.phone}
//                     onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     placeholder="9876543210"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
//                   <select
//                     value={userForm.companyId}
//                     onChange={(e) => setUserForm({...userForm, companyId: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="">Select Company</option>
//                     {companies.map(company => (
//                       <option key={company.id} value={company.id}>{company.name}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
//                   <select
//                     value={userForm.role}
//                     onChange={(e) => setUserForm({...userForm, role: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="user">User</option>
//                     <option value="manager">Manager</option>
//                     <option value="admin">Admin</option>
//                     {roles.map(role => (
//                       <option key={role.id} value={role.name}>{role.name}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                   <select
//                     value={userForm.status}
//                     onChange={(e) => setUserForm({...userForm, status: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                     <option value="pending">Pending</option>
//                     <option value="suspended">Suspended</option>
//                   </select>
//                 </div>
//                 {!selectedUser && (
//                   <>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                       <input
//                         type="password"
//                         value={userForm.password}
//                         onChange={(e) => setUserForm({...userForm, password: e.target.value})}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         placeholder="••••••••"
//                         required={!selectedUser}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
//                       <input
//                         type="password"
//                         value={userForm.confirmPassword}
//                         onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         placeholder="••••••••"
//                         required={!selectedUser}
//                       />
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//             <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
//               <button
//                 onClick={() => {
//                   setShowUserModal(false);
//                   setSelectedUser(null);
//                   resetUserForm();
//                 }}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={selectedUser ? handleUpdateUser : handleCreateUser}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//               >
//                 {selectedUser ? 'Update User' : 'Create User'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Role Modal */}
//       {showRoleModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-bold text-gray-900">
//                 {selectedRole ? 'Edit Role' : 'Create New Role'}
//               </h2>
//             </div>
//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-1 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
//                   <input
//                     type="text"
//                     value={roleForm.name}
//                     onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     placeholder="e.g., Manager, Editor, Viewer"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                   <textarea
//                     value={roleForm.description}
//                     onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
//                     rows={3}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     placeholder="Role description..."
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
//                   <div className="space-y-4 max-h-96 overflow-y-auto">
//                     {Object.entries(permissionGroups).map(([group, perms]) => (
//                       <PermissionGroup
//                         key={group}
//                         title={group.charAt(0).toUpperCase() + group.slice(1)}
//                         permissions={perms}
//                         selectedPermissions={roleForm.permissions}
//                         onToggle={handleTogglePermission}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="roleActive"
//                     checked={roleForm.isActive}
//                     onChange={(e) => setRoleForm({...roleForm, isActive: e.target.checked})}
//                     className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                   />
//                   <label htmlFor="roleActive" className="ml-2 text-sm text-gray-700">
//                     Active (role can be assigned to users)
//                   </label>
//                 </div>
//               </div>
//             </div>
//             <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
//               <button
//                 onClick={() => {
//                   setShowRoleModal(false);
//                   setSelectedRole(null);
//                   resetRoleForm();
//                 }}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={selectedRole ? handleUpdateRole : handleCreateRole}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//               >
//                 {selectedRole ? 'Update Role' : 'Create Role'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteConfirm && (selectedUser || selectedRole) && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//             <div className="p-6">
//               <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
//                 <AlertTriangle className="w-6 h-6 text-red-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
//                 Delete {selectedUser ? 'User' : 'Role'}
//               </h3>
//               <p className="text-sm text-gray-500 text-center mb-6">
//                 Are you sure you want to delete "{selectedUser?.fullName || selectedRole?.name}"? This action cannot be undone.
//               </p>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowDeleteConfirm(false)}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={selectedUser ? handleDeleteUser : handleDeleteRole}
//                   className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk Action Modal */}
//       {showBulkActionModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//             <div className="p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
//               <p className="text-sm text-gray-500 mb-4">
//                 {selectedUsers.length} users selected
//               </p>
//               <div className="space-y-2">
//                 <button
//                   onClick={() => handleBulkAction('activate')}
//                   className="w-full p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
//                 >
//                   <CheckCircle2 className="w-4 h-4 mr-3 text-green-600" />
//                   Activate Selected Users
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction('suspend')}
//                   className="w-full p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
//                 >
//                   <XCircle className="w-4 h-4 mr-3 text-yellow-600" />
//                   Suspend Selected Users
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction('delete')}
//                   className="w-full p-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
//                 >
//                   <Trash2 className="w-4 h-4 mr-3" />
//                   Delete Selected Users
//                 </button>
//               </div>
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={() => setShowBulkActionModal(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }























// app/super-admin/users/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { appTheme } from '../../../src/constants/theme';
import {
  Users,
  UserPlus,
  UserCircle,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Building2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Key,
  Lock,
  Unlock,
  Fingerprint,
  ScanFace,
  QrCode,
  Barcode,
  Camera,
  Video,
  Mic,
  Headphones,
  Speaker,
  Volume2,
  Music,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Sad,
  Surprise,
  Ghost,
  Robot,
  Cat,
  Dog,
  Bird,
  Fish,
  Bug,
  Leaf,
  Tree,
  Flower,
  Mountain,
  Sunset,
  Sunrise,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Eye as EyeIcon,
  EyeOff,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key as KeyIcon,
  Fingerprint as FingerprintIcon,
  ScanFace as ScanFaceIcon,
  QrCode as QrCodeIcon,
  Barcode as BarcodeIcon,
  Camera as CameraIcon,
  Video as VideoIcon,
  Mic as MicIcon,
  Headphones as HeadphonesIcon,
  Speaker as SpeakerIcon,
  Volume2 as Volume2Icon,
  Music as MusicIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  SkipBack as SkipBackIcon,
  SkipForward as SkipForwardIcon,
  Shuffle as ShuffleIcon,
  Repeat as RepeatIcon,
  Heart as HeartIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  Smile as SmileIcon,
  Frown as FrownIcon,
  Meh as MehIcon,
  Laugh as LaughIcon,
  Angry as AngryIcon,
  Sad as SadIcon,
  Surprise as SurpriseIcon,
  Ghost as GhostIcon,
  Robot as RobotIcon,
  Cat as CatIcon,
  Dog as DogIcon,
  Bird as BirdIcon,
  Fish as FishIcon,
  Bug as BugIcon,
  Leaf as LeafIcon,
  Tree as TreeIcon,
  Flower as FlowerIcon,
  Mountain as MountainIcon,
  Sunset as SunsetIcon,
  Sunrise as SunriseIcon,
  Cloud as CloudIcon,
  CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon,
  CloudLightning as CloudLightningIcon,
  Wind as WindIcon,
  Thermometer as ThermometerIcon,
  Droplets as DropletsIcon,
  Save,
  X,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Home,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  CreditCard,
  Package,
  ShoppingCart,
  Calendar as CalendarIcon,
  DollarSign,
  Award,
  Zap,
  Globe,
  MapPin,
  Copy,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  Printer,
  Share2,
  Bookmark,
  Star,
  Database,
  HardDrive,
  Server,
  Cpu,
  Wifi,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Watch,
  Clock as ClockIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Home as HomeIcon,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// ============== STATS CARD ==============
const StatsCard = ({ title, value, icon: Icon, change, changeType, color, loading, appTheme }) => {
  if (loading) {
    return (
      <div className="rounded-xl shadow-sm border p-6 animate-pulse" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
        <div className="h-4 rounded w-24 mb-4" style={{ backgroundColor: appTheme.colors.border }}></div>
        <div className="h-8 rounded w-32" style={{ backgroundColor: appTheme.colors.border }}></div>
      </div>
    );
  }

  const changeColor = changeType === 'positive' ? appTheme.colors.success : appTheme.colors.error;
  
  return (
    <div className="rounded-xl shadow-sm border p-6 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
        {change !== undefined && (
          <div className="flex items-center text-sm" style={{ color: changeColor }}>
            {changeType === 'positive' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
      <p className="text-sm mt-1" style={{ color: appTheme.colors.textSecondary }}>{title}</p>
    </div>
  );
};

// ============== USER CARD ==============
const UserCard = ({ user, onView, onEdit, onToggleStatus, onDelete, appTheme }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: appTheme.colors.successLight || '#d1fae5', text: appTheme.colors.success || '#10b981' };
      case 'inactive': return { bg: '#f3f4f6', text: appTheme.colors.textSecondary || '#6b7280' };
      case 'suspended': return { bg: appTheme.colors.errorLight || '#fee2e2', text: appTheme.colors.error || '#ef4444' };
      default: return { bg: appTheme.colors.warningLight || '#fef3c7', text: appTheme.colors.warning || '#f59e0b' };
    }
  };
  
  const statusColors = getStatusColor(user.status);
  
  return (
    <div className="rounded-xl shadow-sm border p-6 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundImage: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})` }}>
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold" style={{ color: appTheme.colors.textPrimary }}>{user.fullName}</h3>
            <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>{user.email}</p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
          {user.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
          {user.status === 'inactive' && <Clock className="w-3 h-3 mr-1" />}
          {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
          {user.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
          {user.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary }}>
          <Building2 className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
          {user.companyName || 'No Company'}
        </div>
        <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary }}>
          <Mail className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
          {user.email}
        </div>
        <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary }}>
          <Phone className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
          {user.phone || 'No phone'}
        </div>
        <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary }}>
          <Shield className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
          Role: <span className="ml-1 font-medium" style={{ color: appTheme.colors.textPrimary }}>{user.role}</span>
        </div>
        <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary }}>
          <Calendar className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
          Joined: {format(new Date(user.createdAt), 'dd MMM yyyy')}
        </div>
        {user.lastLogin && (
          <div className="flex items-center text-sm" style={{ color: appTheme.colors.textSecondary }}>
            <Clock className="w-4 h-4 mr-2" style={{ color: appTheme.colors.textTertiary }} />
            Last login: {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: appTheme.colors.borderLight }}>
        <div className="flex gap-2">
          <button
            onClick={() => onView(user)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: appTheme.colors.primary }}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: appTheme.colors.info }}
            title="Edit User"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(user)}
            className={`p-2 rounded-lg transition-colors`}
            style={{ color: user.status === 'active' ? appTheme.colors.warning : appTheme.colors.success }}
            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
          >
            {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: appTheme.colors.error }}
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== USER TABLE ROW ==============
const UserTableRow = ({ user, onView, onEdit, onToggleStatus, onDelete, selected, onSelect, appTheme }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: appTheme.colors.successLight || '#d1fae5', text: appTheme.colors.success || '#10b981' };
      case 'inactive': return { bg: '#f3f4f6', text: appTheme.colors.textSecondary || '#6b7280' };
      case 'suspended': return { bg: appTheme.colors.errorLight || '#fee2e2', text: appTheme.colors.error || '#ef4444' };
      default: return { bg: appTheme.colors.warningLight || '#fef3c7', text: appTheme.colors.warning || '#f59e0b' };
    }
  };
  
  const statusColors = getStatusColor(user.status);
  
  return (
    <tr className="transition-colors" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(user.id, e.target.checked)}
          className="w-4 h-4 rounded focus:ring-indigo-500"
          style={{ accentColor: appTheme.colors.primary }}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${appTheme.colors.primary}20` }}>
            <span className="text-sm font-medium" style={{ color: appTheme.colors.primary }}>
              {user.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium" style={{ color: appTheme.colors.textPrimary }}>{user.fullName}</p>
            <p className="text-xs" style={{ color: appTheme.colors.textSecondary }}>{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm" style={{ color: appTheme.colors.textPrimary }}>{user.companyName || '-'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-3 py-1 rounded-full text-xs font-medium capitalize" style={{ backgroundColor: `${appTheme.colors.primary}20`, color: appTheme.colors.primary }}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
          {user.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
          {user.status === 'inactive' && <Clock className="w-3 h-3 mr-1" />}
          {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: appTheme.colors.textSecondary }}>
        {user.phone || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: appTheme.colors.textSecondary }}>
        {format(new Date(user.createdAt), 'dd MMM yyyy')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: appTheme.colors.textSecondary }}>
        {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button onClick={() => onView(user)} className="mr-3" style={{ color: appTheme.colors.primary }}>
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => onEdit(user)} className="mr-3" style={{ color: appTheme.colors.info }}>
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggleStatus(user)}
          className="mr-3"
          style={{ color: user.status === 'active' ? appTheme.colors.warning : appTheme.colors.success }}
        >
          {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
        <button onClick={() => onDelete(user)} style={{ color: appTheme.colors.error }}>
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

// ============== ROLE CARD ==============
const RoleCard = ({ role, onEdit, onDelete, onToggleStatus, appTheme }) => {
  return (
    <div className="rounded-xl shadow-sm border p-6 hover:shadow-md transition-all" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: appTheme.colors.textPrimary }}>{role.name}</h3>
          <p className="text-sm mt-1" style={{ color: appTheme.colors.textSecondary }}>{role.description}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`} style={{ backgroundColor: role.isActive ? `${appTheme.colors.success}20` : `${appTheme.colors.error}20`, color: role.isActive ? appTheme.colors.success : appTheme.colors.error }}>
          {role.isActive ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
          {role.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium mb-2" style={{ color: appTheme.colors.textPrimary }}>Users: {role.usersCount || 0}</p>
        <p className="text-sm font-medium mb-2" style={{ color: appTheme.colors.textPrimary }}>Permissions:</p>
        <div className="flex flex-wrap gap-2">
          {role.permissions?.slice(0, 5).map((perm, index) => (
            <span key={index} className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: appTheme.colors.borderLight, color: appTheme.colors.textSecondary }}>
              {perm}
            </span>
          ))}
          {role.permissions?.length > 5 && (
            <span className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: appTheme.colors.borderLight, color: appTheme.colors.textSecondary }}>
              +{role.permissions.length - 5} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: appTheme.colors.borderLight }}>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(role)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: appTheme.colors.info }}
            title="Edit Role"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(role)}
            className={`p-2 rounded-lg transition-colors`}
            style={{ color: role.isActive ? appTheme.colors.warning : appTheme.colors.success }}
            title={role.isActive ? 'Deactivate Role' : 'Activate Role'}
          >
            {role.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(role)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: appTheme.colors.error }}
            title="Delete Role"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== PERMISSION GROUP ==============
const PermissionGroup = ({ title, permissions, selectedPermissions, onToggle, appTheme }) => {
  return (
    <div className="border rounded-lg p-4" style={{ borderColor: appTheme.colors.border }}>
      <h4 className="text-sm font-medium mb-3" style={{ color: appTheme.colors.textPrimary }}>{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {permissions.map((perm) => (
          <label key={perm.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedPermissions.includes(perm.id)}
              onChange={(e) => onToggle(perm.id, e.target.checked)}
              className="w-4 h-4 rounded focus:ring-indigo-500"
              style={{ accentColor: appTheme.colors.primary }}
            />
            <span className="text-sm" style={{ color: appTheme.colors.textSecondary }}>{perm.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// ============== ACTIVITY TIMELINE ==============
const ActivityTimeline = ({ activities, appTheme }) => {
  const getActivityColor = (type) => {
    switch(type) {
      case 'login': return appTheme.colors.success;
      case 'logout': return appTheme.colors.textSecondary;
      case 'update': return appTheme.colors.info;
      case 'create': return appTheme.colors.primary;
      case 'delete': return appTheme.colors.error;
      default: return appTheme.colors.warning;
    }
  };
  
  const getActivityIcon = (type) => {
    switch(type) {
      case 'login': return LogOut;
      case 'logout': return LogOut;
      case 'update': return Edit;
      case 'create': return Plus;
      case 'delete': return Trash2;
      default: return Activity;
    }
  };
  
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const activityColor = getActivityColor(activity.type);
          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index < activities.length - 1 && (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5" style={{ backgroundColor: appTheme.colors.borderLight }} aria-hidden="true"></span>
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white" style={{ backgroundColor: activityColor, ringColor: appTheme.colors.backgroundCard }}>
                      <Icon className="w-4 h-4 text-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div>
                      <p className="text-sm" style={{ color: appTheme.colors.textPrimary }}>{activity.description}</p>
                      <p className="mt-0.5 text-xs" style={{ color: appTheme.colors.textSecondary }}>
                        {format(new Date(activity.timestamp), 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                    {activity.ip && (
                      <p className="mt-1 text-xs" style={{ color: appTheme.colors.textTertiary }}>IP: {activity.ip}</p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ============== MAIN COMPONENT ==============
export default function UsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // users, roles, permissions, activity

  // Data states
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0,
    totalRoles: 0,
    onlineNow: 0
  });

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Form states
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    companyId: '',
    status: 'active'
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [],
    isActive: true
  });

  const [permissionForm, setPermissionForm] = useState({
    name: '',
    key: '',
    group: '',
    description: ''
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab, page, search, statusFilter, roleFilter, companyFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type: activeTab,
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(companyFilter !== 'all' && { companyId: companyFilter })
      });

      const response = await fetch(`/api/companies/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch data');
      }

      // Update state based on active tab
      switch(activeTab) {
        case 'users':
          setUsers(data.data || []);
          setStats(data.stats || {});
          setTotal(data.pagination?.total || 0);
          break;
        case 'roles':
          setRoles(data.data || []);
          setStats(data.stats || {});
          break;
        case 'permissions':
          setPermissions(data.data || []);
          break;
        case 'activity':
          setActivities(data.data || []);
          break;
      }

      // Fetch companies for dropdown
      if (companies.length === 0) {
        const companiesRes = await fetch('/api/companies?limit=100');
        const companiesData = await companiesRes.json();
        setCompanies(companiesData.data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // User CRUD operations
  const handleCreateUser = async () => {
    try {
      if (userForm.password !== userForm.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      const response = await fetch('/api/companies/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          ...userForm
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowUserModal(false);
      resetUserForm();
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`/api/companies/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          id: selectedUser.id,
          ...userForm
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowUserModal(false);
      setSelectedUser(null);
      resetUserForm();
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      
      const response = await fetch(`/api/companies/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          id: user.id,
          status: newStatus
        })
      });

      if (!response.ok) throw new Error('Failed to update user status');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`/api/companies/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          id: selectedUser.id
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowDeleteConfirm(false);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch(`/api/companies/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bulk',
          action: action,
          userIds: selectedUsers
        })
      });

      if (!response.ok) throw new Error(`Failed to ${action} users`);
      
      setSelectedUsers([]);
      setShowBulkActionModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Role CRUD operations
  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/companies/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'role',
          ...roleForm
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowRoleModal(false);
      resetRoleForm();
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateRole = async () => {
    try {
      const response = await fetch(`/api/companies/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'role',
          id: selectedRole.id,
          ...roleForm
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowRoleModal(false);
      setSelectedRole(null);
      resetRoleForm();
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteRole = async () => {
    try {
      const response = await fetch(`/api/companies/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'role',
          id: selectedRole.id
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowDeleteConfirm(false);
      setSelectedRole(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Permission helpers
  const handleTogglePermission = (permId, checked) => {
    if (checked) {
      setRoleForm({
        ...roleForm,
        permissions: [...roleForm.permissions, permId]
      });
    } else {
      setRoleForm({
        ...roleForm,
        permissions: roleForm.permissions.filter(id => id !== permId)
      });
    }
  };

  // Reset forms
  const resetUserForm = () => {
    setUserForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      companyId: '',
      status: 'active'
    });
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
      isActive: true
    });
  };

  // Select all users
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, count: stats.totalUsers },
    { id: 'roles', label: 'Roles', icon: Shield, count: stats.totalRoles },
    { id: 'permissions', label: 'Permissions', icon: Key, count: permissions.length },
    { id: 'activity', label: 'Activity Log', icon: Activity, count: activities.length }
  ];

  const permissionGroups = {
    users: [
      { id: 'users.view', name: 'View Users' },
      { id: 'users.create', name: 'Create Users' },
      { id: 'users.edit', name: 'Edit Users' },
      { id: 'users.delete', name: 'Delete Users' },
      { id: 'users.manage', name: 'Manage Users' }
    ],
    companies: [
      { id: 'companies.view', name: 'View Companies' },
      { id: 'companies.create', name: 'Create Companies' },
      { id: 'companies.edit', name: 'Edit Companies' },
      { id: 'companies.delete', name: 'Delete Companies' },
      { id: 'companies.manage', name: 'Manage Companies' }
    ],
    products: [
      { id: 'products.view', name: 'View Products' },
      { id: 'products.create', name: 'Create Products' },
      { id: 'products.edit', name: 'Edit Products' },
      { id: 'products.delete', name: 'Delete Products' },
      { id: 'products.manage', name: 'Manage Products' }
    ],
    orders: [
      { id: 'orders.view', name: 'View Orders' },
      { id: 'orders.create', name: 'Create Orders' },
      { id: 'orders.edit', name: 'Edit Orders' },
      { id: 'orders.delete', name: 'Delete Orders' },
      { id: 'orders.manage', name: 'Manage Orders' }
    ],
    subscriptions: [
      { id: 'subscriptions.view', name: 'View Subscriptions' },
      { id: 'subscriptions.edit', name: 'Edit Subscriptions' },
      { id: 'subscriptions.cancel', name: 'Cancel Subscriptions' },
      { id: 'subscriptions.manage', name: 'Manage Subscriptions' }
    ],
    settings: [
      { id: 'settings.view', name: 'View Settings' },
      { id: 'settings.edit', name: 'Edit Settings' },
      { id: 'settings.manage', name: 'Manage Settings' }
    ]
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-20 shadow-sm" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/super-admin/dashboard')}
                className="mr-4 p-2 rounded-lg transition-colors"
                style={{ color: appTheme.colors.textSecondary }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary, fontFamily: appTheme.fonts.families.primary }}>User Management</h1>
                <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>Manage users, roles, permissions & activity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === 'users' && (
                <>
                  {selectedUsers.length > 0 && (
                    <button
                      onClick={() => setShowBulkActionModal(true)}
                      className="px-4 py-2 border rounded-lg text-sm flex items-center transition-colors"
                      style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Bulk Actions ({selectedUsers.length})
                    </button>
                  )}
                  <button
                    onClick={() => {
                      resetUserForm();
                      setSelectedUser(null);
                      setShowUserModal(true);
                    }}
                    className="px-4 py-2 rounded-lg flex items-center text-sm transition-colors"
                    style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </>
              )}
              {activeTab === 'roles' && (
                <button
                  onClick={() => {
                    resetRoleForm();
                    setSelectedRole(null);
                    setShowRoleModal(true);
                  }}
                  className="px-4 py-2 rounded-lg flex items-center text-sm transition-colors"
                  style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Create Role
                </button>
              )}
              <button
                onClick={fetchData}
                className="p-2 rounded-lg transition-colors"
                style={{ color: appTheme.colors.textSecondary }}
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            change={12.5}
            changeType="positive"
            color={appTheme.colors.primary}
            loading={loading}
            appTheme={appTheme}
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers}
            icon={UserCheck}
            change={8.3}
            changeType="positive"
            color={appTheme.colors.success}
            loading={loading}
            appTheme={appTheme}
          />
          <StatsCard
            title="Online Now"
            value={stats.onlineNow}
            icon={Activity}
            color={appTheme.colors.secondary}
            loading={loading}
            appTheme={appTheme}
          />
          <StatsCard
            title="Total Roles"
            value={stats.totalRoles}
            icon={Shield}
            color={appTheme.colors.info}
            loading={loading}
            appTheme={appTheme}
          />
        </div>

        {/* Tabs */}
        <div className="rounded-xl shadow-sm border mb-6" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.border }}>
          <div className="border-b" style={{ borderColor: appTheme.colors.border }}>
            <nav className="flex overflow-x-auto px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      py-4 px-6 inline-flex items-center border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                      ${activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                    style={activeTab === tab.id ? { borderColor: appTheme.colors.primary, color: appTheme.colors.primary } : { color: appTheme.colors.textSecondary }}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-600'
                      }`} style={activeTab === tab.id ? { backgroundColor: `${appTheme.colors.primary}20`, color: appTheme.colors.primary } : { backgroundColor: appTheme.colors.borderLight, color: appTheme.colors.textSecondary }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 border-b" style={{ borderColor: appTheme.colors.borderLight, backgroundColor: appTheme.colors.backgroundLight }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: appTheme.colors.textTertiary }} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                />
              </div>
              {activeTab === 'users' && (
                <>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                  >
                    <option value="all">All Companies</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 border-b" style={{ backgroundColor: `${appTheme.colors.error}10`, borderColor: `${appTheme.colors.error}30` }}>
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" style={{ color: appTheme.colors.error }} />
                <p className="text-sm" style={{ color: appTheme.colors.error }}>{error}</p>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: appTheme.colors.primary }} />
              </div>
            ) : (
              <>
                {/* Users Grid/Table */}
                {activeTab === 'users' && (
                  <>
                    {/* Mobile Grid View */}
                    <div className="lg:hidden grid grid-cols-1 gap-4">
                      {users.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 mx-auto mb-3" style={{ color: appTheme.colors.textTertiary }} />
                          <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>No users found</p>
                        </div>
                      ) : (
                        users.map(user => (
                          <UserCard
                            key={user.id}
                            user={user}
                            onView={(u) => {
                              setSelectedUser(u);
                              setActiveTab('activity');
                            }}
                            onEdit={(u) => {
                              setSelectedUser(u);
                              setUserForm({
                                fullName: u.fullName,
                                email: u.email,
                                phone: u.phone || '',
                                role: u.role,
                                companyId: u.companyId || '',
                                status: u.status
                              });
                              setShowUserModal(true);
                            }}
                            onToggleStatus={handleToggleUserStatus}
                            onDelete={(u) => {
                              setSelectedUser(u);
                              setShowDeleteConfirm(true);
                            }}
                            appTheme={appTheme}
                          />
                        ))
                      )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="min-w-full divide-y" style={{ borderColor: appTheme.colors.borderLight }}>
                        <thead className="bg-opacity-50" style={{ backgroundColor: `${appTheme.colors.backgroundLight}80` }}>
                          <tr>
                            <th className="px-6 py-3 text-left">
                              <input
                                type="checkbox"
                                checked={selectedUsers.length === users.length && users.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="w-4 h-4 rounded focus:ring-indigo-500"
                                style={{ accentColor: appTheme.colors.primary }}
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: appTheme.colors.textSecondary }}>User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: appTheme.colors.textSecondary }}>Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: appTheme.colors.textSecondary }}>Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: appTheme.colors.textSecondary }}>Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: appTheme.colors.textSecondary }}>Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: appTheme.colors.textSecondary }}>Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: appTheme.colors.textSecondary }}>Last Login</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase" style={{ color: appTheme.colors.textSecondary }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ backgroundColor: appTheme.colors.backgroundCard, borderColor: appTheme.colors.borderLight }}>
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="px-6 py-8 text-center" style={{ color: appTheme.colors.textSecondary }}>
                                No users found
                              </td>
                            </tr>
                          ) : (
                            users.map(user => (
                              <UserTableRow
                                key={user.id}
                                user={user}
                                selected={selectedUsers.includes(user.id)}
                                onSelect={handleSelectUser}
                                onView={(u) => {
                                  setSelectedUser(u);
                                  setActiveTab('activity');
                                }}
                                onEdit={(u) => {
                                  setSelectedUser(u);
                                  setUserForm({
                                    fullName: u.fullName,
                                    email: u.email,
                                    phone: u.phone || '',
                                    role: u.role,
                                    companyId: u.companyId || '',
                                    status: u.status
                                  });
                                  setShowUserModal(true);
                                }}
                                onToggleStatus={handleToggleUserStatus}
                                onDelete={(u) => {
                                  setSelectedUser(u);
                                  setShowDeleteConfirm(true);
                                }}
                                appTheme={appTheme}
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* Roles Grid */}
                {activeTab === 'roles' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: appTheme.colors.textTertiary }} />
                        <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>No roles found</p>
                        <button
                          onClick={() => {
                            resetRoleForm();
                            setSelectedRole(null);
                            setShowRoleModal(true);
                          }}
                          className="mt-4 px-4 py-2 rounded-lg inline-flex items-center"
                          style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Create First Role
                        </button>
                      </div>
                    ) : (
                      roles.map(role => (
                        <RoleCard
                          key={role.id}
                          role={role}
                          onEdit={(r) => {
                            setSelectedRole(r);
                            setRoleForm({
                              name: r.name,
                              description: r.description || '',
                              permissions: r.permissions || [],
                              isActive: r.isActive
                            });
                            setShowRoleModal(true);
                          }}
                          onDelete={(r) => {
                            setSelectedRole(r);
                            setShowDeleteConfirm(true);
                          }}
                          onToggleStatus={async (r) => {
                            try {
                              await fetch(`/api/companies/users`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  type: 'role',
                                  id: r.id,
                                  isActive: !r.isActive
                                })
                              });
                              fetchData();
                            } catch (err) {
                              alert(err.message);
                            }
                          }}
                          appTheme={appTheme}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* Permissions Grid */}
                {activeTab === 'permissions' && (
                  <div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {Object.entries(permissionGroups).map(([group, perms]) => (
                        <PermissionGroup
                          key={group}
                          title={group.charAt(0).toUpperCase() + group.slice(1)}
                          permissions={perms}
                          selectedPermissions={[]}
                          onToggle={() => {}}
                          appTheme={appTheme}
                        />
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button className="px-4 py-2 rounded-lg" style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}>
                        Save Permissions
                      </button>
                    </div>
                  </div>
                )}

                {/* Activity Log */}
                {activeTab === 'activity' && (
                  <div>
                    {selectedUser && (
                      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: appTheme.colors.backgroundLight }}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${appTheme.colors.primary}20` }}>
                            <span className="text-lg font-medium" style={{ color: appTheme.colors.primary }}>
                              {selectedUser.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium" style={{ color: appTheme.colors.textPrimary }}>{selectedUser.fullName}</h3>
                            <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>{selectedUser.email}</p>
                          </div>
                          <button
                            onClick={() => setSelectedUser(null)}
                            className="ml-auto p-2 rounded-lg transition-colors"
                            style={{ color: appTheme.colors.textTertiary }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {activities.length === 0 ? (
                      <div className="text-center py-12">
                        <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: appTheme.colors.textTertiary }} />
                        <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>No activity found</p>
                      </div>
                    ) : (
                      <ActivityTimeline activities={activities} appTheme={appTheme} />
                    )}
                  </div>
                )}

                {/* Pagination */}
                {total > limit && activeTab === 'users' && (
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm" style={{ color: appTheme.colors.textSecondary }}>
                      Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 transition-colors"
                        style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="px-3 py-1 text-sm" style={{ color: appTheme.colors.textSecondary }}>Page {page}</span>
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * limit >= total}
                        className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 transition-colors"
                        style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
            <div className="p-6 border-b" style={{ borderColor: appTheme.colors.border }}>
              <h2 className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>
                {selectedUser ? 'Edit User' : 'Create New User'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Full Name *</label>
                  <input
                    type="text"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Phone</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Company</label>
                  <select
                    value={userForm.companyId}
                    onChange={(e) => setUserForm({...userForm, companyId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                  >
                    <option value="">Select Company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({...userForm, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                {!selectedUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Password *</label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                        placeholder="••••••••"
                        required={!selectedUser}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Confirm Password *</label>
                      <input
                        type="password"
                        value={userForm.confirmPassword}
                        onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                        placeholder="••••••••"
                        required={!selectedUser}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: appTheme.colors.border }}>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                  resetUserForm();
                }}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={selectedUser ? handleUpdateUser : handleCreateUser}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
              >
                {selectedUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
            <div className="p-6 border-b" style={{ borderColor: appTheme.colors.border }}>
              <h2 className="text-xl font-bold" style={{ color: appTheme.colors.textPrimary }}>
                {selectedRole ? 'Edit Role' : 'Create New Role'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Role Name *</label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                    placeholder="e.g., Manager, Editor, Viewer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: appTheme.colors.textPrimary }}>Description</label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.backgroundCard, color: appTheme.colors.textPrimary }}
                    placeholder="Role description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: appTheme.colors.textPrimary }}>Permissions</label>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(permissionGroups).map(([group, perms]) => (
                      <PermissionGroup
                        key={group}
                        title={group.charAt(0).toUpperCase() + group.slice(1)}
                        permissions={perms}
                        selectedPermissions={roleForm.permissions}
                        onToggle={handleTogglePermission}
                        appTheme={appTheme}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="roleActive"
                    checked={roleForm.isActive}
                    onChange={(e) => setRoleForm({...roleForm, isActive: e.target.checked})}
                    className="w-4 h-4 rounded focus:ring-indigo-500"
                    style={{ accentColor: appTheme.colors.primary }}
                  />
                  <label htmlFor="roleActive" className="ml-2 text-sm" style={{ color: appTheme.colors.textSecondary }}>
                    Active (role can be assigned to users)
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: appTheme.colors.border }}>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedRole(null);
                  resetRoleForm();
                }}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={selectedRole ? handleUpdateRole : handleCreateRole}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: appTheme.colors.primary, color: 'white' }}
              >
                {selectedRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (selectedUser || selectedRole) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl shadow-xl max-w-md w-full" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4" style={{ backgroundColor: `${appTheme.colors.error}20` }}>
                <AlertTriangle className="w-6 h-6" style={{ color: appTheme.colors.error }} />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2" style={{ color: appTheme.colors.textPrimary }}>
                Delete {selectedUser ? 'User' : 'Role'}
              </h3>
              <p className="text-sm text-center mb-6" style={{ color: appTheme.colors.textSecondary }}>
                Are you sure you want to delete "{selectedUser?.fullName || selectedRole?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg transition-colors"
                  style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  onClick={selectedUser ? handleDeleteUser : handleDeleteRole}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: appTheme.colors.error, color: 'white' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl shadow-xl max-w-md w-full" style={{ backgroundColor: appTheme.colors.backgroundCard }}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: appTheme.colors.textPrimary }}>Bulk Actions</h3>
              <p className="text-sm mb-4" style={{ color: appTheme.colors.textSecondary }}>
                {selectedUsers.length} users selected
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="w-full p-3 text-left text-sm rounded-lg flex items-center transition-colors"
                  style={{ color: appTheme.colors.success }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-3" />
                  Activate Selected Users
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="w-full p-3 text-left text-sm rounded-lg flex items-center transition-colors"
                  style={{ color: appTheme.colors.warning }}
                >
                  <XCircle className="w-4 h-4 mr-3" />
                  Suspend Selected Users
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="w-full p-3 text-left text-sm rounded-lg flex items-center transition-colors"
                  style={{ color: appTheme.colors.error }}
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Selected Users
                </button>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowBulkActionModal(false)}
                  className="px-4 py-2 border rounded-lg transition-colors"
                  style={{ borderColor: appTheme.colors.border, color: appTheme.colors.textSecondary }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}