import React, { useState } from 'react';
import { LetterSettings, Variable, TabView, PageSizePreset } from '../types';
import RichTextEditor from './RichTextEditor';

interface EditorPanelProps {
  settings: LetterSettings;
  setSettings: React.Dispatch<React.SetStateAction<LetterSettings>>;
  onDownload: () => void;
  onBack: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ settings, setSettings, onDownload, onBack }) => {
  const [activeSection, setActiveSection] = useState<'variables' | 'editor' | 'layout'>('variables');

  const updateSetting = <K extends keyof LetterSettings>(key: K, value: LetterSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateVariable = (id: string, value: string) => {
    const newVars = settings.variables.map(v => v.id === id ? { ...v, defaultValue: value } : v);
    updateSetting('variables', newVars);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-xl overflow-hidden text-gray-900">
      <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h2 className="font-black text-xl text-gray-800 tracking-tight">BladeViewer</h2>
        </div>
        <button onClick={onDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          Print/PDF
        </button>
      </div>

      <div className="flex border-b border-gray-100 text-xs font-bold uppercase tracking-widest bg-white">
        {['Variables', 'Editor', 'Layout'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveSection(tab.toLowerCase() as any)} 
            className={`flex-1 px-4 py-4 transition-all ${activeSection === tab.toLowerCase() ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar">
        
        {activeSection === 'variables' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-2xl text-xs text-indigo-700 border border-indigo-100 mb-6 font-medium">
                Adjust values below to see them update in the Blade preview live.
            </div>
            
            <div className="space-y-4">
                {settings.variables.map((v) => (
                    <div key={v.id} className="group">
                        <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block tracking-wider group-focus-within:text-indigo-500 transition-colors">
                            {v.label || v.key} <span className="text-gray-300 font-mono text-[10px] ml-1">($${v.key})</span>
                        </label>
                        <input 
                            type="text" 
                            value={v.defaultValue} 
                            onChange={(e) => updateVariable(v.id, e.target.value)}
                            placeholder={`Enter ${v.key}...`}
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none shadow-sm"
                        />
                    </div>
                ))}
                {settings.variables.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-sm italic">No variables detected in this file.</p>
                    </div>
                )}
            </div>
          </div>
        )}

        {activeSection === 'editor' && (
          <div className="h-full flex flex-col gap-2">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Template HTML (Sanitized)</label>
             <RichTextEditor 
                content={settings.rawHtmlContent}
                onChange={(html) => updateSetting('rawHtmlContent', html)}
                defaultFontFamily={settings.contentFontFamily}
                minHeight="400px"
             />
          </div>
        )}

        {activeSection === 'layout' && (
          <div className="space-y-6">
              
              {/* Page Settings Section */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Page Settings</label>
                
                <div className="mb-4">
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold">Paper Preset</label>
                    <select 
                        value={settings.pageSize}
                        onChange={(e) => {
                            const newSize = e.target.value as PageSizePreset;
                            updateSetting('pageSize', newSize);
                            
                            // Update dimensions based on preset
                            if (newSize === 'A4') { 
                                updateSetting('pageWidth', 21); 
                                updateSetting('pageHeight', 29.7); 
                                updateSetting('unit', 'cm'); 
                            }
                            if (newSize === 'Letter') { 
                                updateSetting('pageWidth', 21.59); 
                                updateSetting('pageHeight', 27.94); 
                                updateSetting('unit', 'cm'); 
                            }
                            if (newSize === 'Legal') { 
                                updateSetting('pageWidth', 21.59); 
                                updateSetting('pageHeight', 35.56); 
                                updateSetting('unit', 'cm'); 
                            }
                            if (newSize === 'F4') { 
                                updateSetting('pageWidth', 21.5); 
                                updateSetting('pageHeight', 33); 
                                updateSetting('unit', 'cm'); 
                            }
                        }}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-sm text-gray-800 transition-all outline-none"
                    >
                        <option value="A4">A4 (21 x 29.7 cm)</option>
                        <option value="Letter">Letter (21.6 x 27.9 cm)</option>
                        <option value="Legal">Legal (21.6 x 35.6 cm)</option>
                        <option value="F4">F4 / Folio (21.5 x 33 cm)</option>
                        <option value="Custom">Custom Size</option>
                    </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">Width</label>
                      <input 
                        type="number" step="0.1" value={settings.pageWidth}
                        onChange={(e) => {
                            updateSetting('pageWidth', parseFloat(e.target.value));
                            updateSetting('pageSize', 'Custom');
                        }}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-sm text-gray-800 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">Height</label>
                      <input 
                        type="number" step="0.1" value={settings.pageHeight}
                        onChange={(e) => {
                            updateSetting('pageHeight', parseFloat(e.target.value));
                            updateSetting('pageSize', 'Custom');
                        }}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-sm text-gray-800 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">Unit</label>
                      <select 
                        value={settings.unit}
                        onChange={(e) => updateSetting('unit', e.target.value as any)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-sm text-gray-800 transition-all outline-none"
                      >
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Page Margins ({settings.unit})</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                    <div key={side}>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">{side}</label>
                      <input 
                        type="number" step="0.1" value={settings[`margin${side}` as keyof LetterSettings] as number}
                        onChange={(e) => updateSetting(`margin${side}` as keyof LetterSettings, parseFloat(e.target.value))}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-sm text-gray-800 transition-all outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 space-y-4">
                 <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Typography & Styling</label>
                 <select 
                    value={settings.globalFontFamily}
                    onChange={(e) => updateSetting('globalFontFamily', e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-sm text-gray-800 transition-all outline-none mb-3"
                 >
                    <option value='"Times New Roman", serif'>Times New Roman</option>
                    <option value='"Arial", sans-serif'>Arial</option>
                    <option value='"Helvetica", sans-serif'>Helvetica</option>
                 </select>

                 <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="hideTableBorders"
                      checked={settings.hideTableBorders}
                      onChange={(e) => updateSetting('hideTableBorders', e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-gray-300"
                    />
                    <label htmlFor="hideTableBorders" className="text-xs font-medium text-gray-600 cursor-pointer select-none">
                        Hide All Table Borders (for Layout Tables)
                    </label>
                 </div>
              </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EditorPanel;