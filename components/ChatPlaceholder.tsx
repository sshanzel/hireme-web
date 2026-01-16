'use client';

import {Card, CardContent} from '@/components/ui/card';
import {MessageSquare} from 'lucide-react';

export function ChatPlaceholder() {
  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col items-center justify-center text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">Chat Assistant</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your interview preparation assistant will be available here soon.
        </p>
      </CardContent>
    </Card>
  );
}
