import React, { useState, useMemo } from 'react';
import { MOCK_PRODUCTS, CATEGORIES } from './constants';
import { Product, SortField, SortOrder } from './types';
import { InventoryTable } from './components/InventoryTable';
import { ProductModal } from './components/ProductModal';
import { StatsCard } from './components/StatsCard';
import { analyzeInventoryHealth } from './services/geminiService';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  Plus, 
  Filter, 
  Brain,
  X,
  RefreshCcw,
  Box
} from 'lucide-react';

const App = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Derived Stats
  const stats = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
    const lowStock = products.filter(p => p.stock <= p.minStock).length;
    return {
      totalProducts: products.length,
      totalValue,
      lowStock,
      expired: products.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date()).length
    };
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.barcode && p.barcode.includes(searchQuery));
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesActive = p.isActive; // Only show active by default? Let's show all but visualize archived
      
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle nulls
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, sortField, sortOrder]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData, updatedAt: new Date().toISOString() } as Product : p));
    } else {
      const newProduct: Product = {
        ...productData as Product,
        id: Math.max(...products.map(p => p.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const handleDeleteToggle = (id: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const openAddModal = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    setAiInsights(null);
    const result = await analyzeInventoryHealth(products);
    setAiInsights(result);
    setLoadingInsights(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Box className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Lumina Inventory</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Welcome back, Admin</span>
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                AD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Inventory Value" 
            value={`₱${stats.totalValue.toLocaleString()}`} 
            icon={DollarSign} 
            colorClass="bg-emerald-500"
            trend="+12% vs last month"
            trendColor="text-green-500"
          />
           <StatsCard 
            title="Total Products" 
            value={stats.totalProducts} 
            icon={Package} 
            colorClass="bg-blue-500"
          />
          <StatsCard 
            title="Low Stock Items" 
            value={stats.lowStock} 
            icon={AlertTriangle} 
            colorClass="bg-amber-500"
            trend="Action needed"
            trendColor="text-amber-600"
          />
          <StatsCard 
            title="Expired / Risks" 
            value={stats.expired} 
            icon={AlertTriangle} 
            colorClass="bg-red-500"
          />
        </div>

        {/* AI Action Area */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-indigo-200" />
                <h3 className="font-semibold text-lg">AI Smart Analysis</h3>
              </div>
              <p className="text-indigo-100 max-w-xl text-sm leading-relaxed">
                Use Gemini to analyze your stock levels, profit margins, and sales velocity to get actionable restocking advice.
              </p>
              
              {aiInsights && (
                 <div className="mt-4 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm">Analysis Results:</h4>
                      <button onClick={() => setAiInsights(null)} className="text-white/60 hover:text-white"><X size={14}/></button>
                    </div>
                    <div 
                      className="text-sm space-y-1 list-disc pl-4 [&>ul]:list-disc [&>ul]:pl-4" 
                      dangerouslySetInnerHTML={{ __html: aiInsights }} 
                    />
                 </div>
              )}
            </div>
            
            {!aiInsights && (
              <button 
                onClick={handleGetInsights}
                disabled={loadingInsights}
                className="whitespace-nowrap px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingInsights ? <RefreshCcw className="animate-spin h-4 w-4"/> : <Brain className="h-4 w-4"/>}
                {loadingInsights ? 'Analyzing...' : 'Analyze Health'}
              </button>
            )}
          </div>
          
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
        </div>

        {/* Controls & Table */}
        <div className="space-y-4">
          
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search by name or barcode..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                 <select 
                  className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer hover:bg-gray-50"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                 >
                   {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
            </div>

            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-md shadow-indigo-200"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>

          <InventoryTable 
            products={filteredProducts}
            onEdit={openEditModal}
            onToggleActive={handleDeleteToggle}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          <div className="text-center text-xs text-gray-400 py-4">
             Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </main>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  );
};

export default App;
