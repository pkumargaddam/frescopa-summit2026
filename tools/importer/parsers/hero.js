/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block
 *
 * Source: https://publish-p45403-e1547974.adobeaemcloud.com/us/en.html
 * Base Block: hero
 *
 * Block Structure (from markdown example):
 * - Row 1: Background image (optional - picture element)
 * - Row 2: Content (pretitle, heading, CTAs)
 *
 * Source HTML Patterns:
 * Pattern 1 - Teaser hero (.cmp-teaser):
 *   <div class="cmp-teaser">
 *     <div class="cmp-teaser__content">
 *       <p class="cmp-teaser__pretitle">...</p>
 *       <h3 class="cmp-teaser__title"><a>...</a></h3>
 *       <div class="cmp-teaser__action-container"><a>...</a></div>
 *     </div>
 *     <div class="cmp-teaser__image"><img .../></div>
 *   </div>
 *
 * Pattern 2 - Content Fragment offer (.cmp-contentfragment):
 *   <article class="cmp-contentfragment">
 *     <dl class="cmp-contentfragment__elements" style="background-image: url(...)">
 *       <div class="cmp-contentfragment__element--headline"><dd>...</dd></div>
 *       <div class="cmp-contentfragment__element--pretitle"><dd>...</dd></div>
 *       <div class="cmp-contentfragment__element--detail"><dd>...</dd></div>
 *       <div class="cmp-contentfragment__element--callToAction"><dd>...</dd></div>
 *     </dl>
 *   </article>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which pattern we're parsing
  const isTeaserHero = !!element.querySelector('.cmp-teaser__content');
  const isContentFragmentHero = !!element.querySelector('.cmp-contentfragment__elements');

  if (isTeaserHero) {
    // Pattern 1: Teaser-based hero
    const img = element.querySelector('.cmp-teaser__image img, .cmp-image__image');
    const pretitle = element.querySelector('.cmp-teaser__pretitle');
    const titleLink = element.querySelector('.cmp-teaser__title a, .cmp-teaser__title');
    const ctaLink = element.querySelector('.cmp-teaser__action-link');

    // Row 1: Background image
    if (img) {
      cells.push([img]);
    }

    // Row 2: Content (pretitle, heading, CTA)
    const contentCell = [];
    if (pretitle) contentCell.push(pretitle);
    if (titleLink) {
      const h1 = document.createElement('h1');
      h1.textContent = titleLink.textContent.trim();
      contentCell.push(h1);
    }
    if (ctaLink) contentCell.push(ctaLink);
    cells.push(contentCell);
  } else if (isContentFragmentHero) {
    // Pattern 2: Content Fragment offer hero
    const dl = element.querySelector('.cmp-contentfragment__elements');
    const bgUrl = dl ? dl.style.backgroundImage : '';

    const headlineEl = element.querySelector('.cmp-contentfragment__element--headline dd');
    const pretitleEl = element.querySelector('.cmp-contentfragment__element--pretitle dd');
    const detailEl = element.querySelector('.cmp-contentfragment__element--detail dd');
    const ctaEl = element.querySelector('.cmp-contentfragment__element--callToAction dd');

    // Row 1: Background image (from inline style)
    if (bgUrl) {
      const urlMatch = bgUrl.match(/url\(["']?([^"')]+)["']?\)/);
      if (urlMatch) {
        const img = document.createElement('img');
        img.src = urlMatch[1];
        img.alt = 'Promotional background';
        cells.push([img]);
      }
    }

    // Row 2: Content
    const contentCell = [];
    if (pretitleEl) {
      const em = document.createElement('em');
      em.textContent = pretitleEl.textContent.trim();
      contentCell.push(em);
    }
    if (detailEl) {
      const em2 = document.createElement('em');
      em2.textContent = detailEl.textContent.trim();
      contentCell.push(em2);
    }
    if (headlineEl) {
      const h1 = document.createElement('h1');
      h1.textContent = headlineEl.textContent.trim();
      contentCell.push(h1);
    }
    if (ctaEl) {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = ctaEl.textContent.trim();
      contentCell.push(a);
    }
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero', cells });
  element.replaceWith(block);
}
