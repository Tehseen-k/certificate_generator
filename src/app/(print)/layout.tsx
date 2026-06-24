import '@fontsource/dejavu-sans/400.css';
import '@fontsource/dejavu-sans/700.css';
import '@fontsource/dejavu-sans/400-italic.css';

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-white">{children}</div>;
}
