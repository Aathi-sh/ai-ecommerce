"use client";

import React, { useState, useMemo } from "react";
import { appTheme } from "../constants/theme";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FaFilePdf, FaFileExcel, FaPrint, FaEdit, FaTrash, FaSearch, FaSortUp, FaSortDown, FaCaretLeft, FaCaretRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaInbox, FaTimesCircle } from 'react-icons/fa';

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

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Filter logic
  const filteredData = useMemo(() => {
    return sortedData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedData, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(parseInt(appTheme.colors.primary.slice(1, 3), 16),
                   parseInt(appTheme.colors.primary.slice(3, 5), 16),
                   parseInt(appTheme.colors.primary.slice(5, 7), 16));
    doc.text(title, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = columns.map((col) => col.header);
    const tableRows = filteredData.map((row) =>
      columns.map((col) => {
        const value = row[col.accessor];
        if (col.cell && typeof col.cell === 'function') {
          // Extract text from React element
          const tempDiv = document.createElement('div');
          const element = col.cell(value, row);
          if (typeof element === 'string') {
            return element;
          }
          return String(value || "");
        }
        return String(value || "");
      })
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [51, 51, 51],
        lineColor: [200, 200, 200],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [parseInt(appTheme.colors.primary.slice(1, 3), 16),
                   parseInt(appTheme.colors.primary.slice(3, 5), 16),
                   parseInt(appTheme.colors.primary.slice(5, 7), 16)],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      margin: { top: 35 }
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  // Excel Download
  const downloadExcel = () => {
    const flattenedData = filteredData.map(row => {
      const flatRow = {};
      columns.forEach(col => {
        const value = row[col.accessor];
        flatRow[col.header] = value;
      });
      return flatRow;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}.xlsx`);
  };

  // Print Table
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
              margin: 40px;
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
              align-items: center;
              margin-top: 15px;
              font-size: 14px;
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px;
              font-size: 14px;
            }
            th { 
              background: ${appTheme.colors.primary};
              color: white !important;
              padding: 16px 12px;
              text-align: left;
              font-weight: 600;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border: none !important;
            }
            td { 
              padding: 14px 12px;
              border-bottom: 1px solid #e8e8e8;
              background: white;
            }
            tr:nth-child(even) td {
              background-color: #fafafa;
            }
            .action-buttons {
              display: none;
            }
            @media print {
              body { margin: 15px; }
              .print-header { margin-bottom: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${title}</h1>
            <p>Comprehensive Data Report</p>
            <div class="print-meta">
              <span>Total Records: ${filteredData.length}</span>
              <span>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(row => `
                <tr>
                  ${columns.map(col => {
                    const value = row[col.accessor];
                    let displayValue = value;
                    if (col.cell && typeof col.cell === 'function') {
                      const element = col.cell(value, row);
                      if (typeof element === 'string') {
                        displayValue = element;
                      } else if (element && element.props && element.props.children) {
                        displayValue = element.props.children;
                      }
                    }
                    return `<td>${displayValue || ''}</td>`;
                  }).join('')}
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
      setTimeout(() => printWindow.close(), 100);
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
        overflow: "hidden"
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
            {filteredData.length} records • Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Actions */}
        {exportable && (
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
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = appTheme.colors.secondary;
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
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
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = appTheme.colors.success;
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
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
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = appTheme.colors.warning;
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
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
            {paginatedData.length > 0 ? (
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
                      {col.cell ? col.cell(row[col.accessor], row) : row[col.accessor]}
                    </td>
                  ))}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
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
                            backgroundColor: `${appTheme.colors.warning}15`,
                            color: appTheme.colors.warning,
                            border: `1px solid ${appTheme.colors.warning}30`,
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
                            e.currentTarget.style.backgroundColor = appTheme.colors.warning;
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = `${appTheme.colors.warning}15`;
                            e.currentTarget.style.color = appTheme.colors.warning;
                          }}
                        >
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
      {pagination && filteredData.length > 0 && (
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
              Page {currentPage} of {totalPages}
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