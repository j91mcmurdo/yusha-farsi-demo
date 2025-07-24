import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Yusha's Farsi Journey. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="https://github.com/j91mcmurdo/yusha-farsi-demo" target="_blank" rel="noopener noreferrer" aria-label="Github">
              <Github className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
            <Link href="https://www.linkedin.com/in/joshmcmurdo1/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
            <Link href="https://x.com/yushawrites" target="_blank" rel="noopener noreferrer" aria-label="X formerly known as Twitter">
              <XIcon />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
