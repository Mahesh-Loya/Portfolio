/**
 * Sets the theme before first paint so the page never flashes the wrong ground.
 * Dark is the default; an explicit choice is remembered.
 */
const script = `try{var s=localStorage.getItem('theme');if(s==='light'||s==='dark'){document.documentElement.dataset.theme=s}}catch(e){}`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
