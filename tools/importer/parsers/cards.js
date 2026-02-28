/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block
 *
 * Source: https://publish-p45403-e1547974.adobeaemcloud.com/us/en.html
 * Base Block: cards
 *
 * Block Structure (from markdown example):
 * - Row per card: [image | title + description + CTA]
 *
 * Source HTML Pattern (.container.flexcolummns):
 *   <div class="container flexcolummns">
 *     <div class="cmp-container">
 *       <div class="teaser textAtBottom orangebutton">
 *         <div class="cmp-teaser">
 *           <div class="cmp-teaser__content">
 *             <h3 class="cmp-teaser__title"><a>...</a></h3>
 *             <div class="cmp-teaser__description">...</div>
 *             <div class="cmp-teaser__action-container"><a>...</a></div>
 *           </div>
 *           <div class="cmp-teaser__image"><img .../></div>
 *         </div>
 *       </div>
 *       <!-- More teasers... -->
 *     </div>
 *   </div>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find all teaser items within the flex columns container
  const teasers = element.querySelectorAll('.teaser .cmp-teaser');

  teasers.forEach((teaser) => {
    const img = teaser.querySelector('.cmp-teaser__image img, .cmp-image__image');
    const titleLink = teaser.querySelector('.cmp-teaser__title a, .cmp-teaser__title');
    const description = teaser.querySelector('.cmp-teaser__description');
    const ctaLink = teaser.querySelector('.cmp-teaser__action-link');

    // Column 1: Image
    const col1 = [];
    if (img) col1.push(img);

    // Column 2: Title + Description + CTA
    const col2 = [];
    if (titleLink) {
      const h3 = document.createElement('h3');
      if (titleLink.tagName === 'A') {
        const a = document.createElement('a');
        a.href = titleLink.href;
        a.textContent = titleLink.textContent.trim();
        h3.appendChild(a);
      } else {
        h3.textContent = titleLink.textContent.trim();
      }
      col2.push(h3);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      col2.push(p);
    }
    if (ctaLink) {
      const a = document.createElement('a');
      a.href = ctaLink.href;
      a.textContent = ctaLink.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(a);
      col2.push(p);
    }

    cells.push([col1, col2]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards', cells });
  element.replaceWith(block);
}
