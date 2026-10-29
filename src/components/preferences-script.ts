export const THEME_STORAGE_KEY = "ticklog-theme";
export const SIDEBAR_STORAGE_KEY = "ticklog-sidebar";

// Inlined in the root layout and run before first paint, so saved preferences
// apply without a flash. Defaults: dark (OLED) theme, expanded sidebar.
export const preferencesScript = `(function(){var d=document.documentElement,t="dark",s="expanded";try{var a=localStorage.getItem("${THEME_STORAGE_KEY}");if(a==="light"||a==="dark")t=a;var b=localStorage.getItem("${SIDEBAR_STORAGE_KEY}");if(b==="collapsed")s=b}catch(e){}d.dataset.theme=t;d.dataset.sidebar=s})()`;
