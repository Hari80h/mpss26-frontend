'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../lib/store';
import {
  Package,
  Eye,
  MessageCircle,
  Users,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  X,
  ShieldCheck,
  Pencil,
  Trash2,
  Plus,
  Check,
  UploadCloud
} from 'lucide-react';
import { Product } from '../../types';

export const ExhibitorProducts: React.FC = React.memo(() => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    enquireProduct,
    updateProduct,
    deleteProduct,
    addProduct,
    interestedVisitors,
    showToast,
  } = useStore();

  const [detailSubTab, setDetailSubTab] = useState<'overview' | 'features' | 'benefits' | 'useCases' | 'resources'>('overview');
  const [showVisitorsModal, setShowVisitorsModal] = useState(false);

  // Edit / Add modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Company Brochure & Upload state (Common across all products)
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customBrochureUrl, setCustomBrochureUrl] = useState('');
  const [companyBrochureUrl, setCompanyBrochureUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('eventsphere_company_brochure_url');
    }
    return null;
  });
  const [companyBrochureName, setCompanyBrochureName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('eventsphere_company_brochure_name');
    }
    return null;
  });
  const brochureFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const saveCompanyBrochure = (url: string | null, name: string | null) => {
    setCompanyBrochureUrl(url);
    setCompanyBrochureName(name);
    if (typeof window !== 'undefined') {
      if (url) {
        localStorage.setItem('eventsphere_company_brochure_url', url);
      } else {
        localStorage.removeItem('eventsphere_company_brochure_url');
      }
      if (name) {
        localStorage.setItem('eventsphere_company_brochure_name', name);
      } else {
        localStorage.removeItem('eventsphere_company_brochure_name');
      }
    }
  };

  // Form fields
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState('Cloud & AI');
  const [formOverview, setFormOverview] = useState('');

  // Delete confirm state
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Active exhibitor company is Truechip Solutions (Booth A-02)
  const exhibitorCompany = 'Truechip Solutions';
  const companyProducts = useMemo(
    () => products.filter((p) => p.company.toLowerCase().includes('truechip')),
    [products]
  );

  const activeProduct = useMemo(
    () => companyProducts.find((p) => p.id === selectedProductId),
    [companyProducts, selectedProductId]
  );

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormTagline(prod.tagline);
    setFormCategory(prod.category);
    setFormOverview(prod.overview);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !formName.trim()) return;

    updateProduct(editingProduct.id, {
      name: formName.trim(),
      tagline: formTagline.trim(),
      category: formCategory.trim() || 'Verification IP & EDA',
      overview: formOverview.trim() || editingProduct.overview,
    });

    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormTagline('');
    setFormCategory('Verification IP & EDA');
    setFormOverview('');
    setShowAddModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    addProduct({
      name: formName.trim(),
      tagline: formTagline.trim() || 'Verification Solution by Truechip',
      category: formCategory.trim() || 'Verification IP & EDA',
      company: 'Truechip Solutions',
      booth: 'Hall 1 · A-02',
      image: '/images/exhibitors/truechip.png',
      views: 0,
      enquiries: 0,
      interestedVisitorsCount: 0,
      overview: formOverview.trim() || 'Official featured solution showcased at Truechip Booth A-02.',
      features: ['Silicon Proven', 'SystemVerilog / UVM Native', 'Comprehensive Test Suites'],
      benefits: ['Drastically cuts verification cycle', 'First-pass silicon success', 'Multi-simulator support'],
      useCases: ['ASIC & SoC Verification', 'Chiplet Integration', 'Semiconductor Emulation'],
      resources: { websiteUrl: 'https://www.truechip.net' },
    });

    setShowAddModal(false);
  };

  const handleDelete = (productId: string, productName: string) => {
    deleteProduct(productId);
    setDeletingProductId(null);
    if (selectedProductId === productId) {
      setSelectedProductId(null);
    }
  };

  const handleExportVisitorsCSV = (prod: Product) => {
    const prodVisitors = interestedVisitors.filter((v) => v.productId === prod.id);
    const headers = ['Name', 'Company', 'Designation', 'Email', 'Mobile', 'Type', 'Timestamp'];
    const rows = prodVisitors.map((v) => [
      `"${v.name}"`,
      `"${v.company}"`,
      `"${v.designation}"`,
      `"${v.email}"`,
      `"${v.mobile}"`,
      `"${v.interactionType}"`,
      `"${v.timestamp}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${prod.id}-interested-visitors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Interested visitors exported successfully ✓', 'success');
  };

  const handleOpenCompanyBrochure = () => {
    if (companyBrochureUrl) {
      if (companyBrochureUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = companyBrochureUrl;
        link.download = companyBrochureName || 'Truechip_Solutions_Official_Company_Catalog.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Company brochure downloaded successfully ✓', 'success');
        return;
      } else {
        window.open(companyBrochureUrl, '_blank');
        showToast('Opening company brochure link ✓', 'success');
        return;
      }
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const productsHtml = companyProducts
        .map(
          (p, idx) => `
        <div class="product-card">
          <div class="prod-header">
            <div>
              <div class="prod-num">SOLUTION 0${idx + 1} · ${p.category}</div>
              <h2 class="prod-title">${p.name}</h2>
              <div class="prod-tagline">${p.tagline}</div>
            </div>
            <span class="prod-booth">${p.booth}</span>
          </div>
          <div class="prod-overview">
            <p>${p.overview}</p>
          </div>
          <div class="prod-columns">
            <div class="col">
              <h4>Key Capabilities</h4>
              <ul>${p.features.map((f: string) => `<li>${f}</li>`).join('')}</ul>
            </div>
            <div class="col">
              <h4>Enterprise Benefits</h4>
              <ul>${p.benefits.map((b: string) => `<li>${b}</li>`).join('')}</ul>
            </div>
            <div class="col">
              <h4>Target Applications</h4>
              <ul>${p.useCases.map((u: string) => `<li>${u}</li>`).join('')}</ul>
            </div>
          </div>
        </div>
      `
        )
        .join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Truechip Solutions — Official Corporate Product Catalog</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #181818; max-width: 900px; margin: 0 auto; line-height: 1.6; }
              .header { border-bottom: 3px solid #B51F32; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
              .brand { font-size: 13px; font-weight: 800; color: #B51F32; text-transform: uppercase; letter-spacing: 1.5px; }
              .title { font-size: 30px; font-weight: 800; margin: 6px 0 4px; color: #111; }
              .subtitle { font-size: 15px; color: #555; }
              .badge { background: #FFF0F2; color: #B51F32; border: 1px solid #FAD2D7; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; text-align: center; }
              .company-intro { background: #F8F9FA; border-left: 4px solid #B51F32; padding: 14px 18px; border-radius: 6px; margin-bottom: 28px; font-size: 13px; color: #333; line-height: 1.6; }
              .catalog-index { background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; padding: 14px 18px; margin-bottom: 28px; font-size: 12px; }
              .catalog-index h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px; }
              .index-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 16px; }
              .product-card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 22px; page-break-inside: avoid; background: #fff; }
              .prod-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #F0F0F0; padding-bottom: 10px; margin-bottom: 12px; }
              .prod-num { font-size: 11px; font-weight: 800; color: #B51F32; text-transform: uppercase; letter-spacing: 1px; }
              .prod-title { font-size: 19px; font-weight: 700; color: #111; margin: 4px 0 2px; }
              .prod-tagline { font-size: 13px; color: #666; font-weight: 500; }
              .prod-booth { font-size: 11px; font-weight: 700; background: #F3F4F6; color: #374151; padding: 4px 10px; border-radius: 6px; }
              .prod-overview { font-size: 13px; color: #4B5563; margin-bottom: 14px; }
              .prod-columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; font-size: 12px; }
              .col h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #111; margin: 0 0 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
              .col ul { padding-left: 16px; margin: 0; }
              .col li { margin-bottom: 4px; color: #444; }
              .footer { border-top: 1px solid #eee; padding-top: 16px; margin-top: 36px; font-size: 12px; color: #777; display: flex; justify-content: space-between; }
              @media print {
                body { padding: 15px; }
                .product-card { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="brand">Truechip Solutions · No Compromise Verification</div>
                <h1 class="title">Official Corporate Solutions Catalog</h1>
                <div class="subtitle">Complete Portfolio of Verification IP (VIP), SystemVerilog/UVM, and Silicon Assurance Tools</div>
              </div>
              <div>
                <div class="badge">BOOTH HALL 1 · A-02<br/><span style="font-size:11px;font-weight:600;color:#555;">MPSS 2026</span></div>
              </div>
            </div>
            <div class="company-intro">
              <strong>About Truechip Solutions:</strong> Truechip is a leading global provider of Verification IP (VIP), SystemVerilog/UVM acceleration environments, and comprehensive silicon test suites. Trusted by 50+ tier-1 semiconductor leaders worldwide, Truechip delivers first-pass silicon verification success across PCIe, UCIe chiplets, CXL, USB4, HBM3, High-Speed Ethernet, and RISC-V architectures. (Website: https://www.truechip.net)
            </div>
            <div class="catalog-index">
              <h3>Featured Solutions Directory (${companyProducts.length} Total)</h3>
              <div class="index-grid">
                ${companyProducts.map((p, idx) => `<div><strong>${idx + 1}.</strong> ${p.name} <span style="color:#777;">(${p.category})</span></div>`).join('')}
              </div>
            </div>
            <div class="catalog-list">
              ${productsHtml}
            </div>
            <div class="footer">
              <div>EventSphere Digital Experience Layer · MP Semiconductor Summit 2026 (MPSS26)</div>
              <div>Truechip Solutions · Booth Hall 1 · A-02 · sales@truechip.net · https://www.truechip.net</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
      showToast('Opening full company catalog print/save view ✓', 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      saveCompanyBrochure(dataUrl, file.name);
      setShowUploadModal(false);
      showToast(`Company brochure "${file.name}" uploaded successfully ✓`, 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAttachTemplateBrochure = () => {
    saveCompanyBrochure(
      'https://eventsphere.blob.core.windows.net/brochures/truechip-solutions-complete-catalog.pdf',
      'truechip-solutions-complete-catalog.pdf'
    );
    setShowUploadModal(false);
    showToast('Official Truechip multi-product catalog attached ✓', 'success');
  };

  const handleSaveCustomBrochureUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBrochureUrl.trim()) return;
    const url = customBrochureUrl.trim();
    const fileName = url.split('/').pop() || 'company-catalog.pdf';
    saveCompanyBrochure(url, fileName);
    setCustomBrochureUrl('');
    setShowUploadModal(false);
    showToast('Company brochure URL saved ✓', 'success');
  };

  const renderModals = () => (
    <React.Fragment>
      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-[18px] w-full max-w-sm p-4 space-y-3 shadow-2xl border border-[#DEDCD7]">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#DEDCD7]">
              <div>
                <h3 className="text-[17px] font-bold text-[#181818]">Edit Product</h3>
                <p className="text-[13px] text-[#6B6B6B]">Truechip Booth A-02</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-[#6B6B6B] hover:text-[#181818] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-[13px] font-semibold text-[#181818] block mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD7] rounded-xl focus:outline-none focus:border-[#B51F32] placeholder:text-[13px]"
                  placeholder="e.g. Azure OpenAI Service"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181818] block mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD7] rounded-xl focus:outline-none focus:border-[#B51F32] placeholder:text-[13px]"
                  placeholder="e.g. Advanced language models"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181818] block mb-1.5">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD7] rounded-xl focus:outline-none focus:border-[#B51F32] bg-white"
                >
                  <option value="Cloud & AI">Cloud & AI</option>
                  <option value="Enterprise SaaS">Enterprise SaaS</option>
                  <option value="Security & Compliance">Security & Compliance</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Developer Tools">Developer Tools</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181818] block mb-1.5">Overview</label>
                <textarea
                  value={formOverview}
                  onChange={(e) => setFormOverview(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD7] rounded-xl focus:outline-none focus:border-[#B51F32] resize-none placeholder:text-[13px]"
                  placeholder="Brief overview of the product..."
                />
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-white border border-[#DEDCD7] text-[#181818] font-semibold text-sm rounded-xl hover:bg-[#F6F4F0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#B51F32] hover:bg-[#9C1A2B] text-white font-semibold text-sm rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unified Company Brochure & Upload Modal */}
      {showBrochureModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-[20px] w-full max-w-sm max-h-[90vh] flex flex-col shadow-2xl border border-[#DEDCD7] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#DEDCD7] shrink-0 bg-[#FAFAF9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFF0F2] border border-[#FAD2D7] flex items-center justify-center text-[#B51F32]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#181818] leading-tight">Company Brochure</h3>
                  <p className="text-[11px] text-[#6B6B6B]">Truechip Solutions · Booth Hall 1 · A-02</p>
                </div>
              </div>
              <button
                onClick={() => setShowBrochureModal(false)}
                className="p-1.5 text-[#6B6B6B] hover:text-[#181818] rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={brochureFileInputRef}
              accept="application/pdf,image/*,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto">
              {/* File details pill */}
              <div className="p-3 bg-[#F6F4F0] rounded-xl border border-[#DEDCD7] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#B51F32] border border-[#E5E7EB] shrink-0 font-bold text-[11px] shadow-2xs">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#181818] text-xs truncate">
                      {companyBrochureName || 'truechip-solutions-complete-catalog.pdf'}
                    </p>
                    <p className="text-[11px] text-[#6B6B6B]">
                      {companyBrochureUrl ? 'Custom Attached' : `All ${companyProducts.length} Solutions · Master Catalog`}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-[#EBF5F0] text-[#2F7D58] px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              {/* Download / Print PDF button */}
              <button
                type="button"
                onClick={handleOpenCompanyBrochure}
                className="w-full py-2.5 bg-[#B51F32] hover:bg-[#9C1A2B] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download / Print Company Catalog</span>
              </button>

              {/* Upload Options Header */}
              <div className="relative flex items-center justify-center pt-1">
                <div className="border-t border-[#DEDCD7] w-full" />
                <span className="bg-white px-2 text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider absolute">
                  Upload or Replace
                </span>
              </div>

              {/* Option 1: Pick file from device */}
              <div
                onClick={() => brochureFileInputRef.current?.click()}
                className="p-3.5 border-2 border-dashed border-[#DEDCD7] hover:border-[#B51F32] bg-[#FAF9F6] hover:bg-[#FFF5F6] rounded-xl text-center cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#B51F32] mx-auto shadow-2xs group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#181818]">Choose PDF / Document</p>
                  <p className="text-[11px] text-[#6B6B6B]">Upload company brochure from device</p>
                </div>
              </div>

              {/* Option 2: Default Template */}
              <button
                type="button"
                onClick={handleAttachTemplateBrochure}
                className="w-full py-2 px-3 bg-white border border-[#DEDCD7] hover:border-[#B51F32] rounded-xl text-left flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#FFF0F2] text-[#B51F32] flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#181818]">Attach Official MPSS26 PDF</p>
                    <p className="text-[10px] text-[#6B6B6B]">Auto-generated multi-product master portfolio</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#B51F32] group-hover:underline shrink-0">
                  Attach ✓
                </span>
              </button>

              {/* Option 3: Document Link */}
              <form onSubmit={handleSaveCustomBrochureUrl} className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#181818] block">Or Enter Cloud Link</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customBrochureUrl}
                    onChange={(e) => setCustomBrochureUrl(e.target.value)}
                    placeholder="https://.../catalog.pdf"
                    className="flex-1 px-3 py-1.5 text-xs border border-[#DEDCD7] rounded-xl focus:outline-none focus:border-[#B51F32]"
                  />
                  <button
                    type="submit"
                    disabled={!customBrochureUrl.trim()}
                    className="px-3 py-1.5 bg-[#181818] hover:bg-black disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#DEDCD7] bg-[#FAFAF9] flex items-center justify-between">
              {companyBrochureUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    saveCompanyBrochure(null, null);
                    showToast('Reset to default company catalog ✓', 'info');
                  }}
                  className="text-[11px] text-[#B51F32] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset to Default</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setShowBrochureModal(false)}
                className="py-1.5 px-3.5 bg-white border border-[#DEDCD7] text-[#181818] font-semibold text-xs rounded-xl hover:bg-[#F6F4F0] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </React.Fragment>
  );

  // If a product is selected, render Product Detail
  if (activeProduct) {
    const productVisitors = interestedVisitors.filter((v) => v.productId === activeProduct.id);

    return (
      <div className="flex-1 bg-[#F6F4F0] select-none px-4 pt-4 pb-20 space-y-4">
        {/* Back and Edit/Delete Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedProductId(null)}
            className="flex items-center gap-1.5 text-[15px] font-medium text-[#181818] transition-colors py-1 px-1 -ml-1 rounded-lg active:opacity-70"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEdit(activeProduct)}
              className="px-3 py-2 rounded-xl bg-white border border-[#DEDCD7] text-sm font-semibold flex items-center gap-1.5 hover:bg-[#F6F4F0] text-[#181818] transition-colors shadow-sm"
            >
              <Pencil className="w-4 h-4 text-gray-500" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setDeletingProductId(activeProduct.id)}
              className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold flex items-center gap-1.5 hover:bg-red-100 text-[#B51F32] transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Card Title & Metrics */}
        <div className="p-4 rounded-[16px] shadow-sm relative overflow-hidden bg-white border border-[#F3F4F6]">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#FFF0F2] opacity-80 z-0"></div>
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#FCE8E8] rounded-full blur-3xl z-0 pointer-events-none"></div>

          <div className="relative z-10 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-[#FFF0F2] text-[#D11E39] px-2.5 py-1 rounded-md">
                  {activeProduct.category} · BOOTH {activeProduct.booth}
                </span>
              </div>
              <div className="mb-2">
                <h2 className="text-[20px] font-bold text-[#111827] leading-snug">
                  {activeProduct.name}
                </h2>
              </div>
              <div className="text-sm text-[#4B5563] font-medium leading-relaxed">
                {activeProduct.tagline}
              </div>
            </div>

          </div>
        </div>

        {/* Product Overview Section */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm text-sm space-y-2 relative z-10">
          <h3 className="font-semibold text-[#181818] text-base">
            Product Overview
          </h3>
          <p className="text-[#6B6B6B] leading-relaxed">
            {activeProduct.overview}
          </p>
        </div>

        {/* Interested Visitors Modal */}
        {showVisitorsModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="bg-white rounded-[18px] w-full max-w-md max-h-[85vh] overflow-y-auto p-4 space-y-3 shadow-xl border border-[#DEDCD7]">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#DEDCD7]">
                <div>
                  <h3 className="text-[17px] font-bold text-[#181818]">
                    Interested Visitors ({productVisitors.length})
                  </h3>
                  <p className="text-[13px] text-[#6B6B6B]">{activeProduct.name}</p>
                </div>
                <button
                  onClick={() => setShowVisitorsModal(false)}
                  className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#181818] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-[#EFEEEA] rounded-xl border border-[#DEDCD7] text-xs text-[#555] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2F7D58] flex-shrink-0" />
                <span>Contact visibility strictly respects individual delegate privacy settings.</span>
              </div>

              <div className="space-y-2.5">
                {productVisitors.length === 0 ? (
                  <p className="text-sm text-center text-[#6B6B6B] py-4">No enquiries logged yet.</p>
                ) : (
                  productVisitors.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-[#F6F4F0] rounded-xl border border-[#DEDCD7] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#181818]">{v.name}</span>
                        <span className="text-[11px] font-mono text-[#6B6B6B]">{v.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#6B6B6B]">
                        {v.designation} · <strong className="text-[#181818] font-semibold">{v.company}</strong>
                      </p>
                      <div className="pt-1 flex items-center justify-between text-xs text-[#6B6B6B]">
                        <span>Email: <strong className="text-[#181818] font-medium">{v.email}</strong></span>
                        <span>Mobile: <strong className="text-[#181818] font-medium">{v.mobile}</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  onClick={() => handleExportVisitorsCSV(activeProduct)}
                  className="flex-1 py-2.5 bg-white border border-[#DEDCD7] text-[#181818] font-semibold text-sm rounded-xl shadow-xs hover:bg-[#F6F4F0] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setShowVisitorsModal(false)}
                  className="flex-1 py-2.5 bg-[#181818] text-white font-semibold text-sm rounded-xl shadow-xs hover:bg-black transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modals */}
        {renderModals()}
      </div>
    );
  }

  // Showcase Products Catalog View
  return (
    <div className="flex-1 bg-[#F6F4F0] select-none pb-20 flex flex-col">
      {/* Rich Header Block */}
      <div className="bg-[#151515] px-5 pt-10 pb-12 text-white rounded-b-[32px] shadow-lg relative overflow-hidden shrink-0">
        {/* Soft Red Glow Background */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-bl from-[#B51F32]/50 via-[#B51F32]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10 mb-2">
          <div>
            <h1 className="text-[28px] font-serif tracking-tight text-white leading-tight mb-1">
              Showcase Products
            </h1>
            <p className="text-[13px] text-gray-300 font-medium">
              Truechip Booth A-02 Featured Solutions
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="h-8 px-3.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 font-semibold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
            <button
              onClick={() => setShowBrochureModal(true)}
              className="h-8 px-3.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 font-semibold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Open Company Brochure & Upload"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Brochure</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products List (Truechip Only) */}
      <div className="px-4 -mt-8 relative z-20 space-y-3">
        {companyProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#DEDCD7] text-center space-y-3">
            <Package className="w-8 h-8 text-[#6B6B6B] mx-auto opacity-50" />
            <p className="text-base font-semibold text-[#181818]">No featured products listed yet</p>
            <p className="text-sm text-[#6B6B6B]">Add your booth solutions to showcase them to attendees.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-4 py-2 bg-[#B51F32] text-white text-sm font-semibold rounded-xl"
            >
              + Add First Product
            </button>
          </div>
        ) : (
          companyProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => setSelectedProductId(prod.id)}
              className="bg-white p-4 rounded-2xl border border-[#EBEBEB] hover:shadow-md transition-shadow shadow-sm cursor-pointer flex justify-between gap-3 group"
            >
              {/* Left: Text Content */}
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373] block mb-1">
                  {prod.category} · Booth {prod.booth}
                </span>
                <h3 className="text-[17px] font-bold text-[#181818] leading-tight break-words mb-1">
                  {prod.name}
                </h3>
                <p className="text-[13px] text-[#555555] leading-relaxed line-clamp-2">
                  {prod.tagline}
                </p>
              </div>

              {/* Right: Actions & Details Link */}
              <div className="flex flex-col items-end justify-between shrink-0 py-0.5">
                <div className="flex items-center gap-1 -mr-1.5 -mt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="p-1.5 text-[#8A8A8A] hover:text-[#00A4EF] bg-transparent hover:bg-gray-50 rounded-md transition-colors"
                    title="Edit Product"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingProductId(prod.id)}
                    className="p-1.5 text-[#8A8A8A] hover:text-[#B51F32] bg-transparent hover:bg-gray-50 rounded-md transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <span className="text-[12px] font-semibold text-[#737373] flex items-center gap-0.5 group-hover:text-[#B51F32] transition-colors mt-2">
                  View Details <ChevronRight className="w-3.5 h-3.5 -mr-0.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

{/* Modals */}
      {renderModals()}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-[18px] w-full max-w-sm p-4 space-y-3 shadow-2xl border border-[#DEDCD7]">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#DEDCD7]">
              <div>
                <h3 className="text-[17px] font-bold text-[#181818]">Add Featured Product</h3>
                <p className="text-[13px] text-[#6B6B6B]">Showcase to attendees at Truechip Booth A-02</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[#6B6B6B] hover:text-[#181818] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3">
              <div>
                <label className="text-[13px] font-semibold text-[#181818] block mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD7] rounded-xl focus:outline-none focus:border-[#B51F32] placeholder:text-[13px]"
                  placeholder="e.g. PCIe Gen 7 Verification IP"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181818] block mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD7] rounded-xl focus:outline-none focus:border-[#B51F32] placeholder:text-[13px]"
                  placeholder="e.g. Generative AI-powered security analysis"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181818] block mb-1.5">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD7] rounded-xl focus:outline-none focus:border-[#B51F32] bg-white"
                >
                  <option value="Cloud & AI">Cloud & AI</option>
                  <option value="Enterprise SaaS">Enterprise SaaS</option>
                  <option value="Security & Compliance">Security & Compliance</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Developer Tools">Developer Tools</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#181818] block mb-1.5">Overview</label>
                <textarea
                  value={formOverview}
                  onChange={(e) => setFormOverview(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD7] rounded-xl focus:outline-none focus:border-[#B51F32] resize-none placeholder:text-[13px]"
                  placeholder="Describe key benefits and capabilities..."
                />
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-white border border-[#DEDCD7] text-[#181818] font-semibold text-sm rounded-xl hover:bg-[#F6F4F0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#B51F32] hover:bg-[#9C1A2B] text-white font-semibold text-sm rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-[18px] w-full max-w-xs p-5 space-y-3 shadow-2xl border border-[#DEDCD7] text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-[#B51F32] mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-[17px] font-bold text-[#181818]">Delete Product?</h3>
              <p className="text-[13px] text-[#6B6B6B] mt-1.5 leading-relaxed">
                Are you sure you want to remove this product from your booth showcase?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2.5 bg-white border border-[#DEDCD7] text-[#181818] font-semibold text-sm rounded-xl hover:bg-[#F6F4F0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const prod = products.find((p) => p.id === deletingProductId);
                  handleDelete(deletingProductId, prod?.name || 'Product');
                }}
                className="flex-1 py-2.5 bg-[#B51F32] hover:bg-[#9C1A2B] text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ExhibitorProducts.displayName = 'ExhibitorProducts';
