"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Settings, RefreshCw, History, AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
import { appTheme } from "../../../src/constants/theme";

export default function AdminProfilePage() {
  // Dummy admin data (keeping your original dummy data)
  const adminData = {
    name: "Admin User",
    email: "admin@steponnext.com",
    phone: "+91 98765 43210",
    role: "Super Admin",
  };

  // State for ID reset functionality
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [startFrom, setStartFrom] = useState(100);
  const [resetReason, setResetReason] = useState("");
  const [forceReset, setForceReset] = useState(false);
  const [counterData, setCounterData] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [prefix, setPrefix] = useState("PRD");
  const [padding, setPadding] = useState(5);
  const [description, setDescription] = useState("Product ID counter");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [resetHistory, setResetHistory] = useState([]);
  const [keepHistory, setKeepHistory] = useState(10);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch counter data on mount
  useEffect(() => {
    fetchCounterData();
    fetchResetHistory();
  }, []);

  const fetchCounterData = async () => {
    try {
      const res = await fetch('/api/reset-product-ids');
      const data = await res.json();
      if (data.success) {
        setCounterData(data.data);
        setStartFrom(data.data.counter.nextValue);
        setPrefix(data.data.counter.prefix || "PRD");
        setPadding(data.data.counter.padding || 5);
        setDescription(data.data.counter.description || "Product ID counter");
      }
    } catch (error) {
      console.error('Error fetching counter data:', error);
    }
  };

  const fetchResetHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/reset-product-ids');
      const data = await res.json();
      if (data.success) {
        setResetHistory(data.data.resetHistory || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetReason.trim()) {
      alert('Please provide a reason for reset');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-product-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startFrom,
          reason: resetReason,
          force: forceReset
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Product IDs reset successfully!\nNew ID will start from: ${startFrom}`);
        setShowResetModal(false);
        setResetReason("");
        setForceReset(false);
        fetchCounterData();
        fetchResetHistory();
      } else {
        if (data.status === 409) {
          if (confirm(`${data.error}\n\nDo you want to force reset anyway?`)) {
            setForceReset(true);
            handleReset();
          }
        } else {
          alert(`❌ Reset failed: ${data.message || data.error}`);
        }
      }
    } catch (error) {
      alert('❌ Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/reset-product-ids', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, padding, description }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Settings updated successfully');
        setShowAdvanced(false);
        fetchCounterData();
      } else {
        alert(`❌ Update failed: ${data.message}`);
      }
    } catch (error) {
      alert('❌ Update failed');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm(`Are you sure you want to clear reset history? Only last ${keepHistory} entries will be kept.`)) return;

    try {
      const res = await fetch(`/api/reset-product-ids?keep=${keepHistory}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ History cleared. Kept last ${keepHistory} entries.`);
        fetchResetHistory();
      } else {
        alert(`❌ Failed to clear history: ${data.message}`);
      }
    } catch (error) {
      alert('❌ Failed to clear history');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatId = (id) => {
    if (!id && id !== 0) return 'N/A';
    return String(id).padStart(padding, '0');
  };

  // Responsive styles based on screen size
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={containerStyle}>
      {/* Header with Mobile Menu Toggle */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Admin Profile</h1>
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={mobileMenuButtonStyle}
          >
            {mobileMenuOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div style={gridStyle}>
        {/* Left Column - Profile Info */}
        <div style={leftColumnStyle(isMobile)}>
          {/* Profile Card */}
          <div style={cardStyle}>
            {/* Profile Header */}
            <div style={profileHeaderStyle(isMobile)}>
              <div style={avatarStyle}>
                {adminData.name.charAt(0)}
              </div>
              <div>
                <h2 style={profileNameStyle}>{adminData.name}</h2>
                <p style={profileRoleStyle}>{adminData.role}</p>
              </div>
            </div>

            {/* Details Section */}
            <div style={detailsContainerStyle}>
              <div style={rowStyle}>
                <User size={isMobile ? 18 : 20} color={appTheme.colors.primary} />
                <p style={rowTextStyle}>{adminData.name}</p>
              </div>

              <div style={rowStyle}>
                <Mail size={isMobile ? 18 : 20} color={appTheme.colors.primary} />
                <p style={rowTextStyle}>{adminData.email}</p>
              </div>

              <div style={rowStyle}>
                <Phone size={isMobile ? 18 : 20} color={appTheme.colors.primary} />
                <p style={rowTextStyle}>{adminData.phone}</p>
              </div>

              <div style={rowStyle}>
                <Shield size={isMobile ? 18 : 20} color={appTheme.colors.primary} />
                <p style={rowTextStyle}>{adminData.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Product ID Management (only visible when menu open on mobile) */}
        {(!isMobile || mobileMenuOpen) && (
          <div style={rightColumnStyle(isMobile)}>
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <Settings size={20} color={appTheme.colors.primary} />
                <h3 style={sectionTitleStyle}>Product ID Management</h3>
              </div>

              {/* Current Status */}
              {counterData ? (
                <div style={statusContainerStyle}>
                  <div style={statusGridStyle(isMobile)}>
                    <div style={statusItemStyle}>
                      <p style={statusLabelStyle}>Current ID</p>
                      <p style={statusValueStyle}>{counterData.counter.formattedCurrent}</p>
                      <p style={statusSubValueStyle}>Value: {counterData.counter.currentValue}</p>
                    </div>
                    <div style={statusItemStyle}>
                      <p style={statusLabelStyle}>Next ID</p>
                      <p style={statusValueStyle}>{counterData.counter.formattedNext}</p>
                      <p style={statusSubValueStyle}>Value: {counterData.counter.nextValue}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={statsContainerStyle}>
                    <div style={statRowStyle}>
                      <span style={statLabelStyle}>Total Products:</span>
                      <span style={statValueStyle}>{counterData.products.total}</span>
                    </div>
                    <div style={statRowStyle}>
                      <span style={statLabelStyle}>With Custom IDs:</span>
                      <span style={statValueStyle}>{counterData.products.withCustomId}</span>
                    </div>
                    {counterData.products.minCustomId && (
                      <div style={statRowStyle}>
                        <span style={statLabelStyle}>ID Range:</span>
                        <span style={statValueStyle}>
                          {counterData.products.minFormatted} - {counterData.products.maxFormatted}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Warnings */}
                  {counterData.warnings && counterData.warnings.length > 0 && (
                    <div style={warningContainerStyle}>
                      <AlertTriangle size={16} color="#f59e0b" />
                      <p style={warningTextStyle}>{counterData.warnings[0]}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={actionButtonsStyle(isMobile)}>
                    <button
                      onClick={() => setShowResetModal(true)}
                      style={primaryButtonStyle}
                    >
                      <RefreshCw size={16} />
                      <span>Reset IDs</span>
                    </button>
                    <button
                      onClick={() => setShowHistoryModal(true)}
                      style={secondaryButtonStyle}
                    >
                      <History size={16} />
                      <span>View History</span>
                    </button>
                  </div>

                  {/* Advanced Settings Toggle */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={advancedToggleStyle}
                  >
                    <Settings size={14} />
                    <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
                  </button>

                  {/* Advanced Settings Panel */}
                  {showAdvanced && (
                    <div style={advancedPanelStyle}>
                      <h4 style={advancedTitleStyle}>Counter Settings</h4>
                      
                      <div style={settingsFormStyle}>
                        <div style={inputGroupStyle}>
                          <label style={inputLabelStyle}>Prefix</label>
                          <input
                            type="text"
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                            style={inputStyle}
                            maxLength={5}
                            placeholder="PRD"
                          />
                          <small style={inputHintStyle}>2-5 letters only</small>
                        </div>

                        <div style={inputGroupStyle}>
                          <label style={inputLabelStyle}>Padding (digits)</label>
                          <input
                            type="number"
                            value={padding}
                            onChange={(e) => setPadding(parseInt(e.target.value))}
                            style={inputStyle}
                            min="3"
                            max="10"
                          />
                          <small style={inputHintStyle}>3-10 digits (e.g., 5 = 00123)</small>
                        </div>

                        <div style={inputGroupStyle}>
                          <label style={inputLabelStyle}>Description</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={inputStyle}
                            placeholder="Counter description"
                          />
                        </div>

                        <div style={settingsButtonsStyle}>
                          <button
                            onClick={() => setShowAdvanced(false)}
                            style={cancelButtonStyle}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateSettings}
                            disabled={settingsLoading}
                            style={saveButtonStyle}
                          >
                            {settingsLoading ? 'Saving...' : 'Save Settings'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={loadingContainerStyle}>
                  <p style={loadingTextStyle}>Loading counter data...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div style={modalOverlayStyle} onClick={() => setShowResetModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Reset Product IDs</h3>
              <button onClick={() => setShowResetModal(false)} style={modalCloseStyle}>
                <X size={20} />
              </button>
            </div>

            <div style={modalBodyStyle}>
              <p style={modalTextStyle}>
                Current counter is at <strong>{counterData?.counter.formattedCurrent}</strong>.
                Next product will get ID <strong>{counterData?.counter.formattedNext}</strong>.
              </p>

              <div style={modalFormStyle}>
                <div style={inputGroupStyle}>
                  <label style={inputLabelStyle}>Start From *</label>
                  <input
                    type="number"
                    value={startFrom}
                    onChange={(e) => setStartFrom(parseInt(e.target.value))}
                    style={inputStyle}
                    min="1"
                  />
                  <small style={inputHintStyle}>
                    Next product will get ID: {formatId(startFrom)}
                  </small>
                </div>

                <div style={inputGroupStyle}>
                  <label style={inputLabelStyle}>Reason for Reset *</label>
                  <textarea
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    style={textareaStyle}
                    placeholder="e.g., New financial year, Database cleanup, etc."
                    rows="3"
                  />
                </div>

                <div style={checkboxGroupStyle}>
                  <input
                    type="checkbox"
                    id="forceReset"
                    checked={forceReset}
                    onChange={(e) => setForceReset(e.target.checked)}
                    style={checkboxStyle}
                  />
                  <label htmlFor="forceReset" style={checkboxLabelStyle}>
                    Force reset (override existing products)
                  </label>
                </div>

                {forceReset && (
                  <div style={warningBoxStyle}>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <p style={warningBoxTextStyle}>
                      Warning: This may cause ID conflicts with existing products.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={modalFooterStyle}>
              <button
                onClick={() => setShowResetModal(false)}
                style={modalCancelButtonStyle}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={loading || !resetReason.trim()}
                style={modalConfirmButtonStyle}
              >
                {loading ? 'Resetting...' : 'Reset IDs'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div style={modalOverlayStyle} onClick={() => setShowHistoryModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Reset History</h3>
              <button onClick={() => setShowHistoryModal(false)} style={modalCloseStyle}>
                <X size={20} />
              </button>
            </div>

            <div style={modalBodyStyle}>
              {historyLoading ? (
                <p style={loadingTextStyle}>Loading history...</p>
              ) : resetHistory.length === 0 ? (
                <p style={emptyTextStyle}>No reset history found</p>
              ) : (
                <div style={historyListStyle}>
                  {resetHistory.map((entry, index) => (
                    <div key={index} style={historyItemStyle}>
                      <div style={historyItemHeaderStyle}>
                        <span style={historyItemBadgeStyle}>
                          {entry.oldValue} → {entry.newValue}
                        </span>
                        <span style={historyItemDateStyle}>
                          {formatDate(entry.resetAt)}
                        </span>
                      </div>
                      <p style={historyItemReasonStyle}>
                        <strong>Reason:</strong> {entry.reason}
                      </p>
                      <p style={historyItemUserStyle}>
                        <strong>By:</strong> {entry.resetBy}
                      </p>
                      {entry.ipAddress && (
                        <p style={historyItemMetaStyle}>
                          IP: {entry.ipAddress}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {resetHistory.length > 0 && (
                <div style={historyFooterStyle}>
                  <div style={historyControlStyle}>
                    <label style={historyLabelStyle}>Keep last:</label>
                    <select
                      value={keepHistory}
                      onChange={(e) => setKeepHistory(parseInt(e.target.value))}
                      style={historySelectStyle}
                    >
                      <option value="5">5 entries</option>
                      <option value="10">10 entries</option>
                      <option value="20">20 entries</option>
                      <option value="50">50 entries</option>
                    </select>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    style={historyClearButtonStyle}
                  >
                    Clear Old History
                  </button>
                </div>
              )}
            </div>

            <div style={modalFooterStyle}>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={modalCloseFooterButtonStyle}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== STYLES ==========

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '24px',
  fontFamily: appTheme.fonts.primary,
  backgroundColor: appTheme.colors.background,
  minHeight: '100vh',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '600',
  color: appTheme.colors.textPrimary,
  margin: 0,
};

const mobileMenuButtonStyle = {
  background: 'none',
  border: 'none',
  color: appTheme.colors.primary,
  cursor: 'pointer',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  minWidth: '44px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '24px',
};

const leftColumnStyle = (isMobile) => ({
  gridColumn: isMobile ? '1 / -1' : 'span 1',
});

const rightColumnStyle = (isMobile) => ({
  gridColumn: isMobile ? '1 / -1' : 'span 1',
  marginTop: isMobile ? '0' : '0',
});

const cardStyle = {
  background: appTheme.colors.surface,
  padding: '25px',
  borderRadius: '12px',
  boxShadow: appTheme.shadows.md,
  border: `1px solid ${appTheme.colors.border}`,
  height: 'fit-content',
};

const profileHeaderStyle = (isMobile) => ({
  display: 'flex',
  alignItems: 'center',
  gap: isMobile ? '16px' : '20px',
  marginBottom: '20px',
});

const avatarStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: appTheme.colors.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '32px',
  fontWeight: '600',
  flexShrink: 0,
};

const profileNameStyle = {
  fontSize: '22px',
  fontWeight: '600',
  margin: '0 0 4px 0',
  color: appTheme.colors.textPrimary,
};

const profileRoleStyle = {
  color: appTheme.colors.textSecondary,
  margin: 0,
  fontSize: '14px',
};

const detailsContainerStyle = {
  marginTop: '20px',
  borderTop: `1px solid ${appTheme.colors.border}`,
  paddingTop: '20px',
};

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '15px',
  fontSize: '16px',
};

const rowTextStyle = {
  margin: 0,
  color: appTheme.colors.textPrimary,
  wordBreak: 'break-word',
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '20px',
};

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: appTheme.colors.textPrimary,
  margin: 0,
};

const statusContainerStyle = {
  marginBottom: '20px',
};

const statusGridStyle = (isMobile) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
  gap: '16px',
  marginBottom: '20px',
});

const statusItemStyle = {
  background: appTheme.colors.background,
  padding: '16px',
  borderRadius: '8px',
  border: `1px solid ${appTheme.colors.border}`,
  textAlign: 'center',
};

const statusLabelStyle = {
  fontSize: '12px',
  color: appTheme.colors.textSecondary,
  margin: '0 0 4px 0',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const statusValueStyle = {
  fontSize: '24px',
  fontWeight: '700',
  color: appTheme.colors.primary,
  margin: '0 0 2px 0',
  fontFamily: 'monospace',
};

const statusSubValueStyle = {
  fontSize: '12px',
  color: appTheme.colors.textSecondary,
  margin: 0,
};

const statsContainerStyle = {
  background: appTheme.colors.background,
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '20px',
};

const statRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
  fontSize: '14px',
};

const statLabelStyle = {
  color: appTheme.colors.textSecondary,
};

const statValueStyle = {
  fontWeight: '600',
  color: appTheme.colors.textPrimary,
};

const warningContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#fef3c7',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '20px',
  border: '1px solid #fde68a',
};

const warningTextStyle = {
  margin: 0,
  fontSize: '13px',
  color: '#92400e',
  flex: 1,
};

const actionButtonsStyle = (isMobile) => ({
  display: 'flex',
  gap: '12px',
  marginBottom: '16px',
  flexDirection: isMobile ? 'column' : 'row',
});

const primaryButtonStyle = {
  flex: 1,
  background: appTheme.colors.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  minHeight: '44px',
  ':hover': {
    opacity: 0.9,
  },
};

const secondaryButtonStyle = {
  flex: 1,
  background: 'transparent',
  color: appTheme.colors.primary,
  border: `1px solid ${appTheme.colors.primary}`,
  borderRadius: '8px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  minHeight: '44px',
  ':hover': {
    background: `${appTheme.colors.primary}10`,
  },
};

const advancedToggleStyle = {
  background: 'none',
  border: 'none',
  color: appTheme.colors.textSecondary,
  fontSize: '13px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '8px',
  width: '100%',
  justifyContent: 'center',
};

const advancedPanelStyle = {
  marginTop: '16px',
  padding: '16px',
  background: appTheme.colors.background,
  borderRadius: '8px',
  border: `1px solid ${appTheme.colors.border}`,
};

const advancedTitleStyle = {
  fontSize: '15px',
  fontWeight: '600',
  color: appTheme.colors.textPrimary,
  margin: '0 0 16px 0',
};

const settingsFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const inputLabelStyle = {
  fontSize: '13px',
  fontWeight: '500',
  color: appTheme.colors.textPrimary,
};

const inputStyle = {
  padding: '10px 12px',
  border: `1px solid ${appTheme.colors.border}`,
  borderRadius: '6px',
  fontSize: '14px',
  background: appTheme.colors.surface,
  color: appTheme.colors.textPrimary,
  outline: 'none',
  transition: 'border-color 0.2s ease',
  width: '100%',
  ':focus': {
    borderColor: appTheme.colors.primary,
  },
};

const inputHintStyle = {
  fontSize: '11px',
  color: appTheme.colors.textSecondary,
};

const settingsButtonsStyle = {
  display: 'flex',
  gap: '12px',
  marginTop: '8px',
};

const cancelButtonStyle = {
  flex: 1,
  padding: '10px',
  border: `1px solid ${appTheme.colors.border}`,
  borderRadius: '6px',
  background: 'transparent',
  color: appTheme.colors.textPrimary,
  fontSize: '13px',
  fontWeight: '500',
  cursor: 'pointer',
  minHeight: '40px',
};

const saveButtonStyle = {
  flex: 2,
  padding: '10px',
  border: 'none',
  borderRadius: '6px',
  background: appTheme.colors.primary,
  color: '#fff',
  fontSize: '13px',
  fontWeight: '500',
  cursor: 'pointer',
  minHeight: '40px',
  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};

const loadingContainerStyle = {
  padding: '40px',
  textAlign: 'center',
};

const loadingTextStyle = {
  color: appTheme.colors.textSecondary,
  fontSize: '14px',
};

// Modal Styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  zIndex: 1000,
};

const modalContentStyle = {
  background: appTheme.colors.surface,
  borderRadius: '12px',
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'hidden',
  boxShadow: appTheme.shadows.lg,
};

const modalHeaderStyle = {
  padding: '16px 20px',
  borderBottom: `1px solid ${appTheme.colors.border}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const modalTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: appTheme.colors.textPrimary,
  margin: 0,
};

const modalCloseStyle = {
  background: 'none',
  border: 'none',
  color: appTheme.colors.textSecondary,
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  minHeight: '32px',
  minWidth: '32px',
  ':hover': {
    background: appTheme.colors.background,
  },
};

const modalBodyStyle = {
  padding: '20px',
  overflowY: 'auto',
  maxHeight: 'calc(90vh - 130px)',
};

const modalTextStyle = {
  fontSize: '14px',
  color: appTheme.colors.textSecondary,
  marginBottom: '20px',
  lineHeight: 1.5,
};

const modalFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '80px',
  fontFamily: 'inherit',
};

const checkboxGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '4px',
};

const checkboxStyle = {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
};

const checkboxLabelStyle = {
  fontSize: '14px',
  color: appTheme.colors.textPrimary,
  cursor: 'pointer',
};

const warningBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#fef3c7',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #fde68a',
};

const warningBoxTextStyle = {
  margin: 0,
  fontSize: '12px',
  color: '#92400e',
  flex: 1,
};

const modalFooterStyle = {
  padding: '16px 20px',
  borderTop: `1px solid ${appTheme.colors.border}`,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
};

const modalCancelButtonStyle = {
  padding: '10px 16px',
  border: `1px solid ${appTheme.colors.border}`,
  borderRadius: '6px',
  background: 'transparent',
  color: appTheme.colors.textPrimary,
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  minHeight: '40px',
};

const modalConfirmButtonStyle = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '6px',
  background: appTheme.colors.primary,
  color: '#fff',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  minHeight: '40px',
  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};

const modalCloseFooterButtonStyle = {
  padding: '10px 24px',
  border: 'none',
  borderRadius: '6px',
  background: appTheme.colors.primary,
  color: '#fff',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  minHeight: '40px',
};

// History Modal Styles
const historyListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  maxHeight: '400px',
  overflowY: 'auto',
};

const historyItemStyle = {
  padding: '16px',
  background: appTheme.colors.background,
  borderRadius: '8px',
  border: `1px solid ${appTheme.colors.border}`,
};

const historyItemHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  flexWrap: 'wrap',
  gap: '8px',
};

const historyItemBadgeStyle = {
  background: appTheme.colors.primary + '15',
  color: appTheme.colors.primary,
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '600',
  fontFamily: 'monospace',
};

const historyItemDateStyle = {
  fontSize: '11px',
  color: appTheme.colors.textSecondary,
};

const historyItemReasonStyle = {
  fontSize: '13px',
  color: appTheme.colors.textPrimary,
  margin: '0 0 4px 0',
  lineHeight: 1.4,
};

const historyItemUserStyle = {
  fontSize: '12px',
  color: appTheme.colors.textSecondary,
  margin: '0 0 2px 0',
};

const historyItemMetaStyle = {
  fontSize: '10px',
  color: appTheme.colors.textSecondary,
  margin: 0,
  opacity: 0.7,
};

const emptyTextStyle = {
  textAlign: 'center',
  color: appTheme.colors.textSecondary,
  padding: '40px 0',
};

const historyFooterStyle = {
  marginTop: '20px',
  paddingTop: '16px',
  borderTop: `1px solid ${appTheme.colors.border}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
};

const historyControlStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const historyLabelStyle = {
  fontSize: '13px',
  color: appTheme.colors.textPrimary,
};

const historySelectStyle = {
  padding: '6px 10px',
  border: `1px solid ${appTheme.colors.border}`,
  borderRadius: '6px',
  fontSize: '13px',
  background: appTheme.colors.surface,
  color: appTheme.colors.textPrimary,
  cursor: 'pointer',
};

const historyClearButtonStyle = {
  padding: '8px 12px',
  border: 'none',
  borderRadius: '6px',
  background: '#fee2e2',
  color: '#dc2626',
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'pointer',
  minHeight: '36px',
  ':hover': {
    background: '#fecaca',
  },
};