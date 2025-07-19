import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
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
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="Github">
              <Github className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
            <Link href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X formerly known as Twitter">
              <XIcon />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
