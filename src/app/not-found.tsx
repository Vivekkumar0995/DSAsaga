import Link from 'next/link';
import { FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        #app-navbar { display: none !important; opacity: 0; pointer-events: none; }
        #app-footer { display: none !important; opacity: 0; pointer-events: none; }
      `}} />
      <div className="flex flex-col items-center justify-center min-h-[85vh] bg-background text-foreground font-sans">
        <div className="max-w-md w-full px-6 flex flex-col items-start space-y-6">
        <div className="mb-2">
          <FileWarning className="w-14 h-14 text-muted-foreground" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight">
          This page can&apos;t be reached
        </h1>

        <div className="text-base text-muted-foreground space-y-4">
          <p>Check if there is a typo in the URL path.</p>

          <p>
            If spelling is correct, try returning to the{' '}
            <Link href="/" className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
              homepage
            </Link>.
          </p>

          <p className="text-xs tracking-wider uppercase pt-4 opacity-70">
            ERR_404_PAGE_NOT_FOUND
          </p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <Button
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full px-8 py-2 font-medium"
            >
              Reload / Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
