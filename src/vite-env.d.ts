/// <reference types="vite/client" />

interface ImportMetaEnv {
  // GitHub-backed data sync (used as a fallback store when no backend
  // server, e.g. on a static GitHub Pages deployment). See README.md
  // section "Đồng bộ dữ liệu qua GitHub" for setup instructions.
  readonly VITE_GITHUB_OWNER?: string;
  readonly VITE_GITHUB_REPO?: string;
  readonly VITE_GITHUB_BRANCH?: string;
  readonly VITE_GITHUB_TOKEN?: string;
  readonly VITE_GITHUB_DATA_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
