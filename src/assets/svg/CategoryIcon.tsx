const CategoryIcon = ({ className, path }: { className?: string; path: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d={path} />
  </svg>
);

export default CategoryIcon;
