import { BladeAnalysisResponse } from "../types";

/**
 * LOCAL PARSER ENGINE
 * Parses Blade templates using Regex without relying on external AI APIs.
 * This is faster, instant, and works offline.
 */

export const analyzeBladeCode = async (bladeCode: string): Promise<BladeAnalysisResponse> => {
    // 1. Simulate a tiny delay for UI feedback (optional, removes "flicker" feeling)
    await new Promise(resolve => setTimeout(resolve, 300));

    // 2. Extract Variables
    // Matches: {{ $varName }}, {{ $varName ?? 'default' }}, {!! $varName !!}
    const variableRegex = /\{\{\s*\$([a-zA-Z0-9_]+)(?:\s*\?\?\s*['"]([^'"]*)['"])?\s*\}\}|(?<!@)\{!!\s*\$([a-zA-Z0-9_]+)\s*!!\}/g;
    
    const variablesMap = new Map<string, { key: string; label: string; defaultValue: string }>();
    let match;

    while ((match = variableRegex.exec(bladeCode)) !== null) {
        // match[1] is {{ $var }}, match[3] is {!! $var !!}
        const key = match[1] || match[3]; 
        // match[2] is the default value in {{ $var ?? 'default' }}
        const foundDefault = match[2] || "";

        if (key && !variablesMap.has(key)) {
            // Convert camelCase or snake_case to Title Case for label
            const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
            
            variablesMap.set(key, {
                key: key,
                label: label,
                defaultValue: foundDefault
            });
        }
    }

    // 3. Clean Blade Directives to generate Preview HTML
    // We want to remove logic tags but keep the content inside them so it shows up in preview.
    let cleanHtml = bladeCode;

    // Remove @extends, @section, @endsection, @push, @stack (layout tags)
    // We often want to remove the wrapper but keep content. For @extends usually we just ignore it for a single file viewer.
    cleanHtml = cleanHtml.replace(/@(extends|section|endsection|push|endpush|yield|include)\s*\(.*?\)/gi, '');
    cleanHtml = cleanHtml.replace(/@(stop|show|parent)/gi, '');

    // Remove Control Structures (@if, @foreach, etc) but KEEP content
    // Strategy: Remove the opening tag line and the closing tag line.
    const controlStructures = [
        'if', 'elseif', 'else', 'endif',
        'foreach', 'endforeach', 'forelse', 'endforelse', 'empty',
        'auth', 'endauth', 'guest', 'endguest',
        'switch', 'case', 'break', 'default', 'endswitch',
        'while', 'endwhile',
        'php', 'endphp',
        'props', 'aware', 'component', 'endcomponent', 'slot', 'endslot'
    ];
    
    // Create regex for tags: @tagName(...) or @tagName
    const controlRegex = new RegExp(`@(${controlStructures.join('|')})(?:\\s*\\(.*?\\))?`, 'gi');
    cleanHtml = cleanHtml.replace(controlRegex, '');

    // Handle {{ asset('...') }} -> try to just keep the filename or remove
    cleanHtml = cleanHtml.replace(/\{\{\s*asset\(['"](.*?)['"]\)\s*\}\}/gi, '$1');
    
    // Handle {{ route('...') }} -> replace with #
    cleanHtml = cleanHtml.replace(/\{\{\s*route\(['"](.*?)['"]\)\s*\}\}/gi, '#');

    // Handle {{ config('...') }}
    cleanHtml = cleanHtml.replace(/\{\{\s*config\(['"](.*?)['"]\)\s*\}\}/gi, 'ConfigValue');

    // 4. Return Result
    return {
        cleanHtml: cleanHtml,
        variables: Array.from(variablesMap.values()),
        suggestedSettings: {
            pageSize: 'A4', // Default
            unit: 'cm'
        }
    };
};

export const generateLogo = async (prompt: string, aspectRatio: string): Promise<string> => {
    // Mock functionality or throw error since we removed AI
    throw new Error("Logo generation is disabled in Local Mode.");
}