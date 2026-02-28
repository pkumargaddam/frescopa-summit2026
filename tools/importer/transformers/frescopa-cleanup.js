/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Frescopa AEM Cloud website cleanup
 * Purpose: Remove non-content elements, experience fragments, and AEM tracking attributes
 * Applies to: publish-p45403-e1547974.adobeaemcloud.com (all templates)
 * Generated: 2026-02-27
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow of /us/en.html
 * - Found: .experiencefragment.header, .experiencefragment.footer
 * - Found: data-cmp-data-layer attributes on most interactive elements
 * - Found: .cmp-page__toastmessagehide toast message container
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove header and footer experience fragments (handled by EDS nav/footer)
    // EXTRACTED: Found <div class="experiencefragment header"> in captured DOM
    // EXTRACTED: Found <div class="experiencefragment footer"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.experiencefragment.header',
      '.experiencefragment.footer',
    ]);

    // Remove toast message container
    // EXTRACTED: Found <div class="cmp-page__toastmessagehide"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.cmp-page__toastmessagehide',
    ]);

    // Remove hidden overlay/modal elements from location-finder
    // EXTRACTED: Found elements with hidden="" attribute in captured DOM
    const hiddenElements = element.querySelectorAll('[hidden]');
    hiddenElements.forEach((el) => el.remove());
  }

  if (hookName === TransformHook.afterTransform) {
    // Clean up AEM tracking and data layer attributes
    // EXTRACTED: Found data-cmp-data-layer on teasers, navigation, images, text components
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-clickable');
      el.removeAttribute('data-cmp-is');
      el.removeAttribute('data-cmp-hook-image');
      el.removeAttribute('data-cmp-widths');
      el.removeAttribute('data-cmp-src');
      el.removeAttribute('data-cmp-filereference');
      el.removeAttribute('data-cmp-contentfragment-element-type');
      el.removeAttribute('data-cmp-contentfragment-model');
      el.removeAttribute('data-cmp-contentfragment-path');
      el.removeAttribute('data-cmp-offer-processed');
      el.removeAttribute('data-cmp-initialized');
    });

    // Remove remaining non-content elements
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link[rel="stylesheet"]',
    ]);
  }
}
