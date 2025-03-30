import { Vault } from 'obsidian';

/**
 * Get the vault's base path in a way that works with the current Obsidian API
 * This is a workaround for the lack of a standardized way to get the vault path
 */
export async function getVaultBasePath(vault: Vault): Promise<string> {
    // Try different methods to get the vault path
    
    // Method 1: Try using getBasePath() if it exists
    if (typeof vault.adapter.getBasePath === 'function') {
        return await vault.adapter.getBasePath();
    }
    
    // Method 2: Try accessing a basePath property if it exists
    if ('basePath' in vault.adapter) {
        return (vault.adapter as any).basePath;
    }
    
    // Method 3: If all else fails, return empty string
    // In a real plugin, you might want to show an error or use a default
    console.warn('Could not determine vault base path. PDF export might not work correctly.');
    return '';
}
