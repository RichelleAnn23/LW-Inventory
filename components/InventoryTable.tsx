import React from 'react';
import { Product, SortField, SortOrder } from '../types';
import { Edit2, Trash2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

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
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onSort('batchId')}>
                Batch ID {renderSortIcon('batchId')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onSort('name')}>
                Product Name {renderSortIcon('name')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onSort('price')}>
                Price {renderSortIcon('price')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onSort('stock')}>
                Stock {renderSortIcon('stock')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onSort('category')}>
                Category {renderSortIcon('category')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onSort('expiryDate')}>
                Expiry Date {renderSortIcon('expiryDate')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100">
                Status
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-gray-100">
                Barcode
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
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
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.batchId || `B${String(product.id).slice(-3).padStart(3, '0')}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    ₱{product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{product.stock}</span>
                      {product.stock <= product.minStock && (
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Below min stock"></div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.category || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.expiryDate || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const status = getStockStatus(product.stock, product.minStock);
                      const StatusIcon = status.icon;
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color} border`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.text}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.barcode || '-'}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => onEdit(product)}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onToggleActive(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
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
