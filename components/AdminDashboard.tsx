import React, { useState, useEffect } from 'react';
import { Order, SiteContent, Product, ProductCategory, Recipe } from '../types';
import { dataService, INITIAL_CONTENT } from '../services/dataService';
import { supabase } from '../services/supabaseClient';

interface AdminDashboardProps {
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'recipes' | 'content'>('orders');
  const [saveStatus, setSaveStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Recipe Edit State
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isNewRecipe, setIsNewRecipe] = useState(false);

  // Check DB Connection on mount
  useEffect(() => {
    if (!supabase) {
      alert("⚠️ Database NOT Connected. \n\nPlease add VITE_SUPABASE_URL and VITE_SUPABASE_KEY to your Vercel Environment Variables to enable live saving.");
    }
  }, []);

  // --- SECURITY: LOGIN HANDLER ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate check
    await new Promise(r => setTimeout(r, 600)); 
    const isValid = await dataService.verifyPassword(password);
    setIsProcessing(false);
    
    if (isValid) {
      setIsAuthenticated(true);
    } else {
      alert('Access Denied: Invalid credentials.');
    }
  };

  // --- DATA LOADING ---
  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        const [loadedOrders, loadedContent, loadedProducts, loadedRecipes] = await Promise.all([
          dataService.getOrders(),
          dataService.getSiteContent(),
          dataService.getProducts(),
          dataService.getRecipes()
        ]);
        setOrders(loadedOrders);
        setContent(loadedContent);
        setProducts(loadedProducts);
        setRecipes(loadedRecipes);
      };
      loadData();
    }
  }, [isAuthenticated]);

  // --- ACTIONS ---
  const toggleOrderStatus = async (id: string, current: string) => {
    const next = current === 'Pending' ? 'Processed' : current === 'Processed' ? 'Completed' : 'Pending';
    await dataService.updateOrderStatus(id, next as any);
    setOrders(await dataService.getOrders());
  };

  const handleContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveStatus('Publishing Live...');
      await dataService.updateSiteContent(content);
      setSaveStatus('✅ Live on Website!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus('❌ Save Failed');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    let updatedProducts = [...products];
    if (isNewProduct) {
      updatedProducts.push(editingProduct);
    } else {
      updatedProducts = updatedProducts.map(p => p.id === editingProduct.id ? editingProduct : p);
    }

    try {
      setSaveStatus('Publishing Live...');
      await dataService.saveProducts(updatedProducts);
      setProducts(updatedProducts);
      setEditingProduct(null);
      setSaveStatus('✅ Product Updated Live!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('❌ Save Failed');
    }
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe) return;

    let updatedRecipes = [...recipes];
    if (isNewRecipe) {
      updatedRecipes.push(editingRecipe);
    } else {
      updatedRecipes = updatedRecipes.map(r => r.id === editingRecipe.id ? editingRecipe : r);
    }

    try {
      setSaveStatus('Publishing Live...');
      await dataService.saveRecipes(updatedRecipes);
      setRecipes(updatedRecipes);
      setEditingRecipe(null);
      setSaveStatus('✅ Story Updated Live!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('❌ Save Failed');
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      await dataService.saveProducts(updated);
      setProducts(updated);
    }
  };

  const deleteRecipe = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      const updated = recipes.filter(r => r.id !== id);
      await dataService.saveRecipes(updated);
      setRecipes(updated);
    }
  };

  const createNewProduct = () => {
    setEditingProduct({
      id: Date.now().toString(),
      name: 'New Product',
      description: '',
      price: 0,
      image: '',
      category: 'Macaron',
      ingredients: [],
      available: true,
      sableDressage: false
    });
    setIsNewProduct(true);
  };

  const createNewRecipe = () => {
    setEditingRecipe({
      id: Date.now().toString(),
      title: 'New Story',
      content: '',
      image: ''
    });
    setIsNewRecipe(true);
  };

  // --- GENERIC UPLOAD HANDLER ---
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    targetType: 'content' | 'product' | 'recipe', 
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict Limit for Database (1MB max to be safe with JSON payload limits)
    if (file.size > 1024 * 1024) {
      alert("⚠️ Image too large. Please use images under 1MB for database stability.");
      e.target.value = '';
      return;
    }

    let key = '';
    if (targetType === 'content') key = field;
    else if (targetType === 'product') key = 'productImage';
    else if (targetType === 'recipe') key = 'recipeImage';

    setUploadProgress(prev => ({ ...prev, [key]: 1 }));

    const reader = new FileReader();
    reader.onprogress = (ev) => {
       if (ev.lengthComputable) {
         setUploadProgress(prev => ({ ...prev, [key]: Math.round((ev.loaded / ev.total) * 100) }));
       }
    };
    reader.onloadend = () => {
      const result = reader.result as string;
      if (targetType === 'content') {
        setContent(prev => ({ ...prev, [field]: result }));
      } else if (targetType === 'product' && editingProduct) {
        setEditingProduct({ ...editingProduct, image: result });
      } else if (targetType === 'recipe' && editingRecipe) {
        setEditingRecipe({ ...editingRecipe, image: result });
      }
      
      setTimeout(() => setUploadProgress(prev => { const n = {...prev}; delete n[key]; return n; }), 500);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const renderUploadButton = (targetType: 'content' | 'product' | 'recipe', field: string, currentValue: string) => {
    let key = '';
    if (targetType === 'content') key = field;
    else if (targetType === 'product') key = 'productImage';
    else if (targetType === 'recipe') key = 'recipeImage';

    const progress = uploadProgress[key];
    const isBase64 = currentValue?.startsWith('data:');
    const displayValue = isBase64 ? '' : currentValue;
    const placeholder = isBase64 ? '• Image Loaded •' : 'Image URL or Upload ->';

    return (
      <div className="flex gap-2 items-center">
         <input 
            type="text" 
            value={displayValue || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (targetType === 'content') setContent(p => ({ ...p, [field]: val }));
              else if (targetType === 'product' && editingProduct) setEditingProduct({ ...editingProduct, image: val });
              else if (targetType === 'recipe' && editingRecipe) setEditingRecipe({ ...editingRecipe, image: val });
            }}
            className={`flex-grow border-b border-gray-300 py-2 bg-transparent text-sm focus:border-layen-gold outline-none transition-colors ${isBase64 ? 'text-green-600 font-medium italic' : ''}`}
            placeholder={placeholder}
         />
         <label className={`relative cursor-pointer px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center min-w-[80px] overflow-hidden ${progress ? 'bg-gray-200' : 'bg-layen-dark text-white hover:bg-layen-gold'}`}>
           {progress ? `${progress}%` : 'Upload'}
           <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, targetType, field)} />
         </label>
      </div>
    );
  };

  // --- RENDER LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-layen-gold/20 to-transparent blur-[100px] animate-pulse"></div>
        </div>
        
        <div className="relative z-10 w-[450px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-layen-gold/20 p-12 shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-hidden rounded-sm animate-fade-in-up">
           <button type="button" onClick={onExit} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">✕</button>
           
           <div className="text-center mb-12">
             <div className="text-layen-gold text-5xl font-serif mb-2 tracking-tighter">LS</div>
             <div className="text-gray-500 text-[10px] uppercase tracking-[0.5em]">Live Command Center</div>
             <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-layen-gold to-transparent mx-auto mt-6"></div>
           </div>

           <form onSubmit={handleLogin} className="space-y-8">
             <div className="relative group">
               <label className="block text-[#444] text-[9px] uppercase tracking-widest mb-2 group-focus-within:text-layen-gold transition-colors">Passphrase</label>
               <input 
                 type="password" 
                 value={password} 
                 onChange={e => setPassword(e.target.value)}
                 disabled={isProcessing}
                 className="w-full bg-[#050505] border border-[#222] text-white p-4 text-center tracking-[0.2em] focus:border-layen-gold outline-none transition-all duration-500 placeholder-gray-800 disabled:opacity-50"
                 placeholder="••••••••"
               />
               <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-layen-gold transition-all duration-500 group-focus-within:w-full"></div>
             </div>
             
             <button 
               disabled={isProcessing} 
               className="w-full bg-layen-gold/10 text-layen-gold border border-layen-gold/50 py-4 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-layen-gold hover:text-[#050505] transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-2"
             >
               {isProcessing ? 'Verifying...' : 'Access Live Dashboard'}
             </button>
           </form>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#1a1a1a] text-white fixed h-full z-20 hidden md:flex flex-col justify-between shadow-2xl">
        <div>
          <div className="p-10 text-center border-b border-white/5">
            <h1 className="text-3xl font-serif text-layen-gold mb-2">LS Admin</h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] text-green-400">● Live Connection</p>
          </div>
          
          <nav className="p-6 space-y-2 mt-4">
            {['orders', 'products', 'recipes', 'content'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`w-full text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all rounded-sm border-l-2 ${
                  activeTab === tab 
                    ? 'bg-white/5 text-layen-gold border-layen-gold' 
                    : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'content' ? 'Site Content' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 border-t border-white/5">
           <button onClick={onExit} className="block w-full text-left text-[10px] text-gray-500 hover:text-white mb-4 uppercase tracking-wider transition-colors">← Return to Site</button>
           <button onClick={() => setIsAuthenticated(false)} className="block w-full text-left text-[10px] text-red-900 hover:text-red-500 uppercase tracking-wider transition-colors">Log Out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-12 lg:p-16 overflow-y-auto relative">
        <header className="flex justify-between items-end mb-12 animate-fade-in">
          <div>
            <h2 className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-2">Live Mode</h2>
            <h1 className="text-5xl font-serif text-[#1a1a1a]">Dashboard <span className="text-layen-gold italic">Control</span></h1>
          </div>
          <div className="flex gap-4 items-center">
            {saveStatus && (
              <div className="bg-layen-gold text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg animate-pulse">
                {saveStatus}
              </div>
            )}
          </div>
        </header>

        <div className="bg-white rounded-sm shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 min-h-[600px] p-10 animate-fade-in-up">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                 <h3 className="text-2xl font-serif text-[#1a1a1a]">Incoming Orders</h3>
                 <span className="text-[10px] text-gray-400 uppercase tracking-widest border border-gray-200 px-3 py-1 rounded-full">{orders.length} Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#FAFAFA]">
                    <tr>
                      <th className="p-5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="p-5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Client</th>
                      <th className="p-5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order Details</th>
                      <th className="p-5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5 text-sm font-mono text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="p-5">
                          <div className="font-bold text-[#1a1a1a]">{order.customerName}</div>
                          <div className="text-xs text-gray-400 mt-1 font-mono">{order.phone}</div>
                        </td>
                        <td className="p-5 text-sm">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="mb-1">
                              <span className="font-bold text-[#1a1a1a]">{i.quantity}x</span> {i.name}
                              {i.notes && <span className="ml-2 text-[9px] text-layen-gold border border-layen-gold/30 px-1 rounded uppercase tracking-wider">{i.notes}</span>}
                            </div>
                          ))}
                          <div className="mt-2 pt-2 border-t border-dashed border-gray-200 font-bold text-layen-gold">Total: ${order.totalPrice.toFixed(2)}</div>
                          {order.notes && <div className="mt-2 text-xs bg-yellow-50 p-3 rounded-sm text-yellow-800 italic">"{order.notes}"</div>}
                        </td>
                        <td className="p-5">
                          <button 
                            onClick={() => toggleOrderStatus(order.id, order.status)}
                            className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${
                              order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' :
                              order.status === 'Processed' ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' :
                              'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                            }`}
                          >
                            {order.status}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={4} className="p-16 text-center text-gray-400 font-light italic">No orders received yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div>
               {!editingProduct ? (
                 <>
                   <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                      <h3 className="text-2xl font-serif text-[#1a1a1a]">Product Catalogue</h3>
                      <button onClick={createNewProduct} className="bg-[#1a1a1a] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-layen-gold transition-colors shadow-xl">
                        + New Creation
                      </button>
                   </div>
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                     {products.map(product => (
                       <div key={product.id} className="group border border-gray-100 p-0 hover:shadow-2xl hover:border-layen-gold/20 transition-all duration-500 bg-white relative overflow-hidden">
                         <div className="absolute top-4 right-4 z-10">
                            <span className={`w-2 h-2 rounded-full block shadow-sm ${product.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                         </div>
                         <div className="h-48 w-full bg-gray-50 mb-0 overflow-hidden relative">
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10"></div>
                           <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         </div>
                         <div className="p-6">
                           <span className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 block">{product.category}</span>
                           <h4 className="font-bold text-[#1a1a1a] text-lg truncate font-serif mb-1">{product.name}</h4>
                           <p className="text-layen-gold font-sans text-sm">${product.price.toFixed(2)}</p>
                         </div>
                         <div className="flex border-t border-gray-50">
                            <button onClick={() => { setEditingProduct(product); setIsNewProduct(false); }} className="flex-1 py-3 text-[9px] font-bold text-gray-500 uppercase hover:bg-gray-50 hover:text-[#1a1a1a] transition-colors">Edit</button>
                            <div className="w-[1px] bg-gray-50"></div>
                            <button onClick={() => deleteProduct(product.id)} className="flex-1 py-3 text-[9px] font-bold text-red-300 uppercase hover:bg-red-50 hover:text-red-500 transition-colors">Remove</button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </>
               ) : (
                 <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                      <h3 className="text-3xl font-serif text-[#1a1a1a]">{isNewProduct ? 'New Creation' : 'Edit Masterpiece'}</h3>
                      <button onClick={() => setEditingProduct(null)} className="text-[10px] text-gray-400 hover:text-layen-gold uppercase tracking-widest transition-colors">Cancel & Close</button>
                    </div>
                    <form onSubmit={handleSaveProduct} className="grid md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                          <div>
                            <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Product Name</label>
                            <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border-b border-gray-200 py-3 text-lg font-serif focus:border-layen-gold outline-none transition-colors" />
                          </div>
                          <div>
                             <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Price</label>
                             <input required type="number" step="0.5" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full border-b border-gray-200 py-3 text-lg focus:border-layen-gold outline-none transition-colors" />
                          </div>
                          <div>
                             <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Category</label>
                             <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as ProductCategory})} className="w-full border-b border-gray-200 py-3 bg-transparent focus:border-layen-gold outline-none transition-colors cursor-pointer">
                               <option value="Macaron">Macaron</option>
                               <option value="Cake">Cake</option>
                               <option value="Sable">Sablé</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Description</label>
                             <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border border-gray-200 p-4 h-32 rounded-sm focus:border-layen-gold outline-none transition-colors resize-none" />
                          </div>
                       </div>
                       <div className="space-y-8">
                          <div>
                            <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Visual Asset</label>
                            <div className="bg-gray-50/50 border border-dashed border-gray-200 p-8 text-center rounded-sm hover:border-layen-gold/30 transition-colors">
                               {editingProduct.image && <img src={editingProduct.image} className="h-48 mx-auto mb-6 object-contain shadow-md" />}
                               {renderUploadButton('product', 'productImage', editingProduct.image)}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50/50 p-8 rounded-sm border border-gray-100">
                             <h4 className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-6">Configuration</h4>
                             <label className="flex items-center gap-4 cursor-pointer mb-6 group">
                               <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-300 rounded-sm ${editingProduct.available ? 'bg-layen-gold border-layen-gold' : 'bg-white border-gray-300 group-hover:border-layen-gold'}`}>
                                 {editingProduct.available && <span className="text-white text-[10px]">✓</span>}
                               </div>
                               <input type="checkbox" className="hidden" checked={editingProduct.available} onChange={e => setEditingProduct({...editingProduct, available: e.target.checked})} />
                               <span className="text-sm font-medium text-gray-700">Available for Order</span>
                             </label>

                             {editingProduct.category === 'Sable' && (
                                <label className="flex items-center gap-4 cursor-pointer group animate-fade-in-up">
                                  <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-300 rounded-sm ${editingProduct.sableDressage ? 'bg-layen-gold border-layen-gold' : 'bg-white border-gray-300 group-hover:border-layen-gold'}`}>
                                    {editingProduct.sableDressage && <span className="text-white text-[10px]">✓</span>}
                                  </div>
                                  <input type="checkbox" className="hidden" checked={editingProduct.sableDressage || false} onChange={e => setEditingProduct({...editingProduct, sableDressage: e.target.checked})} />
                                  <span className="text-sm font-medium text-gray-700">Enable Dressage Option</span>
                                </label>
                             )}
                          </div>

                          <button type="submit" className="w-full bg-layen-gold text-white py-4 font-bold uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors shadow-xl text-xs">
                            ☁️ Publish to Live Website
                          </button>
                       </div>
                    </form>
                 </div>
               )}
            </div>
          )}

          {/* RECIPES TAB */}
          {activeTab === 'recipes' && (
            <div>
               {!editingRecipe ? (
                 <>
                   <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                      <h3 className="text-2xl font-serif text-[#1a1a1a]">Behind The Scenes / Stories</h3>
                      <button onClick={createNewRecipe} className="bg-[#1a1a1a] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-layen-gold transition-colors shadow-xl">
                        + New Story
                      </button>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                     {recipes.map(recipe => (
                       <div key={recipe.id} className="group border border-gray-100 p-0 hover:shadow-2xl hover:border-layen-gold/20 transition-all duration-500 bg-white relative overflow-hidden flex flex-col">
                         <div className="h-64 w-full bg-gray-50 mb-0 overflow-hidden relative">
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10"></div>
                           <img src={recipe.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         </div>
                         <div className="p-6 flex-grow">
                           <h4 className="font-bold text-[#1a1a1a] text-xl font-serif mb-2">{recipe.title}</h4>
                           <p className="text-gray-500 font-sans text-sm line-clamp-3 leading-relaxed">{recipe.content}</p>
                         </div>
                         <div className="flex border-t border-gray-50">
                            <button onClick={() => { setEditingRecipe(recipe); setIsNewRecipe(false); }} className="flex-1 py-4 text-[9px] font-bold text-gray-500 uppercase hover:bg-gray-50 hover:text-[#1a1a1a] transition-colors">Edit Story</button>
                            <div className="w-[1px] bg-gray-50"></div>
                            <button onClick={() => deleteRecipe(recipe.id)} className="flex-1 py-4 text-[9px] font-bold text-red-300 uppercase hover:bg-red-50 hover:text-red-500 transition-colors">Remove</button>
                         </div>
                       </div>
                     ))}
                   </div>
                   {recipes.length === 0 && (
                     <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-sm">
                       <p className="text-gray-400 italic">No stories available. Create one to show "Les Coulisses" content.</p>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                      <h3 className="text-3xl font-serif text-[#1a1a1a]">{isNewRecipe ? 'New Story' : 'Edit Story'}</h3>
                      <button onClick={() => setEditingRecipe(null)} className="text-[10px] text-gray-400 hover:text-layen-gold uppercase tracking-widest transition-colors">Cancel & Close</button>
                    </div>
                    <form onSubmit={handleSaveRecipe} className="grid md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                          <div>
                            <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Title</label>
                            <input required type="text" value={editingRecipe.title} onChange={e => setEditingRecipe({...editingRecipe, title: e.target.value})} className="w-full border-b border-gray-200 py-3 text-lg font-serif focus:border-layen-gold outline-none transition-colors" />
                          </div>
                          <div>
                             <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Story Content</label>
                             <textarea required value={editingRecipe.content} onChange={e => setEditingRecipe({...editingRecipe, content: e.target.value})} className="w-full border border-gray-200 p-4 h-64 rounded-sm focus:border-layen-gold outline-none transition-colors resize-none leading-relaxed" placeholder="Tell the story behind the sweets..." />
                          </div>
                       </div>
                       <div className="space-y-8">
                          <div>
                            <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Story Image (Les Coulisses)</label>
                            <div className="bg-gray-50/50 border border-dashed border-gray-200 p-8 text-center rounded-sm hover:border-layen-gold/30 transition-colors">
                               {editingRecipe.image && <img src={editingRecipe.image} className="h-48 mx-auto mb-6 object-cover shadow-md w-full" />}
                               {renderUploadButton('recipe', 'recipeImage', editingRecipe.image)}
                            </div>
                          </div>
                          
                          <button type="submit" className="w-full bg-layen-gold text-white py-4 font-bold uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors shadow-xl text-xs">
                            ☁️ Publish Story Live
                          </button>
                       </div>
                    </form>
                 </div>
               )}
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="max-w-6xl mx-auto">
               <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                 <h3 className="text-2xl font-serif text-[#1a1a1a]">Aesthetics & Brand</h3>
                 <button onClick={handleContentSave} className="bg-green-600 text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg">
                   ☁️ Publish Changes
                 </button>
               </div>

               <div className="grid lg:grid-cols-2 gap-16">
                  <section className="space-y-8">
                    <div className="flex items-center gap-4 text-layen-gold mb-2">
                       <div className="w-8 h-[1px] bg-layen-gold"></div>
                       <h4 className="font-serif text-xl">Hero Section</h4>
                    </div>
                    
                    <div>
                        <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Main Headline</label>
                        <textarea value={content.heroTitle} onChange={e => setContent({...content, heroTitle: e.target.value})} className="w-full border p-4 rounded-sm text-2xl font-serif h-32 focus:border-layen-gold outline-none transition-colors bg-white shadow-sm resize-none" />
                    </div>
                    
                    <div className="space-y-6 pt-6 border-t border-gray-50">
                        <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Visual Composition</label>
                        
                        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                           <span className="text-[10px] font-bold text-[#1a1a1a] mb-4 block uppercase tracking-wider">Centerpiece Image</span>
                           {renderUploadButton('content', 'heroImage', content.heroImage)}
                           {content.heroImage && <img src={content.heroImage} className="h-24 mt-4 object-cover border border-gray-100" />}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                             <span className="text-[10px] font-bold text-[#1a1a1a] mb-4 block uppercase tracking-wider">Top Left Decor</span>
                             {renderUploadButton('content', 'heroImage2', content.heroImage2)}
                             {content.heroImage2 && <img src={content.heroImage2} className="h-16 mt-4 object-cover border border-gray-100" />}
                          </div>
                          <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                             <span className="text-[10px] font-bold text-[#1a1a1a] mb-4 block uppercase tracking-wider">Bottom Right Decor</span>
                             {renderUploadButton('content', 'heroImage3', content.heroImage3)}
                             {content.heroImage3 && <img src={content.heroImage3} className="h-16 mt-4 object-cover border border-gray-100" />}
                          </div>
                        </div>
                      </div>
                  </section>

                  <section className="space-y-8">
                     <div className="flex items-center gap-4 text-layen-gold mb-2">
                       <div className="w-8 h-[1px] bg-layen-gold"></div>
                       <h4 className="font-serif text-xl">Brand Story</h4>
                    </div>

                     <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                        <div className="mb-6">
                           <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">About Title</label>
                           <input type="text" value={content.aboutTitle} onChange={e => setContent({...content, aboutTitle: e.target.value})} className="w-full border-b border-gray-200 py-2 text-lg font-serif focus:border-layen-gold outline-none transition-colors" />
                        </div>
                        <div className="mb-6">
                           <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Story Description</label>
                           <textarea value={content.aboutText} onChange={e => setContent({...content, aboutText: e.target.value})} className="w-full border border-gray-200 p-4 rounded-sm h-48 text-sm leading-relaxed focus:border-layen-gold outline-none transition-colors resize-none" />
                        </div>
                        <div className="mb-6">
                           <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Chef Secret Quote (Footer of Recipes)</label>
                           <textarea value={content.chefQuote} onChange={e => setContent({...content, chefQuote: e.target.value})} className="w-full border border-gray-200 p-4 rounded-sm h-24 text-sm leading-relaxed focus:border-layen-gold outline-none transition-colors resize-none italic" placeholder="Enter the secret quote..." />
                        </div>
                        <div>
                           <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Featured Image</label>
                           {renderUploadButton('content', 'aboutImage', content.aboutImage)}
                           {content.aboutImage && <img src={content.aboutImage} className="h-40 w-full object-cover mt-4 rounded-sm border border-gray-100" />}
                        </div>
                     </div>
                  </section>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};