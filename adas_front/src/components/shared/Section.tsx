interface SectionProps {
  children: React.ReactNode;
}

const Section = ({ children }: SectionProps) => {
  return <div className="w-full flex flex-col gap-6 p-6">{children}</div>;
};

export default Section;
