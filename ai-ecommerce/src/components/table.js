"use client";

import React, { useState, useMemo } from "react";
import { appTheme } from "../constants/theme";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function DataTable({
  columns,
  data,
  title = "Data Table",
  onEdit = () => {},
  onDelete = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 8;

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

  // Fixed: Properly handle edit and delete clicks
  const handleEdit = (row) => {
    console.log("Edit clicked:", row);
    if (onEdit && typeof onEdit === 'function') {
      onEdit(row);
    }
  };

  const handleDelete = (row) => {
    console.log("Delete clicked:", row);
    if (onDelete && typeof onDelete === 'function') {
      onDelete(row);
    }
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
      columns.map((col) => String(row[col.accessor] || ""))
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
        textColor: [255, 255, 255],
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
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    // Add some basic styling
    if (!worksheet['!cols']) {
      worksheet['!cols'] = [];
      columns.forEach((_, index) => {
        worksheet['!cols'][index] = { width: 15 };
      });
    }
    
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}.xlsx`);
  };

  // Print Table
  const handlePrint = () => {
    const tableElement = document.getElementById("data-table");
    const printContent = tableElement.outerHTML;
    
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
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
              background: linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary}) !important; 
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
          ${printContent}
          <script>
            // Remove action buttons for print
            document.querySelectorAll('.action-buttons').forEach(btn => btn.remove());
          </script>
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

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${appTheme.colors.surface} 0%, ${appTheme.colors.background} 100%)`,
        padding: appTheme.spacing.xl,
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.05)",
        fontFamily: appTheme.fonts.primary,
        color: appTheme.colors.textPrimary,
        border: `1px solid ${appTheme.colors.border}30`,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: appTheme.spacing.xl,
          flexWrap: "wrap",
          gap: appTheme.spacing.lg,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: appTheme.spacing.md,
            marginBottom: appTheme.spacing.xs,
          }}>
            <div style={{
              width: "4px",
              height: "32px",
              background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
              borderRadius: "2px",
            }}></div>
            <h1 style={{ 
              color: appTheme.colors.textPrimary, 
              fontWeight: "800",
              fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
              margin: 0,
              lineHeight: 1.2,
            }}>
              {title}
            </h1>
          </div>
          <p style={{ 
            color: appTheme.colors.textSecondary, 
            margin: "8px 0 0 6px",
            fontSize: "0.95rem",
            fontWeight: "500",
          }}>
            {filteredData.length} records • Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Actions */}
        <div style={{ 
          display: "flex", 
          gap: appTheme.spacing.sm,
          flexWrap: "wrap"
        }}>
          <button
            onClick={downloadPDF}
            style={glassButtonStyle(appTheme.colors.secondary, "file-pdf")}
          >
            <i className="fas fa-file-pdf"></i>
            PDF
          </button>
          <button
            onClick={downloadExcel}
            style={glassButtonStyle(appTheme.colors.success, "file-excel")}
          >
            <i className="fas fa-file-excel"></i>
            Excel
          </button>
          <button
            onClick={handlePrint}
            style={glassButtonStyle(appTheme.colors.warning, "print")}
          >
            <i className="fas fa-print"></i>
            Print
          </button>
        </div>
      </div>

      {/* Search and Stats Bar */}
      <div style={{
        display: "flex",
        gap: appTheme.spacing.lg,
        marginBottom: appTheme.spacing.xl,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <div style={{ position: "relative", flex: "1 1 300px" }}>
          <i className="fas fa-search" style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: appTheme.colors.textSecondary,
            fontSize: "14px",
          }}></i>
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
              padding: "14px 16px 14px 44px",
              border: `1.5px solid ${appTheme.colors.border}60`,
              borderRadius: "16px",
              outline: "none",
              fontSize: "0.95rem",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              backgroundColor: `${appTheme.colors.background}80`,
              backdropFilter: "blur(10px)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = appTheme.colors.primary;
              e.target.style.boxShadow = `0 0 0 4px ${appTheme.colors.primary}15`;
              e.target.style.backgroundColor = appTheme.colors.surface;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = `${appTheme.colors.border}60`;
              e.target.style.boxShadow = "none";
              e.target.style.backgroundColor = `${appTheme.colors.background}80`;
            }}
          />
        </div>
        
        <div style={{
          display: "flex",
          gap: appTheme.spacing.lg,
          fontSize: "0.875rem",
          color: appTheme.colors.textSecondary,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
            }}></div>
            <span>Sorted: {sortConfig.key ? columns.find(col => col.accessor === sortConfig.key)?.header : 'None'}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="fas fa-filter" style={{ fontSize: "12px" }}></i>
            <span>Filtered: {filteredData.length} of {data.length}</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ 
        overflowX: "auto",
        borderRadius: "20px",
        border: `1.5px solid ${appTheme.colors.border}30`,
        background: `linear-gradient(145deg, ${appTheme.colors.surface}, ${appTheme.colors.background})`,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
        position: "relative",
      }}>
        <table
          id="data-table"
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            textAlign: "left",
            minWidth: "800px",
            background: "transparent",
          }}
        >
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={modernHeaderStyle}
                  onClick={() => handleSort(col.accessor)}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}>
                    {col.header}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      opacity: sortConfig.key === col.accessor ? 1 : 0.3,
                    }}>
                      <i className={`fas fa-caret-up`} style={{
                        fontSize: "10px",
                        color: sortConfig.key === col.accessor && sortConfig.direction === 'asc' ? 'white' : 'rgba(255,255,255,0.5)',
                        lineHeight: "6px",
                      }}></i>
                      <i className={`fas fa-caret-down`} style={{
                        fontSize: "10px",
                        color: sortConfig.key === col.accessor && sortConfig.direction === 'desc' ? 'white' : 'rgba(255,255,255,0.5)',
                        lineHeight: "6px",
                      }}></i>
                    </div>
                  </div>
                </th>
              ))}
              <th style={modernHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="fas fa-bolt"></i>
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{
                    background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(90deg, ${appTheme.colors.primary}08, ${appTheme.colors.secondary}08)`;
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = rowIdx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.02)';
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={modernCellStyle}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                        {colIdx === 0 && (
                          <div style={{
                            width: "4px",
                            height: "20px",
                            background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
                            borderRadius: "2px",
                            opacity: 0.6,
                          }}></div>
                        )}
                        {row[col.accessor]}
                      </div>
                    </td>
                  ))}
                  <td style={modernCellStyle}>
                    <div style={{ 
                      display: "flex", 
                      gap: "8px", 
                      flexWrap: "wrap",
                      position: "relative",
                      zIndex: 2,
                    }}>
                      <button
                        style={modernActionButtonStyle(appTheme.colors.primary, "edit")}
                        onClick={() => handleEdit(row)}
                        title="Edit record"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button
                        style={modernActionButtonStyle(appTheme.colors.error, "trash")}
                        onClick={() => handleDelete(row)}
                        title="Delete record"
                      >
                        <i className="fas fa-trash-alt"></i>
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
                    fontStyle: "italic",
                    background: "transparent",
                  }}
                >
                  <div style={{ 
                    fontSize: "4rem", 
                    marginBottom: appTheme.spacing.md,
                    opacity: 0.5,
                  }}>
                    <i className="fas fa-inbox"></i>
                  </div>
                  <div style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "600",
                    marginBottom: appTheme.spacing.xs,
                  }}>
                    No records found
                  </div>
                  {searchTerm && (
                    <div style={{ 
                      fontSize: "0.95rem", 
                      marginTop: appTheme.spacing.xs,
                      opacity: 0.7,
                    }}>
                      No results for "<strong>{searchTerm}</strong>". Try different keywords.
                    </div>
                  )}
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      marginTop: appTheme.spacing.md,
                      padding: "10px 20px",
                      border: `1.5px solid ${appTheme.colors.primary}30`,
                      background: "transparent",
                      color: appTheme.colors.primary,
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = appTheme.colors.primary;
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = appTheme.colors.primary;
                    }}
                  >
                    <i className="fas fa-times-circle" style={{ marginRight: "6px" }}></i>
                    Clear Search
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: appTheme.spacing.xl,
            padding: appTheme.spacing.lg,
            background: `linear-gradient(135deg, ${appTheme.colors.surface}, ${appTheme.colors.background})`,
            borderRadius: "20px",
            border: `1.5px solid ${appTheme.colors.border}20`,
            flexWrap: "wrap",
            gap: appTheme.spacing.md,
          }}
        >
          <div style={{ 
            color: appTheme.colors.textSecondary,
            fontSize: "0.9rem",
            fontWeight: "500",
          }}>
            Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> entries
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: appTheme.spacing.sm,
            flexWrap: "wrap",
          }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              style={modernPaginationButtonStyle(currentPage === 1, "first")}
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={modernPaginationButtonStyle(currentPage === 1, "prev")}
            >
              <i className="fas fa-angle-left"></i>
            </button>
            
            <div style={{ 
              display: "flex", 
              gap: "4px",
              margin: "0 8px",
            }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: "10px 16px",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      background: currentPage === pageNum 
                        ? `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`
                        : "transparent",
                      color: currentPage === pageNum ? "white" : appTheme.colors.textSecondary,
                      minWidth: "44px",
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== pageNum) {
                        e.target.style.background = `${appTheme.colors.primary}15`;
                        e.target.style.color = appTheme.colors.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== pageNum) {
                        e.target.style.background = "transparent";
                        e.target.style.color = appTheme.colors.textSecondary;
                      }
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={modernPaginationButtonStyle(currentPage === totalPages, "next")}
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              style={modernPaginationButtonStyle(currentPage === totalPages, "last")}
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Glassmorphism Button Style
const glassButtonStyle = (color, icon) => ({
  backgroundColor: `${color}15`,
  border: `1.5px solid ${color}30`,
  color: color,
  padding: "12px 20px",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "600",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backdropFilter: "blur(10px)",
  position: "relative",
  overflow: "hidden",
});

const modernActionButtonStyle = (color, icon) => ({
  backgroundColor: `${color}10`,
  border: `1.5px solid ${color}25`,
  color: color,
  padding: "8px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: "600",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  gap: "6px",
});

const modernPaginationButtonStyle = (disabled, type) => ({
  backgroundColor: disabled ? `${appTheme.colors.border}20` : `${appTheme.colors.primary}10`,
  border: `1.5px solid ${disabled ? appTheme.colors.border : appTheme.colors.primary}30`,
  color: disabled ? appTheme.colors.textSecondary : appTheme.colors.primary,
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: "0.875rem",
  fontWeight: "600",
  transition: "all 0.3s ease",
  opacity: disabled ? 0.5 : 1,
  minWidth: "44px",
});

const modernHeaderStyle = {
  padding: "20px 16px",
  fontWeight: "700",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
  color: "white",
  border: "none",
  position: "sticky",
  top: 0,
  backdropFilter: "blur(10px)",
};

const modernCellStyle = {
  padding: "18px 16px",
  borderBottom: `1.5px solid ${appTheme.colors.border}20`,
  fontSize: "0.9rem",
  color: appTheme.colors.textPrimary,
  fontWeight: "500",
  position: "relative",
};

// Add Font Awesome for icons
const addFontAwesome = () => {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);
  }
};

// Add global styles for hover effects
const addGlobalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    button:not(:disabled) {
      position: relative;
      overflow: hidden;
    }
    
    button:not(:disabled)::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    button:not(:disabled):hover::before {
      left: 100%;
    }
    
    button:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    button:not(:disabled):active {
      transform: translateY(0);
    }
    
    @media (max-width: 768px) {
      .data-table-container {
        padding: 1rem !important;
      }
    }
  `;
  document.head.appendChild(style);
};

// Initialize styles
if (typeof window !== 'undefined') {
  addFontAwesome();
  addGlobalStyles();
}

export default DataTable;