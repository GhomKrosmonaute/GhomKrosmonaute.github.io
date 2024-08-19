export const Heading = () => {
  return (
    <div className="flex flex-col md:flex-row gap-2 mx-auto mb-4 max-w-fit whitespace-nowrap">
      <h1 className="text-7xl mx-auto">GHOM</h1>
      <div className="flex md:grid grid-rows-2 sm:*:text-center gap-2 md:gap-0 mx-auto sm:mx-0">
        <div className="text-2xl md:text-3xl">Développeur</div>
        <div className="text-2xl">
          Web <span className="hidden sm:inline">Freelance</span>
        </div>
      </div>
    </div>
  );
};
