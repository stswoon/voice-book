export function loadScript(src: string): void {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    script.async = true;
    // script.defer = false;
    // script.onreadystatechange = callback;
    // script.onload = callback;
    // script.onerror = callback;
    document.head.appendChild(script);
};
