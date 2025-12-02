import React, { useState, useMemo, useCallback } from 'react';
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
  Box,
  ChevronDown,
  Download
} from 'lucide-react';

const App = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce search input
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearchTerm = useCallback(
    debounce((term: string) => setSearchTerm(term), 300),
    []
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearchTerm(value);
  };
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');

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

  // Stock status options
  const stockStatusOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  // Handle stock status filter change
  const handleStockStatusFilter = (status: string) => {
    setStockStatusFilter(status);
    setIsFilterOpen(false);
    
    // Log the current filter state for debugging
    console.log('Filter changed to:', status);
  };

  const handleExport = () => {
    const exportData = filteredProducts.map(product => ({
      'Batch ID': product.batchId || `B${String(product.id).slice(-3).padStart(3, '0')}`,
      'Product Name': product.name,
      'Category': product.category,
      'Description': product.description || '',
      'Price': `₱${product.price.toFixed(2)}`,
      'Cost': `₱${product.cost.toFixed(2)}`,
      'Stock': product.stock,
      'Min Stock': product.minStock,
      'Status': product.stock === 0 ? 'Out of Stock' : 
                product.stock <= product.minStock ? 'Low Stock' : 'In Stock',
      'Expiry Date': product.expiryDate || 'N/A',
      'Barcode': product.barcode || '',
      'Last Updated': new Date(product.updatedAt).toLocaleDateString()
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(fieldName => 
          `"${String(row[fieldName as keyof typeof row] || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    console.log('Filtering products with:', {
      searchTerm,
      selectedCategory,
      stockStatusFilter,
      totalProducts: products.length
    });

    let result = products.filter(p => {
      // 1. Search filter (optimized with early return)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!p.name.toLowerCase().includes(term) && 
            !(p.barcode && p.barcode.toLowerCase().includes(term))) {
          return false;
        }
      }

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      
      // Enhanced stock status filtering with debugging
      const isOutOfStock = p.stock === 0;
      const isLowStock = p.stock > 0 && p.stock <= p.minStock;
      const isInStock = p.stock > p.minStock;
      
      const matchesStockStatus = 
        stockStatusFilter === 'all' ||
        (stockStatusFilter === 'out_of_stock' && isOutOfStock) ||
        (stockStatusFilter === 'low_stock' && isLowStock) ||
        (stockStatusFilter === 'in_stock' && isInStock);
      
      const isMatch = matchesCategory && matchesStockStatus;
      
      if (isMatch) {
        console.log('Product matches filters:', {
          name: p.name,
          stock: p.stock,
          minStock: p.minStock,
          status: isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock',
          matchesCategory,
          matchesStockStatus
        });
      }
      
      return isMatch;
    });
    
    console.log(`Filter result: ${result.length} of ${products.length} products match the filters`);

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
  }, [products, searchTerm, selectedCategory, sortField, sortOrder, stockStatusFilter]);

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
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">LW Inventory</h1>
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
                  onChange={handleSearchChange}
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

            <div className="flex space-x-4">
              <div className="relative inline-block text-left">
                <div>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {stockStatusOptions.find(opt => opt.value === stockStatusFilter)?.label || 'Filter'}
                    <ChevronDown className="w-4 h-4 ml-2 -mr-1" />
                  </button>
                </div>

                {isFilterOpen && (
                  <div className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="filter-menu">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Stock Status</div>
                      {stockStatusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStockStatusFilter(option.value)}
                          className={`block w-full px-4 py-2 text-sm text-left ${
                            stockStatusFilter === option.value 
                              ? 'bg-gray-100 text-gray-900' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          role="menuitem"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleExport}
                disabled={filteredProducts.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to CSV"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button 
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
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
