/**
 * Component Loader for TinyMath Calculator
 * Handles loading and rendering of HTML templates
 */

export class ComponentLoader {
    /**
     * Load all templates from a template file
     * @param {string} templatePath - Path to the template file
     * @returns {Promise<Object>} Object containing all loaded templates
     */
    static async loadTemplates(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load templates: ${response.status}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const templates = {};
            const templateElements = doc.querySelectorAll('template');
            
            templateElements.forEach(template => {
                const id = template.id;
                if (id) {
                    templates[id] = template.content.cloneNode(true);
                }
            });
            
            return templates;
        } catch (error) {
            console.warn('Failed to load templates:', error);
            return {};
        }
    }
    
    /**
     * Render a template into a container element
     * @param {DocumentFragment} template - Template to render
     * @param {Element} container - Container element
     */
    static renderTemplate(template, container) {
        if (template && container) {
            container.innerHTML = '';
            container.appendChild(template.cloneNode(true));
        }
    }
    
    /**
     * Create a component element from template
     * @param {DocumentFragment} template - Template to use
     * @returns {Element} Created element
     */
    static createComponent(template) {
        if (!template) return null;
        
        const wrapper = document.createElement('div');
        wrapper.appendChild(template.cloneNode(true));
        return wrapper.firstElementChild;
    }
}
