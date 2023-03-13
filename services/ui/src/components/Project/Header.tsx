const Header = () => {
  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200">
        <form
          className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:justify-between items-center"
          autoComplete="off"
        >
          <input
            className={`
              bg-gray-100
              appearance-none
              w-full
              md:w-1/2
              lg:w-1/3
              block
              text-gray-700
              border
              border-gray-100
              dark:bg-gray-900
              dark:text-white
              dark:border-gray-900
              rounded
              py-2
              px-3
              leading-tight
              focus:outline-none
              focus:border-indigo-400
              focus:ring-0
            `}
            type="text"
            placeholder="Project name"
            autoComplete="off"
            id="name"
            name="name"
            onChange={(e: any) => {
              console.log(e);
            }}
            value={"Untitled"}
          />
        </form>
      </div>
    </>
  );
};

export default Header;
