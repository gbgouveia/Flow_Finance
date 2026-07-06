import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Trash2,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Dropdown from './Dropdown';
import clsx from 'clsx';

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  searchPlaceholder = 'Buscar...',
  searchKey = 'description',
  filterKey = '',
  filterOptions = [],
  actions = [],
  bulkActions = [],
  onDeleteSelected
}) {
  const [query, setQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRows, setSelectedRows] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');

  // Handle Sort Toggle
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = '';
      key = '';
    }
    setSortConfig({ key, direction });
  };

  // Reset page when filter/query changes
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setCurrentPage(1);
    setSelectedRows({});
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    setSelectedRows({});
  };

  // Filter & Search & Sort logic
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter by category or status
    if (filterKey && activeFilter !== 'all') {
      result = result.filter(item => item[filterKey] === activeFilter);
    }

    // Search query
    if (query) {
      result = result.filter(item => {
        const val = item[searchKey];
        return val ? String(val).toLowerCase().includes(query.toLowerCase()) : false;
      });
    }

    // Sort config
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // String comparison
        if (typeof aVal === 'string') {
          return sortConfig.direction === 'ascending'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        // Numeric or dates
        return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [data, query, sortConfig, filterKey, activeFilter, searchKey]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelected = {};
      paginatedData.forEach(row => {
        newSelected[row.id] = true;
      });
      setSelectedRows(newSelected);
    } else {
      setSelectedRows({});
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRows[row.id]);

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-secondary/20 p-3 rounded-lg border border-border-custom backdrop-blur-sm">
        
        {/* Search */}
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 text-text-secondary/40 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-custom bg-bg-card/40 text-text-primary text-xs placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-purple/50 focus:border-brand-purple/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {filterKey && filterOptions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-text-secondary/60" />
              <select
                value={activeFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="bg-bg-card/40 border border-border-custom text-text-secondary text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer hover:border-brand-purple/30"
              >
                <option value="all" className="bg-bg-card">Todos</option>
                {filterOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-bg-card">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-bg-card/40 border border-border-custom text-text-secondary text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer hover:border-brand-purple/30"
          >
            {[5, 10, 20, 50].map(sz => (
              <option key={sz} value={sz} className="bg-bg-card">
                {sz} linhas
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Action Banner */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between px-4 py-2.5 bg-brand-purple/10 border border-brand-purple/20 rounded-lg text-xs"
          >
            <span className="text-brand-purple font-medium">
              {selectedCount} item{selectedCount > 1 ? 'ns' : ''} selecionado{selectedCount > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              {bulkActions.map((act, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  icon={act.icon}
                  className="py-1 px-2.5 text-[10px]"
                  onClick={() => act.onClick(Object.keys(selectedRows).filter(k => selectedRows[k]))}
                >
                  {act.label}
                </Button>
              ))}
              {onDeleteSelected && (
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  className="py-1 px-2.5 text-[10px]"
                  onClick={() => {
                    onDeleteSelected(Object.keys(selectedRows).filter(k => selectedRows[k]));
                    setSelectedRows({});
                  }}
                >
                  Excluir Selecionados
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-border-custom bg-bg-card/20 backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-custom bg-bg-secondary/40 text-text-secondary text-xs uppercase tracking-wider font-manrope font-semibold select-none">
              {/* Checkbox Header */}
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-3.5 h-3.5 rounded border-border-custom text-brand-purple accent-brand-purple focus:ring-0 focus:outline-none cursor-pointer"
                />
              </th>
              
              {/* Column Headers */}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={clsx(
                    'py-3 px-4 cursor-pointer hover:text-text-primary transition-colors',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center'
                  )}
                  onClick={() => !col.disableSort && requestSort(col.key)}
                >
                  <div className={clsx(
                    'flex items-center gap-1',
                    col.align === 'right' && 'justify-end',
                    col.align === 'center' && 'justify-center'
                  )}>
                    {col.label}
                    {!col.disableSort && sortConfig.key === col.key ? (
                      sortConfig.direction === 'ascending' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    ) : (
                      !col.disableSort && <ChevronDown size={12} className="opacity-20" />
                    )}
                  </div>
                </th>
              ))}
              
              {/* Actions Header */}
              {actions.length > 0 && <th className="py-3 px-4 w-12 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: pageSize }).map((_, rIdx) => (
                <tr key={`sk-${rIdx}`} className="border-b border-border-custom/50">
                  <td className="py-4 px-4"><div className="h-3.5 w-3.5 rounded skeleton-pulse" /></td>
                  {columns.map((col, cIdx) => (
                    <td key={`sk-${rIdx}-${cIdx}`} className="py-4 px-4">
                      <div className={clsx('h-3.5 rounded skeleton-pulse', col.align === 'right' ? 'ml-auto w-12' : 'w-24')} />
                    </td>
                  ))}
                  {actions.length > 0 && <td className="py-4 px-4"><div className="h-6 w-6 rounded mx-auto skeleton-pulse" /></td>}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 2 : 1)} className="py-12 text-center text-xs text-text-secondary">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              // Real Rows
              paginatedData.map(row => {
                const isSelected = !!selectedRows[row.id];
                return (
                  <tr
                    key={row.id}
                    className={clsx(
                      'border-b border-border-custom/50 text-xs transition-colors hover:bg-white/[0.02]',
                      isSelected && 'bg-brand-purple/[0.03]'
                    )}
                  >
                    {/* Row Checkbox */}
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(row.id)}
                        className="w-3.5 h-3.5 rounded border-border-custom text-brand-purple accent-brand-purple focus:ring-0 focus:outline-none cursor-pointer"
                      />
                    </td>

                    {/* Column Cells */}
                    {columns.map(col => (
                      <td
                        key={`${row.id}-${col.key}`}
                        className={clsx(
                          'py-3 px-4 text-text-secondary font-medium',
                          col.align === 'right' && 'text-right font-mono text-text-primary',
                          col.align === 'center' && 'text-center'
                        )}
                      >
                        {col.cell ? col.cell(row) : row[col.key]}
                      </td>
                    ))}

                    {/* Actions dropdown */}
                    {actions.length > 0 && (
                      <td className="py-3 px-4 text-center">
                        <Dropdown
                          align="right"
                          trigger={
                            <button className="p-1 hover:bg-white/5 rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus:outline-none">
                              <MoreHorizontal size={14} />
                            </button>
                          }
                          items={actions.map(act => ({
                            label: act.label,
                            icon: act.icon,
                            danger: act.danger,
                            onClick: () => act.onClick(row)
                          }))}
                        />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && processedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 text-xs text-text-secondary font-manrope">
          <div>
            Mostrando <span className="font-semibold text-text-primary">{(currentPage - 1) * pageSize + 1}</span> a{' '}
            <span className="font-semibold text-text-primary">
              {Math.min(currentPage * pageSize, processedData.length)}
            </span>{' '}
            de <span className="font-semibold text-text-primary">{processedData.length}</span> registros
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1 min-w-[32px] h-[32px]"
            >
              <ChevronsLeft size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 min-w-[32px] h-[32px]"
            >
              <ChevronLeft size={14} />
            </Button>
            
            <div className="px-3 text-xs">
              Página <span className="font-semibold text-text-primary">{currentPage}</span> de{' '}
              <span className="font-semibold text-text-primary">{totalPages}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 min-w-[32px] h-[32px]"
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1 min-w-[32px] h-[32px]"
            >
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
