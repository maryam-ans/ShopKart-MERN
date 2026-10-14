function SearchBar({ value, onChange }) {
  return (
    <>
      <label className="sr-only" htmlFor="product-search">Search products</label>
      <input
        id="product-search"
        value={value}
        onChange={onChange}
        placeholder="Search products..."
        className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </>
  );
}

export default SearchBar;