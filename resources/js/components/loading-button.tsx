import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { type ComponentProps } from 'react';

type LoadingButtonProps = ComponentProps<typeof Button> & {
    loading?: boolean;
    loadingText?: string;
};

export function LoadingButton({
    loading = false,
    loadingText,
    children,
    disabled,
    ...props
}: LoadingButtonProps) {
    return (
        <Button disabled={disabled || loading} {...props}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? (loadingText ?? children) : children}
        </Button>
    );
}
