/**
 * Initializes and checks if required dependencies are available
 * This helps to deal with the dynamically loaded dependencies needed for PDF generation
 */
export async function checkDependencies(): Promise<boolean> {
    try {
        // Check for html-pdf-node
        try {
            require('html-pdf-node');
            console.log('html-pdf-node is available');
        } catch (error) {
            console.error('html-pdf-node is not available:', error);
            return false;
        }
        
        // Check for showdown
        try {
            require('showdown');
            console.log('showdown is available');
        } catch (error) {
            console.error('showdown is not available:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking dependencies:', error);
        return false;
    }
}
