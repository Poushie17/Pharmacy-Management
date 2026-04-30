const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-1 font-bold ${className}`}>Pharma
      <span className="text-primary">C+</span>
    </div>
  );
};

export default Logo;