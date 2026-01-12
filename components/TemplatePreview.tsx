import React, { useMemo } from 'react';
import { LetterSettings } from '../types';

interface TemplatePreviewProps {
  settings: LetterSettings;
  scale?: number;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ settings, scale = 1 }) => {

  const replaceVariables = (html: string) => {
    let content = html;
    settings.variables.forEach(v => {
      const regex = new RegExp(`\\{\\{\\s*\\$${v.key}\\s*\\}\\}`, 'g');
      content = content.replace(regex, `<span>${v.defaultValue || `[${v.key}]`}</span>`);
    });
    return content;
  };

  const processedContent = useMemo(() => replaceVariables(settings.rawHtmlContent), [settings.rawHtmlContent, settings.variables]);
  const processedHeader = useMemo(() => replaceVariables(settings.headerContent), [settings.headerContent, settings.variables]);
  const processedAttachment = useMemo(() => replaceVariables(settings.attachmentContent), [settings.attachmentContent, settings.variables]);
  const processedFooter = useMemo(() => replaceVariables(settings.footerContent), [settings.footerContent, settings.variables]);

  // Construct the CSS size string.
  // Use explicit dimensions for F4 and Custom to prevent browser fallback issues.
  const pageSizeCss = (settings.pageSize === 'Custom' || settings.pageSize === 'F4')
    ? `${settings.pageWidth}${settings.unit} ${settings.pageHeight}${settings.unit}`
    : `${settings.pageSize} portrait`;

  // Inline styles for SCREEN view (simulates paper with padding)
  const screenPageStyle = {
      width: `${settings.pageWidth}${settings.unit}`,
      minHeight: `${settings.pageHeight}${settings.unit}`,
      paddingTop: `${settings.marginTop}${settings.unit}`,
      paddingRight: `${settings.marginRight}${settings.unit}`,
      paddingBottom: `${settings.marginBottom}${settings.unit}`,
      paddingLeft: `${settings.marginLeft}${settings.unit}`,
  };

  const HeaderLines = () => (
    <div className="w-full clear-both">
        {settings.headerLines.map((line) => (
            <div 
                key={line.id} 
                style={{ 
                    borderBottomWidth: `${line.width}px`, 
                    borderBottomStyle: line.style, 
                    borderColor: line.color,
                    marginTop: `${line.marginTop}px`,
                    marginBottom: `${line.marginBottom}px`
                }} 
            />
        ))}
    </div>
  );

  const HeaderComponent = () => (
    <div className="mb-2">
        <div className="flex items-center gap-4 mb-2" style={{ fontFamily: settings.headerFontFamily }}>
        {settings.logoUrl && (
            <div className="flex-shrink-0" style={{ width: '80px' }}>
            <img src={settings.logoUrl} alt="Logo" className="w-full h-auto object-contain" />
            </div>
        )}
        <div className="flex-grow text-center leading-tight text-black" dangerouslySetInnerHTML={{ __html: processedHeader }} />
        </div>
        <HeaderLines />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 print:block print:gap-0">
    {/* 
        DYNAMIC PRINT STYLES
        We move margins from 'padding' to '@page margin'.
        This allows the browser to apply margins to EVERY page generated, 
        fixing the issue where page 2 text starts at the very top edge.
    */}
    <style>
        {`
            @media print {
                @page {
                    size: ${pageSizeCss}; 
                    /* Apply User Margins directly to the Paper */
                    margin-top: ${settings.marginTop}${settings.unit} !important;
                    margin-right: ${settings.marginRight}${settings.unit} !important;
                    margin-bottom: ${settings.marginBottom}${settings.unit} !important;
                    margin-left: ${settings.marginLeft}${settings.unit} !important;
                }

                .print-page {
                    box-sizing: border-box !important;
                    width: 100% !important;
                    /* Remove padding in print mode because @page handles the margins now */
                    padding: 0 !important; 
                    margin: 0 !important;
                    min-height: 0 !important; /* Let content dictate height */
                    height: auto !important;
                    overflow: visible !important; 
                    display: block !important;
                    page-break-after: always !important;
                }

                /* Ensure attachments start on a new page */
                .print-page + .print-page {
                    page-break-before: always !important;
                }

                .print-page:last-child {
                    page-break-after: auto !important;
                }
            }

            /* Optional: Hide table borders if requested */
            ${settings.hideTableBorders ? `
                .content-body table, .content-body th, .content-body td {
                    border: none !important;
                }
            ` : ''}
        `}
    </style>

    {/* Page 1: Letter */}
    <div 
      className="print-page relative bg-white text-black box-border shadow-2xl transition-transform origin-top flex flex-col overflow-hidden"
      style={{
        transform: `scale(${scale})`, // Screen scale
        ...screenPageStyle, // Screen padding & size
        fontFamily: settings.globalFontFamily,
        fontSize: `${settings.fontSize}pt`,
        color: '#000000',
      }}
    >
      {settings.showKop && <HeaderComponent />}

      <div className="content-body leading-relaxed text-black flex-grow" style={{ fontFamily: settings.contentFontFamily }} dangerouslySetInnerHTML={{ __html: processedContent }} />

      {/* Signatures */}
      {settings.showSignature && settings.signatures.length > 0 && (
        <div className="mt-2 w-full flex-shrink-0">
           <div className="grid grid-cols-2 gap-8">
             {settings.signatures.map((sig, idx) => {
                const total = settings.signatures.length;
                const isSingle = total === 1;
                const isOdd = total % 2 !== 0;
                const isLast = idx === total - 1;

                let wrapperClass = "text-center min-w-[200px] text-black ";
                
                if (isSingle) {
                    wrapperClass += "col-span-2 flex flex-col ";
                    if (sig.align === 'left') wrapperClass += "items-start text-left";
                    else if (sig.align === 'center') wrapperClass += "items-center text-center";
                    else wrapperClass += "items-end text-center"; 
                } else if (isOdd && isLast) {
                    wrapperClass += "col-span-2 justify-self-center";
                } else {
                    wrapperClass += "justify-self-center";
                }

                return (
                    <div key={sig.id} className={wrapperClass}>
                        <p className="mb-1">{sig.label}</p>
                        {isLast && (
                             <p className="mb-2">{settings.signatureCity}, <span className="bg-yellow-100 px-1 print:bg-transparent">{`{{ $tanggal }}`}</span></p>
                        )}
                        <div className="h-20 flex items-center justify-center my-2">
                            {sig.type === 'wet' ? <div className="h-full"></div> : <div className="border border-dashed border-gray-400 p-2 text-[10px] bg-gray-50 flex items-center justify-center w-20 h-20 print:border-solid print:border-black">QR Code</div>}
                        </div>
                        <p className="font-bold underline mt-2">{sig.name}</p>
                        <p>{sig.title}</p>
                    </div>
                );
             })}
           </div>
        </div>
      )}

      {settings.showFooter && (
          <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-center text-gray-500 flex-shrink-0" dangerouslySetInnerHTML={{ __html: processedFooter }} />
      )}
      
      <div className="page-break-indicator absolute top-4 right-4 bg-gray-200 text-gray-500 text-[10px] px-2 py-1 rounded opacity-50 print:hidden">Page 1</div>
    </div>

    {/* Page 2: Attachments */}
    {settings.hasAttachment && (
        <div 
            className="print-page relative bg-white text-black box-border shadow-2xl transition-transform origin-top flex flex-col overflow-hidden"
            style={{
                transform: `scale(${scale})`, 
                ...screenPageStyle,
                fontFamily: settings.globalFontFamily,
                fontSize: `${settings.fontSize}pt`,
                color: '#000000',
            }}
        >
            <div className="page-break-indicator absolute -top-6 left-0 text-gray-500 text-xs italic font-bold print:hidden">-- Page Break --</div>
            
            {settings.attachmentShowKop && <HeaderComponent />}
            
            <h3 className="font-bold text-lg mb-4 underline">Lampiran</h3>
            <div 
                className="content-body leading-relaxed text-black flex-grow"
                style={{ fontFamily: settings.attachmentFontFamily }}
                dangerouslySetInnerHTML={{ __html: processedAttachment }}
            />

            {settings.showFooter && (
                <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-center text-gray-500 flex-shrink-0" dangerouslySetInnerHTML={{ __html: processedFooter }} />
            )}
            
            <div className="page-break-indicator absolute top-4 right-4 bg-gray-200 text-gray-500 text-[10px] px-2 py-1 rounded opacity-50 print:hidden">Page 2+</div>
        </div>
    )}
    </div>
  );
};

export default TemplatePreview;