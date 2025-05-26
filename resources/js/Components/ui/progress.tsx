interface ProgressProps {
    value: number; // nilai dalam persen (0 - 100)
    className?: string;
}

export function Progress({ value, className = '' }: ProgressProps) {
    return (
        <div className={`w-full bg-gray-200 rounded-full h-4 overflow-hidden ${className}`}>
            <div
                className="h-full bg-green-500 transition-all duration-300 ease-in-out"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}
