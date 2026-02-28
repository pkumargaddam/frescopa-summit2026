/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block
 *
 * Source: https://publish-p45403-e1547974.adobeaemcloud.com/us/en.html
 * Base Block: columns
 *
 * Block Structure (from markdown example):
 * - Row 1: Two columns side by side [col1 | col2]
 *
 * Source HTML Patterns:
 * Pattern 1 - Frescopa Banner (.cmp-frescopa-banner):
 *   <section class="cmp-frescopa-banner">
 *     <div class="cmp-frescopa-banner__image"><img .../></div>
 *     <div class="cmp-frescopa-banner__content">
 *       <h2 class="cmp-frescopa-banner__title">...</h2>
 *       <div class="cmp-frescopa-banner__description"><p>...</p></div>
 *       <a class="cmp-frescopa-banner__cta">...</a>
 *     </div>
 *   </section>
 *
 * Pattern 2 - Location Finder (.cmp-location-finder):
 *   <section class="cmp-location-finder">
 *     <div class="cmp-location-finder__panel">
 *       <h2 class="cmp-location-finder__title">...</h2>
 *       <p class="cmp-location-finder__label">...</p>
 *     </div>
 *     <div class="cmp-location-finder__map">...</div>
 *   </section>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  const cells = [];

  const isBanner = !!element.querySelector('.cmp-frescopa-banner');
  const isLocationFinder = !!element.querySelector('.cmp-location-finder');

  if (isBanner) {
    // Pattern 1: Frescopa Banner - image left, text right
    const bannerImg = element.querySelector('.cmp-frescopa-banner__image img');
    const title = element.querySelector('.cmp-frescopa-banner__title');
    const desc = element.querySelector('.cmp-frescopa-banner__description');
    const cta = element.querySelector('.cmp-frescopa-banner__cta');

    // Column 1: Image
    const col1 = [];
    if (bannerImg) col1.push(bannerImg);

    // Column 2: Text content
    const col2 = [];
    if (title) {
      const h2 = document.createElement('h2');
      h2.textContent = title.textContent.trim();
      col2.push(h2);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      col2.push(p);
    }
    if (cta) col2.push(cta);

    cells.push([col1, col2]);
  } else if (isLocationFinder) {
    // Pattern 2: Location Finder - text left, map right
    const title = element.querySelector('.cmp-location-finder__title');
    const label = element.querySelector('.cmp-location-finder__label');

    // Column 1: Text content
    const col1 = [];
    if (title) {
      const h2 = document.createElement('h2');
      h2.textContent = title.textContent.trim();
      col1.push(h2);
    }
    if (label) {
      const strong = document.createElement('strong');
      strong.textContent = label.textContent.trim();
      col1.push(strong);
    }

    // Column 2: Map placeholder
    const col2 = [];
    const mapText = document.createTextNode('Map View');
    col2.push(mapText);

    cells.push([col1, col2]);
  } else {
    // Generic fallback: try to split direct children into columns
    const children = Array.from(element.querySelectorAll(':scope > div, :scope > section'));
    if (children.length >= 2) {
      cells.push([children[0], children[1]]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
  element.replaceWith(block);
}
