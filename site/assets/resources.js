"use strict";
const resources = window.VITAGENT_RESOURCES || {};
document.querySelectorAll("[data-resource]").forEach((placeholder) => {
  const value = resources[placeholder.dataset.resource];
  if (typeof value !== "string") return;
  let url;
  try { url = new URL(value); } catch { return; }
  if (url.protocol !== "https:") return;
  const link = document.createElement("a");
  link.href = url.href;
  link.className = placeholder.className.replace("resource-pending", "resource-ready");
  link.textContent = placeholder.dataset.resource === "viewer" ? "Open trajectory viewer" : placeholder.dataset.resource[0].toUpperCase() + placeholder.dataset.resource.slice(1);
  placeholder.replaceWith(link);
  if (placeholder.dataset.resource === "viewer") document.querySelector("[data-viewer-status]").textContent = "Explore trajectories";
});
