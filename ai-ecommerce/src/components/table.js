"use client";

import React, { useState, useMemo } from "react";
import { appTheme } from "../constants/theme";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { 
  FaFilePdf, 
  FaFileExcel, 
  FaPrint, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaSortUp, 
  FaSortDown, 
  FaCaretLeft, 
  FaCaretRight, 
  FaAngleDoubleLeft, 
  FaAngleDoubleRight, 
  FaInbox, 
  FaTimesCircle,
  FaToggleOn,
  FaToggleOff,
  FaStar,
  FaFire,
  FaTag
} from 'react-icons/fa';

export function DataTable({
  columns,
  data,
  title = "Data Table",
  onEdit = () => {},
  onDelete = () => {},
  onToggleStatus = () => {},
  itemsPerPage = 10,
  searchable = true,
  pagination = true,
  exportable = true,
  isMobile = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Safe value formatter to prevent undefined errors
  const safeValue = (value, defaultValue = '') => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    return value;
  };

  // Safe toFixed wrapper
  const safeToFixed = (value, digits = 2) => {
    if (value === null || value === undefined) return '0.00';
    if (typeof value === 'number') return value.toFixed(digits);
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(digits);
  };

  // Sort logic with safe comparison
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !data) return data || [];
    
    return [...(data || [])].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle undefined values
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      // Handle different types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Default string comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Filter logic with safe search
  const filteredData = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return [];
    if (!searchTerm.trim()) return sortedData;

    const term = searchTerm.toLowerCase().trim();
    
    return sortedData.filter((row) => {
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  }, [sortedData, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const paginatedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, itemsPerPage]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // PDF Download with safe data handling
  const downloadPDF = () => {
    if (!filteredData || filteredData.length === 0) return;
    
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.setTextColor(
      parseInt(appTheme.colors.primary.slice(1, 3), 16),
      parseInt(appTheme.colors.primary.slice(3, 5), 16),
      parseInt(appTheme.colors.primary.slice(5, 7), 16)
    );
    doc.text(title, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 28);
    doc.text(`Total Records: ${filteredData.length}`, 14, 35);

    const tableColumn = columns.map((col) => col.header);
    const tableRows = filteredData.map((row) =>
      columns.map((col) => {
        const value = row[col.accessor];
        
        // Handle custom cell rendering
        if (col.cell && typeof col.cell === 'function') {
          try {
            const element = col.cell(value, row);
            // Try to extract text content from React element
            if (element && element.props) {
              if (element.props.children) {
                if (typeof element.props.children === 'string') {
                  return element.props.children;
                }
                if (Array.isArray(element.props.children)) {
                  return element.props.children
                    .map(child => child && child.props ? child.props.children : child)
                    .filter(Boolean)
                    .join(' ');
                }
              }
            }
            return String(value || '');
          } catch (e) {
            return String(value || '');
          }
        }
        
        // Handle different value types
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'number') return value.toFixed(2);
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [51, 51, 51],
        lineColor: [200, 200, 200],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [
          parseInt(appTheme.colors.primary.slice(1, 3), 16),
          parseInt(appTheme.colors.primary.slice(3, 5), 16),
          parseInt(appTheme.colors.primary.slice(5, 7), 16)
        ],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      margin: { top: 40 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${data.pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }
    });

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Excel Download with safe data handling
  const downloadExcel = () => {
    if (!filteredData || filteredData.length === 0) return;
    
    const flattenedData = filteredData.map(row => {
      const flatRow = {};
      columns.forEach(col => {
        const value = row[col.accessor];
        
        // Handle custom cell rendering
        if (col.cell && typeof col.cell === 'function') {
          try {
            const element = col.cell(value, row);
            if (element && element.props) {
              if (element.props.children) {
                if (typeof element.props.children === 'string') {
                  flatRow[col.header] = element.props.children;
                } else {
                  flatRow[col.header] = String(value || '');
                }
              } else {
                flatRow[col.header] = String(value || '');
              }
            } else {
              flatRow[col.header] = String(value || '');
            }
          } catch (e) {
            flatRow[col.header] = String(value || '');
          }
        } else {
          // Handle different value types
          if (value === null || value === undefined) {
            flatRow[col.header] = '';
          } else if (typeof value === 'boolean') {
            flatRow[col.header] = value ? 'Yes' : 'No';
          } else if (typeof value === 'number') {
            flatRow[col.header] = value;
          } else if (typeof value === 'object') {
            flatRow[col.header] = JSON.stringify(value);
          } else {
            flatRow[col.header] = value;
          }
        }
      });
      return flatRow;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    
    // Auto-size columns
    const maxWidth = 50;
    const wscols = columns.map(col => ({
      wch: Math.min(maxWidth, col.header.length + 10)
    }));
    worksheet['!cols'] = wscols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print Table with safe data handling
  const handlePrint = () => {
    if (!filteredData || filteredData.length === 0) return;
    
    const printWindow = window.open('', '_blank', 'width=1400,height=900');
    
    const renderCellContent = (row, col) => {
      const value = row[col.accessor];
      
      if (col.cell && typeof col.cell === 'function') {
        try {
          const element = col.cell(value, row);
          if (element && element.props) {
            if (element.props.children) {
              if (typeof element.props.children === 'string') {
                return element.props.children;
              }
              if (Array.isArray(element.props.children)) {
                return element.props.children
                  .map(child => {
                    if (typeof child === 'string') return child;
                    if (child && child.props) {
                      if (child.props.children) return child.props.children;
                      if (child.props.label) return child.props.label;
                    }
                    return '';
                  })
                  .filter(Boolean)
                  .join(' ');
              }
            }
          }
          return String(value || '');
        } catch (e) {
          return String(value || '');
        }
      }
      
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number') return safeToFixed(value);
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    };
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${new Date().toLocaleDateString()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
              margin: 30px; 
              color: #1a1a1a; 
              background: white; 
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px; 
              border-bottom: 3px solid ${appTheme.colors.primary}; 
            }
            .print-header h1 { 
              color: ${appTheme.colors.primary}; 
              margin: 0 0 8px 0; 
              font-size: 28px; 
              font-weight: 700; 
            }
            .print-meta { 
              display: flex; 
              justify-content: space-between; 
              margin-top: 15px; 
              font-size: 13px; 
              color: #666; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            th { 
              background: ${appTheme.colors.primary};
              color: white !important;
              padding: 15px 12px;
              text-align: left;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border: none !important;
            }
            td { 
              padding: 12px;
              border-bottom: 1px solid #e8e8e8;
              background: white;
              vertical-align: middle;
            }
            tr:nth-child(even) td {
              background-color: #fafafa;
            }
            tr:hover td {
              background-color: #f5f5f5;
            }
            .action-buttons {
              display: none;
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
            }
            @media print {
              body { margin: 15px; }
              .print-header { margin-bottom: 20px; }
              th { background: ${appTheme.colors.primary} !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${title}</h1>
            <p>Comprehensive Data Report</p>
            <div class="print-meta">
              <span>Total Records: ${filteredData.length}</span>
              <span>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(row => `
                <tr>
                  ${columns.map(col => {
                    const content = renderCellContent(row, col);
                    return `<td>${content}</td>`;
                  }).join('')}
                  <td>
                    <span class="badge" style="background: ${appTheme.colors.primary}15; color: ${appTheme.colors.primary}">
                      ${row.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    }, 500);
  };

  // Don't render DataTable on mobile - should be handled by parent
  if (isMobile) {
    return null;
  }

  return (
    <div
      style={{
        background: appTheme.colors.surface,
        padding: "24px",
        borderRadius: "12px",
        fontFamily: appTheme.fonts.primary,
        color: appTheme.colors.textPrimary,
        border: `1px solid ${appTheme.colors.border}`,
        width: "100%",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)"
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            color: appTheme.colors.textPrimary, 
            fontWeight: "700",
            fontSize: "1.5rem",
            margin: 0,
            lineHeight: 1.2,
          }}>
            {title}
          </h1>
          <p style={{ 
            color: appTheme.colors.textSecondary, 
            margin: "8px 0 0 0",
            fontSize: "0.9rem",
            fontWeight: "500",
          }}>
            {filteredData?.length || 0} records • Page {currentPage} of {Math.max(1, totalPages)}
          </p>
        </div>

        {/* Actions */}
        {exportable && filteredData?.length > 0 && (
          <div style={{ 
            display: "flex", 
            gap: "8px",
            flexWrap: "wrap"
          }}>
            <button
              onClick={downloadPDF}
              style={{
                backgroundColor: `${appTheme.colors.secondary}15`,
                border: `1px solid ${appTheme.colors.secondary}30`,
                color: appTheme.colors.secondary,
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = appTheme.colors.secondary;
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${appTheme.colors.secondary}15`;
                e.currentTarget.style.color = appTheme.colors.secondary;
              }}
            >
              <FaFilePdf size={14} />
              PDF
            </button>
            <button
              onClick={downloadExcel}
              style={{
                backgroundColor: `${appTheme.colors.success}15`,
                border: `1px solid ${appTheme.colors.success}30`,
                color: appTheme.colors.success,
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = appTheme.colors.success;
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${appTheme.colors.success}15`;
                e.currentTarget.style.color = appTheme.colors.success;
              }}
            >
              <FaFileExcel size={14} />
              Excel
            </button>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: `${appTheme.colors.warning}15`,
                border: `1px solid ${appTheme.colors.warning}30`,
                color: appTheme.colors.warning,
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = appTheme.colors.warning;
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${appTheme.colors.warning}15`;
                e.currentTarget.style.color = appTheme.colors.warning;
              }}
            >
              <FaPrint size={14} />
              Print
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      {searchable && (
        <div style={{
          marginBottom: "24px",
          position: "relative"
        }}>
          <FaSearch 
            size={16}
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: appTheme.colors.textSecondary
            }}
          />
          <input
            type="text"
            placeholder="Search across all columns..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "100%",
              padding: "12px 16px 12px 44px",
              border: `1px solid ${appTheme.colors.border}`,
              borderRadius: "8px",
              outline: "none",
              fontSize: "0.9rem",
              backgroundColor: appTheme.colors.background,
              transition: "all 0.2s ease"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = appTheme.colors.primary;
              e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = appTheme.colors.border;
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      )}

      {/* Table Container */}
      <div style={{ 
        overflowX: "auto",
        borderRadius: "8px",
        border: `1px solid ${appTheme.colors.border}`,
        background: appTheme.colors.background,
        width: "100%"
      }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            minWidth: "800px",
          }}
        >
          <thead>
            <tr style={{
              background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
            }}>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={{
                    padding: "16px",
                    fontWeight: "600",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    color: "white",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap"
                  }}
                  onClick={() => handleSort(col.accessor)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {col.header}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <FaSortUp size={10} style={{ 
                        color: sortConfig.key === col.accessor && sortConfig.direction === 'asc' ? 'white' : 'rgba(255,255,255,0.5)',
                        marginBottom: "-2px"
                      }} />
                      <FaSortDown size={10} style={{ 
                        color: sortConfig.key === col.accessor && sortConfig.direction === 'desc' ? 'white' : 'rgba(255,255,255,0.5)',
                        marginTop: "-2px"
                      }} />
                    </div>
                  </div>
                </th>
              ))}
              <th style={{
                padding: "16px",
                fontWeight: "600",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                color: "white",
                whiteSpace: "nowrap"
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{
                    borderBottom: `1px solid ${appTheme.colors.border}`,
                    background: rowIdx % 2 === 0 ? appTheme.colors.surface : appTheme.colors.background,
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${appTheme.colors.primary}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = rowIdx % 2 === 0 ? appTheme.colors.surface : appTheme.colors.background;
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{ 
                      padding: "14px 16px", 
                      fontSize: "0.875rem",
                      verticalAlign: "middle"
                    }}>
                      {col.cell ? col.cell(safeValue(row[col.accessor]), row) : safeValue(row[col.accessor])}
                    </td>
                  ))}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => onEdit(row)}
                        style={{
                          backgroundColor: `${appTheme.colors.primary}15`,
                          color: appTheme.colors.primary,
                          border: `1px solid ${appTheme.colors.primary}30`,
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = appTheme.colors.primary;
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${appTheme.colors.primary}15`;
                          e.currentTarget.style.color = appTheme.colors.primary;
                        }}
                      >
                        <FaEdit size={12} />
                        Edit
                      </button>
                      {onToggleStatus && (
                        <button
                          onClick={() => onToggleStatus(row)}
                          style={{
                            backgroundColor: row.isActive ? `${appTheme.colors.warning}15` : `${appTheme.colors.success}15`,
                            color: row.isActive ? appTheme.colors.warning : appTheme.colors.success,
                            border: `1px solid ${row.isActive ? appTheme.colors.warning + '30' : appTheme.colors.success + '30'}`,
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = row.isActive ? appTheme.colors.warning : appTheme.colors.success;
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = row.isActive ? `${appTheme.colors.warning}15` : `${appTheme.colors.success}15`;
                            e.currentTarget.style.color = row.isActive ? appTheme.colors.warning : appTheme.colors.success;
                          }}
                        >
                          {row.isActive ? <FaToggleOff size={12} /> : <FaToggleOn size={12} />}
                          {row.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(row)}
                        style={{
                          backgroundColor: `${appTheme.colors.error}15`,
                          color: appTheme.colors.error,
                          border: `1px solid ${appTheme.colors.error}30`,
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = appTheme.colors.error;
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${appTheme.colors.error}15`;
                          e.currentTarget.style.color = appTheme.colors.error;
                        }}
                      >
                        <FaTrash size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{
                    textAlign: "center",
                    padding: "60px 40px",
                    color: appTheme.colors.textSecondary,
                    background: "transparent",
                  }}
                >
                  <FaInbox size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                  <div style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: appTheme.colors.textPrimary
                  }}>
                    No records found
                  </div>
                  {searchTerm && (
                    <div style={{ 
                      fontSize: "0.9rem", 
                      marginBottom: "16px",
                      opacity: 0.7,
                    }}>
                      No results for "<strong>{searchTerm}</strong>"
                    </div>
                  )}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      style={{
                        padding: "8px 16px",
                        border: `1px solid ${appTheme.colors.primary}30`,
                        background: "transparent",
                        color: appTheme.colors.primary,
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        margin: "0 auto"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = appTheme.colors.primary;
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = appTheme.colors.primary;
                      }}
                    >
                      <FaTimesCircle size={14} />
                      Clear Search
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && filteredData?.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: `1px solid ${appTheme.colors.border}`,
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ 
            color: appTheme.colors.textSecondary,
            fontSize: "0.875rem",
            fontWeight: "500",
          }}>
            Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> entries
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              style={{
                backgroundColor: currentPage === 1 ? `${appTheme.colors.border}20` : `${appTheme.colors.primary}10`,
                border: `1px solid ${currentPage === 1 ? appTheme.colors.border : appTheme.colors.primary}30`,
                color: currentPage === 1 ? appTheme.colors.textSecondary : appTheme.colors.primary,
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                opacity: currentPage === 1 ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "40px"
              }}
            >
              <FaAngleDoubleLeft size={12} />
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{
                backgroundColor: currentPage === 1 ? `${appTheme.colors.border}20` : `${appTheme.colors.primary}10`,
                border: `1px solid ${currentPage === 1 ? appTheme.colors.border : appTheme.colors.primary}30`,
                color: currentPage === 1 ? appTheme.colors.textSecondary : appTheme.colors.primary,
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                opacity: currentPage === 1 ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "40px"
              }}
            >
              <FaCaretLeft size={12} />
            </button>
            
            <div style={{ margin: "0 8px", fontSize: "0.875rem", color: appTheme.colors.textPrimary, fontWeight: "500" }}>
              Page {currentPage} of {Math.max(1, totalPages)}
            </div>
            
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{
                backgroundColor: currentPage === totalPages ? `${appTheme.colors.border}20` : `${appTheme.colors.primary}10`,
                border: `1px solid ${currentPage === totalPages ? appTheme.colors.border : appTheme.colors.primary}30`,
                color: currentPage === totalPages ? appTheme.colors.textSecondary : appTheme.colors.primary,
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                opacity: currentPage === totalPages ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "40px"
              }}
            >
              <FaCaretRight size={12} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              style={{
                backgroundColor: currentPage === totalPages ? `${appTheme.colors.border}20` : `${appTheme.colors.primary}10`,
                border: `1px solid ${currentPage === totalPages ? appTheme.colors.border : appTheme.colors.primary}30`,
                color: currentPage === totalPages ? appTheme.colors.textSecondary : appTheme.colors.primary,
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                opacity: currentPage === totalPages ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "40px"
              }}
            >
              <FaAngleDoubleRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;