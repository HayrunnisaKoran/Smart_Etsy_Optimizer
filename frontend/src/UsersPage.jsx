import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Shield, UserCheck } from 'lucide-react';
import API from './api'; // Backend API bağlandı
import { auth } from './firebase'; // Giriş yapan kullanıcıyı algılamak için Firebase Auth eklendi

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: '', name: '', email: '', role: 'Viewer', status: 'Active' });

  // BACKEND API'DEN KULLANICILARI ALMA
  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data.map(user => ({
         ...user,
         lastLogin: user.lastLogin || 'May 15, 2026 10:30 AM'
      })));
    } catch (err) {
      console.error("Kullanıcı listesi çekilemedi:", err);
    }
  };

  useEffect(() => {
    // 1. Mevcut kullanıcı listesini çek
    fetchUsers();

    // 2. OTO-SENKRONİZASYON: Giriş yapan Firebase kullanıcısı Firestore'da yoksa otomatik ekle
    const unsubscribe = auth.onAuthStateChanged(async (loggedUser) => {
      if (loggedUser && loggedUser.email) {
        try {
          // Güncel veritabanı listesini kontrol et
          const response = await API.get('/users');
          const currentDBUsers = response.data;
          
          // Giriş yapmış e-posta adresi veritabanında var mı?
          const userExists = currentDBUsers.some(
            u => (u.email || '').toLowerCase() === loggedUser.email.toLowerCase()
          );

          // Eğer veritabanında bu e-posta yoksa otomatik olarak kaydet
          if (!userExists) {
            const newUserData = {
              name: loggedUser.displayName || loggedUser.email.split('@')[0], // İsim yoksa mail ön ekini alır
              email: loggedUser.email,
              role: 'Admin', // İlk giriş yapan kişi için varsayılan rol
              status: 'Active'
            };
            
            // Backend üzerinden Firestore'a kaydet
            await API.post('/users', newUserData);
            // Tabloyu yeniden güncelle
            fetchUsers();
          }
        } catch (err) {
          console.error("Otomatik kullanıcı senkronizasyon hatası:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // BACKEND API ÜZERİNDEN SİLME
  const handleDelete = async (id) => {
    if (window.confirm("Bu kullanıcının yetkilerini kaldırmak istediğinize emin misiniz?")) {
      try {
        await API.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error("Kullanıcı silme hatası:", err);
      }
    }
  };

  const openAddModal = () => {
    setCurrentUser({ id: '', name: '', email: '', role: 'Viewer', status: 'Active' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // BACKEND API ÜZERİNDEN KAYDETME VE GÜNCELLEME
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        status: currentUser.status
      };

      if (isEditing) {
        await API.patch(`/users/${currentUser.id}`, userData);
      } else {
        await API.post('/users', userData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Kullanıcı kaydedilemedi:", err);
    }
  };

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
            <UserCheck className="text-[#FF6B00] mr-3" size={32} /> Users Management
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Manage team roles, access controls, and cloud authorization levels</p>
        </div>
        <button 
          type="button" 
          onClick={openAddModal}
          className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-100 flex items-center hover:bg-[#e66000] transition-all"
        >
          <Plus size={18} className="mr-2" /> Add New User
        </button>
      </header>

      <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                <th className="px-8 py-5">Name</th><th className="px-4 py-5">Email</th><th className="px-4 py-5">Role</th><th className="px-4 py-5">Status</th><th className="px-4 py-5">Last Login</th><th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-orange-50 text-[#FF6B00] font-black text-xs flex items-center justify-center border border-orange-100 shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="font-bold text-sm text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className="text-xs font-bold text-gray-500">{user.email}</span></td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      user.role === 'Admin' ? 'text-purple-600 bg-purple-50' : user.role === 'Manager' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 bg-gray-50'
                    }`}>
                      <Shield size={10} className="mr-1" /> {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4"><span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'text-green-500 bg-green-50' : 'text-red-400 bg-red-50'}`}>{user.status}</span></td>
                  <td className="px-4 py-4"><span className="text-xs font-bold text-gray-400">{user.lastLogin}</span></td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit size={15} /></button>
                      <button type="button" onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black mb-8 text-gray-900">
              {isEditing ? 'Edit User Permissions' : 'Invite New Team Member'}
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" required className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-orange-500/10" placeholder="e.g. Filiz Yılmaz" value={currentUser.name} onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" required className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-orange-500/10" placeholder="filiz@gmail.com" value={currentUser.email} onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role / Authorization</label>
                  <select className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm text-gray-700 cursor-pointer" value={currentUser.role} onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}>
                    <option value="Admin">Admin (Full Access)</option><option value="Manager">Manager (Editor)</option><option value="Viewer">Viewer (Read-Only)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Status</label>
                  <select className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm text-gray-700 cursor-pointer" value={currentUser.status} onChange={(e) => setCurrentUser({...currentUser, status: e.target.value})}>
                    <option value="Active">Active</option><option value="Inactive">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-[#FF6B00] text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-200">
                  {isEditing ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}