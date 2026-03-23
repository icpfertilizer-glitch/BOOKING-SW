// utils.js — Shared utility functions

/** Shorthand for document.querySelector */
export const $ = (sel) => document.querySelector(sel);

/** Shorthand for document.querySelectorAll */
export const $$ = (sel) => document.querySelectorAll(sel);

/** Escape HTML to prevent XSS */
export function escapeHTML(s = '') {
  return String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

/** Debounce function */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), ms);
  };
}

/** Get first letter of name safely */
export function safeFirstLetter(name) {
  if (typeof name !== 'string' || name.length === 0) return 'U';
  return name.charAt(0).toUpperCase();
}
