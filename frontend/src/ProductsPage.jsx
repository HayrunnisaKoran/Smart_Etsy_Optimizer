import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit, Trash2, Package, Filter, ChevronLeft, ChevronRight, RefreshCw, ArrowUpDown } from 'lucide-react';
import API from './api'; // Firebase SDK silindi, kendi yazdığımız API bağlandı

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name_asc'); // Sıralama state'i (Varsayılan: A-Z)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  
  // Modal ve Form Kontrolleri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ id: '', name: '', sku: '', category: '', stock: '', price: '' });
  
  const [isImporting, setIsImporting] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false); // Huni menüsünün açılıp kapanma durumu

  // GERÇEK BACKEND API BAĞLANTISI VE TARİH KORUMASI
  const fetchProducts = async () => {
    try {
      const response = await API.get('/products');
      const fetchedProducts = response.data.map(product => ({
          ...product,
          id: product.id || 'UNKNOWN',
          name: product.name || 'İsimsiz Ürün',
          sku: product.sku || 'SKU-YOK',
          price: Number(product.price || 0),
          stock: Number(product.stock || 0),
          category: product.category || 'Uncategorized'
      })).sort((a, b) => {
         let dateA = new Date(a.createdAt?._seconds ? a.createdAt._seconds * 1000 : (a.createdAt || new Date()));
         let dateB = new Date(b.createdAt?._seconds ? b.createdAt._seconds * 1000 : (b.createdAt || new Date()));
         if (isNaN(dateA.getTime())) dateA = new Date(0);
         if (isNaN(dateB.getTime())) dateB = new Date(0);
         return dateB - dateA;
      });
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Ürün yükleme hatası:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortBy]);

  const dynamicCategories = ["All Categories", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const pName = p.name ? p.name.toLowerCase().trim() : '';
    const pSku = p.sku ? p.sku.toLowerCase().trim() : '';
    const pCat = p.category ? p.category.toLowerCase().trim() : 'uncategorized';
    const currentFilter = categoryFilter.toLowerCase().trim();
    
    const matchesSearch = pName.includes(searchTerm.toLowerCase()) || pSku.includes(searchTerm.toLowerCase());
    const matchesCategory = currentFilter === 'all categories' || pCat === currentFilter;
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
    if (sortBy === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy === 'stock_desc') return Number(b.stock || 0) - Number(a.stock || 0);
    if (sortBy === 'stock_asc') return Number(a.stock || 0) - Number(b.stock || 0);
    if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  // SİLME İŞLEMİNİ BACKEND API ÜZERİNDEN YAPMA
  const handleDelete = async (id) => {
    if(window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      try { 
        await API.delete(`/products/${id}`); 
        fetchProducts();
      } catch (err) { console.error("Silme hatası:", err); }
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentProduct({ id: '', name: '', sku: '', category: '', stock: '', price: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // KAYDETME VE GÜNCELLEMEYİ BACKEND API'YE GÖNDERME
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: currentProduct.name,
        sku: currentProduct.sku,
        category: currentProduct.category || 'Uncategorized',
        stock: Number(currentProduct.stock),
        price: Number(currentProduct.price)
      };

      if (isEditing) {
        await API.patch(`/products/${currentProduct.id}`, productData);
      } else {
        await API.post('/products', productData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) { console.error("Kaydetme hatası:", err); }
  };

  // ETSY'DEN GERÇEK SATıŞ VERİLERİNİ ÇEK VE ÜRÜN OLARAK EKLE
  const handleImportFromEtsy = async (e) => {
    e.preventDefault();
    setIsImporting(true);
    try {
      // Backend'ten Etsy satış verilerini çek (Tarih aralığı belirleme)
      const today = new Date();
      const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 gün öncesi
      
      const salesRes = await API.get('/etsy/sales/fetch', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        }
      });

      const etsySales = salesRes.data.data || [];
      
      if (etsySales.length === 0) {
        alert("Belirtilen tarih aralığında Etsy satışı bulunamadı.");
        setIsImporting(false);
        return;
      }

      // Satışları ürün olarak ekle
      let addedCount = 0;
      for (const sale of etsySales) {
        try {
          // Aynı SKU zaten var mı kontrol et
          const existingProduct = products.find(p => p.sku === sale.sku);
          if (!existingProduct) {
            await API.post('/products', {
              name: `Etsy Product - ${sale.sku}`,
              sku: sale.sku,
              category: 'Imported from Etsy',
              stock: sale.quantitySold || 0,
              price: 0
            });
            addedCount++;
          }
        } catch (err) {
          console.error(`Ürün eklenirken hata: ${sale.sku}`, err);
        }
      }

      alert(`Etsy API Bağlantısı Başarılı! ${addedCount} yeni ürün senkronize edildi.`);
      fetchProducts();
    } catch (err) {
      console.error("Etsy import hatası:", err);
      alert("Etsy verileri çekilirken hata oluştu.");
    } finally {
      setIsImporting(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock > 10) return { label: 'In Stock', color: 'text-green-500 bg-green-50' };
    if (stock > 0 && stock <= 10) return { label: 'Low Stock', color: 'text-amber-500 bg-amber-50' };
    return { label: 'Out of Stock', color: 'text-red-500 bg-red-50' };
  };

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER BÖLÜMÜ */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Manage your Etsy inventory and catalog</p>
        </div>
        <div className="flex items-center space-x-3">
            <button type="button" onClick={handleImportFromEtsy} disabled={isImporting} className="bg-white text-gray-600 border border-gray-200 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all">
              {isImporting ? <><RefreshCw size={16} className="mr-2 animate-spin text-[#FF6B00]" /> Syncing...</> : <><Download size={16} className="mr-2" /> Import from Etsy</>}
            </button>
            <button type="button" onClick={openAddModal} className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-100 flex items-center hover:bg-[#e66000] transition-all">
               <Plus size={18} className="mr-2" /> Add Product
            </button>
        </div>
      </header>

          <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden flex flex-col">
            
            {/* ARAMA, SEÇİM KUTUSU VE SIRALAMA HUNİSİ */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div className="relative w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products by name or SKU..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              
              <div className="flex space-x-4 relative">
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)} 
                  className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 outline-none shadow-sm cursor-pointer"
                >
                  {dynamicCategories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                </select>
                
                {/* HUNİ / FİLTRE BUTONU */}
                <button 
                  type="button" 
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} 
                  className={`px-4 py-3 rounded-2xl border transition-all shadow-sm flex items-center ${isSortMenuOpen ? 'bg-orange-50 text-[#FF6B00] border-orange-200' : 'bg-white text-gray-400 border-gray-100 hover:text-gray-600'}`}
                >
                  <Filter size={18} />
                </button>

                {/* SİPARİŞLERDEKİ GİBİ ŞIK AÇILIR SIRALAMA MENÜSÜ */}
                {isSortMenuOpen && (
                  <div className="absolute right-0 top-14 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-52 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-4 py-1.5 border-b border-gray-50 flex items-center"><ArrowUpDown size={10} className="mr-1"/> Ürün Sıralama</p>
                    <button type="button" onClick={() => { setSortBy('name_asc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'name_asc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Ürün Adı: A - Z</button>
                    <button type="button" onClick={() => { setSortBy('price_desc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'price_desc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Fiyat: Yüksekten Düşüğe</button>
                    <button type="button" onClick={() => { setSortBy('price_asc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'price_asc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Fiyat: Düşükten Yükseğe</button>
                    <button type="button" onClick={() => { setSortBy('stock_desc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'stock_desc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Stok: Azalan (Çoktan Aza)</button>
                    <button type="button" onClick={() => { setSortBy('stock_asc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'stock_asc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Stok: Artan (Azdan Çoka)</button>
                  </div>
                )}
              </div>
            </div>

            {/* ÜRÜNLER TABLOSU */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                    <th className="px-8 py-5">Image</th>
                    <th className="px-4 py-5">Product Name</th>
                    <th className="px-4 py-5">SKU</th>
                    <th className="px-4 py-5">Price</th>
                    <th className="px-4 py-5">Stock</th>
                    <th className="px-4 py-5">Status</th>
                    <th className="px-4 py-5">Category</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentProducts.map((product) => {
                    const status = getStockStatus(product.stock);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-4"><div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF6B00] border border-orange-100"><Package size={20} /></div></td>
                        <td className="px-4 py-4"><span className="font-bold text-sm text-gray-800">{product.name}</span></td>
                        <td className="px-4 py-4"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.sku}</span></td>
                        <td className="px-4 py-4"><span className="font-black text-sm text-gray-800">${product.price}</span></td>
                        <td className="px-4 py-4"><span className="font-black text-sm text-gray-600">{product.stock}</span></td>
                        <td className="px-4 py-4"><span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span></td>
                        <td className="px-4 py-4"><span className="text-xs font-bold text-gray-500">{product.category || 'Uncategorized'}</span></td>
                        
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16} /></button>
                            <button type="button" onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {currentProducts.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-8 py-12 text-center text-gray-400 font-medium">
                        No products found. Try a different search or add a new product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* PAGINATION */}
            <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-white">
                <span className="text-xs font-bold text-gray-400">Showing {filteredProducts.length} products</span>
                {totalPages > 1 && (
                  <div className="flex space-x-2">
                      <button type="button" onClick={handlePrevPage} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={16}/></button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button type="button" key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all ${currentPage === i + 1 ? 'bg-[#FF6B00] text-white shadow-sm' : 'border border-gray-100 text-gray-600 hover:bg-gray-50'}`}>{i + 1}</button>
                      ))}
                      <button type="button" onClick={handleNextPage} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={16}/></button>
                  </div>
                )}
            </div>
          </div>

          {/* ADD / EDIT MODAL */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-200">
                <h2 className="text-2xl font-black mb-8 text-gray-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSave} className="space-y-5">
                  <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-orange-500/10" placeholder="Product Name" value={currentProduct.name} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-orange-500/10" placeholder="SKU" value={currentProduct.sku} onChange={(e) => setCurrentProduct({...currentProduct, sku: e.target.value})} />
                    <input list="category-options" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-orange-500/10" placeholder="Category" value={currentProduct.category} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})} />
                    <datalist id="category-options">
                      {dynamicCategories.filter(c => c !== 'All Categories').map((cat, idx) => <option key={idx} value={cat} />)}
                    </datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-orange-500/10" placeholder="Stock" value={currentProduct.stock} onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})} />
                    <input type="number" step="0.01" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-orange-500/10" placeholder="Price ($)" value={currentProduct.price} onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})} />
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                    <button type="submit" className="flex-1 bg-[#FF6B00] text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-200">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }