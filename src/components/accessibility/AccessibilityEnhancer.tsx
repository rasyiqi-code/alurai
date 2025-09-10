'use client';

import { useEffect } from 'react';

export function AccessibilityEnhancer() {
  useEffect(() => {
    // Add ARIA labels to interactive elements
    const enhanceAccessibility = () => {
      // Add role="button" to clickable divs
      const clickableDivs = document.querySelectorAll('div[onclick], div[role="button"]');
      clickableDivs.forEach(div => {
        if (!div.getAttribute('tabindex')) {
          div.setAttribute('tabindex', '0');
        }
        if (!div.getAttribute('role')) {
          div.setAttribute('role', 'button');
        }
      });

      // Add aria-labels to buttons without text
      const iconButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      iconButtons.forEach(button => {
        const icon = button.querySelector('svg, [class*="icon"]');
        if (icon && !button.textContent?.trim()) {
          const iconName = icon.getAttribute('aria-label') || 
                          icon.getAttribute('title') || 
                          (typeof icon.className === 'string' ? icon.className.match(/icon-(\w+)/)?.[1] : null) ||
                          'button';
          button.setAttribute('aria-label', iconName);
        }
      });

      // Add aria-expanded to collapsible elements
      const collapsibleElements = document.querySelectorAll('[data-collapsible], [data-expanded]');
      collapsibleElements.forEach(element => {
        const isExpanded = element.getAttribute('data-expanded') === 'true' ||
                          element.classList.contains('expanded') ||
                          element.classList.contains('open');
        element.setAttribute('aria-expanded', isExpanded.toString());
      });

      // Add aria-current to navigation items
      const navLinks = document.querySelectorAll('nav a, [role="navigation"] a');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const currentPath = window.location.pathname;
        if (href && (currentPath === href || currentPath.startsWith(href + '/'))) {
          link.setAttribute('aria-current', 'page');
        }
      });

      // Add aria-describedby to form inputs
      const formInputs = document.querySelectorAll('input, textarea, select');
      formInputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        const error = input.closest('.form-group')?.querySelector('.error-message');
        const help = input.closest('.form-group')?.querySelector('.help-text');
        
        const describedBy = [error?.id, help?.id].filter(Boolean).join(' ');
        if (describedBy) {
          input.setAttribute('aria-describedby', describedBy);
        }
      });

      // Add focus indicators
      const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
          element.classList.add('focus-visible');
        });
        element.addEventListener('blur', () => {
          element.classList.remove('focus-visible');
        });
      });
    };

    // Run on mount and when DOM changes
    enhanceAccessibility();
    
    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(enhanceAccessibility);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-expanded', 'data-collapsible']
    });

    // Add keyboard navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close modals/dropdowns
      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.closest('[role="dialog"], [role="menu"], [data-dropdown]')) {
          activeElement.blur();
        }
      }

      // Enter/Space for custom buttons
      if ((e.key === 'Enter' || e.key === ' ') && 
          (e.target as HTMLElement)?.getAttribute('role') === 'button') {
        e.preventDefault();
        (e.target as HTMLElement).click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}

// High contrast mode support
export function HighContrastMode() {
  useEffect(() => {
    const checkHighContrast = () => {
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    };

    checkHighContrast();
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', checkHighContrast);

    return () => {
      window.matchMedia('(prefers-contrast: high)').removeEventListener('change', checkHighContrast);
    };
  }, []);

  return null;
}

// Reduced motion support
export function ReducedMotionSupport() {
  useEffect(() => {
    const checkReducedMotion = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };

    checkReducedMotion();
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkReducedMotion);

    return () => {
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkReducedMotion);
    };
  }, []);

  return null;
}
