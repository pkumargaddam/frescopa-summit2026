/**
 * Metadata block - reads key/value pairs and sets page metadata.
 * The block content is hidden after processing.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const meta = {};
  [...block.children].forEach((row) => {
    if (row.children.length >= 2) {
      const key = row.children[0].textContent.trim().toLowerCase();
      const value = row.children[1].textContent.trim();
      if (key && value) {
        meta[key] = value;
        const existingMeta = document.querySelector(`meta[name="${key}"]`);
        if (existingMeta) {
          existingMeta.setAttribute('content', value);
        } else if (key === 'title') {
          document.title = value;
        } else {
          const metaTag = document.createElement('meta');
          metaTag.setAttribute('name', key);
          metaTag.setAttribute('content', value);
          document.head.appendChild(metaTag);
        }
      }
    }
  });
}
