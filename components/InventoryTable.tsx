import React from 'react';
import { Product, SortField, SortOrder } from '../types';
import { Edit2, Archive, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InventoryTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onToggleActive: (id: number) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ 
  products, onEdit, onToggleActive, sortField, sortOrder, onSort 
}) => {
  
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, text: 'Out of Stock' };
    if (stock <= minStock) return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertTriangle, text: 'Low Stock' };
    return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, text: 'In Stock' };
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => onSort('name')}>
                Product Details {renderSortIcon('name')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => onSort('price')}>
                Financials {renderSortIcon('price')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => onSort('stock')}>
                Stock Level {renderSortIcon('stock')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => onSort('expiryDate')}>
                Status {renderSortIcon('expiryDate')}
              </th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                   No products found. Try adjusting your filters or add a new product.
                 </td>
               </tr>
            ) : products.map((product) => {
              const status = getStockStatus(product.stock, product.minStock);
              const expired = isExpired(product.expiryDate);
              const margin = product.price - product.cost;
              const marginPercent = product.cost > 0 ? ((margin / product.cost) * 100).toFixed(0) : '0';

              return (
                <tr key={product.id} className="hover:bg-gray-50/50 transition duration-150 group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{product.name}</span>
                      <span className="text-xs text-gray-500">{product.category} • {product.barcode || 'No Barcode'}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-gray-900">₱{product.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-400 line-through">₱{product.cost.toFixed(2)}</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">+{marginPercent}% Margin</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{product.stock} units</span>
                      {product.stock <= product.minStock && (
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Below min stock"></div>
                      )}
                    </div>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                       <div 
                        className={`h-full rounded-full ${product.stock <= product.minStock ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min((product.stock / (product.minStock * 3)) * 100, 100)}%` }}
                       ></div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                        <status.icon size={12} />
                        {status.text}
                      </span>
                      {expired && (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                           Expired
                         </span>
                      )}
                      {!expired && product.expiryDate && (
                        <span className="text-xs text-gray-400">Exp: {new Date(product.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(product)}
                        className="p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onToggleActive(product.id)}
                        className={`p-2 rounded-lg transition ${product.isActive ? 'text-gray-500 hover:bg-red-50 hover:text-red-600' : 'text-green-600 hover:bg-green-50'}`}
                        title={product.isActive ? "Archive" : "Restore"}
                      >
                        <Archive size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
