export const exportToCsv = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const csvContent = [
    Object.keys(data[0]).join(','), // Header row
    ...data.map(item => 
      Object.values(item)
        .map(value => 
          value === null || value === undefined ? '' : 
          `"${String(value).replace(/"/g, '""')}"`
        )
        .join(',')
    )
  ].join('\n');

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
