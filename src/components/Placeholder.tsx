const Placeholder = ({ className }: { className?: string }) => {
  return (
    <div
      className={`h-[14px] w-[100px] animate-pulse space-y-3 rounded bg-transparent-100-16 ${className}`}
    />
  );
};

export default Placeholder;
