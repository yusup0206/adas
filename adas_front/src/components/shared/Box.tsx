interface BoxProps {
  children: React.ReactNode;
}

const Box = ({ children }: BoxProps) => {
  return (
    <div className="w-full flex flex-col gap-4 p-4 bg-white border border-borderColor rounded-md active:shadow-md md:hover:shadow-md transition-all overflow-x-auto">
      {children}
    </div>
  );
};

export default Box;
