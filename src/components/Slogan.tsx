export const Slogan = () => {
  return (
    <div className="w-full">
      <p className="w-fit whitespace-nowrap xs:tracking-wider md:tracking-[0.15rem] mx-auto mt-2 text-left md:text-center md:text-2xl">
        <span className="hidden xs:inline">Un tarif</span>
        <span className="xs:hidden">Une tarification</span>{" "}
        <span className="font-changa ">abordable</span>{" "}
        <br className="xs:hidden" />
        <span className="capitalize xs:lowercase">pour</span> une qualité{" "}
        <span className="font-changa">maximale</span>
      </p>
    </div>
  );
};
