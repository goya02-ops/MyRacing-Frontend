export function DecorativeBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden flex flex-col justify-between">
      {/* Degradado superior */}
      <div
        aria-hidden="true"
        className="relative flex justify-center blur-3xl mt-[-10rem] sm:mt-[-20rem]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%,100% 61.6%,97.5% 26.9%,85.5% 0.1%,80.7% 2%,72.5% 32.5%,60.2% 62.4%,52.4% 68.1%,47.5% 58.3%,45.2% 34.5%,27.5% 76.7%,0.1% 64.9%,17.9% 100%,27.6% 76.8%,76.1% 97.7%,74.1% 44.1%)',
          }}
          className="w-[36rem] sm:w-[72rem] aspect-[1155/678] bg-gradient-to-tr from-[#3098D9] to-[#F27127] opacity-30 rotate-[30deg]"
        />
      </div>

      {/* Degradado inferior */}
      <div
        aria-hidden="true"
        className="relative flex justify-center blur-3xl mb-[-10rem] sm:mb-[-20rem]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%,100% 61.6%,97.5% 26.9%,85.5% 0.1%,80.7% 2%,72.5% 32.5%,60.2% 62.4%,52.4% 68.1%,47.5% 58.3%,45.2% 34.5%,27.5% 76.7%,0.1% 64.9%,17.9% 100%,27.6% 76.8%,76.1% 97.7%,74.1% 44.1%)',
          }}
          className="w-[36rem] sm:w-[72rem] aspect-[1155/687] bg-gradient-to-tr from-[#3098D9] to-[#F27127] opacity-20"
        />
      </div>
    </div>
  );
}
