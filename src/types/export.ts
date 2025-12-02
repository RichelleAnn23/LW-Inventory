export interface ExportProduct {
  'Batch ID': string;
  'Product Name': string;
  'Category': string;
  'Description': string;
  'Price': string;
  'Cost': string;
  'Stock': number;
  'Min Stock': number;
  'Status': 'In Stock' | 'Low Stock' | 'Out of Stock';
  'Expiry Date': string;
  'Barcode': string;
  'Last Updated': string;
}
