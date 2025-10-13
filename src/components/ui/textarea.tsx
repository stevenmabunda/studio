import * as React from 'react';
import { useLayoutEffect, useRef } from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    
    // Combine the forwarded ref and the internal ref
    React.useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    useLayoutEffect(() => {
        const textarea = internalRef.current;
        if (textarea) {
            // Reset height to shrink when text is deleted
            textarea.style.height = 'auto';
            // Set height to scrollHeight to fit content
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [props.value]);


    return (
      <textarea
        className={cn(
          'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-y-hidden',
          className
        )}
        ref={internalRef}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
