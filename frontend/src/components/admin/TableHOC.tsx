import {
  AiOutlineSortAscending,
  AiOutlineSortDescending,
} from "react-icons/ai";
import {
  Column,
  usePagination,
  useSortBy,
  useTable,
  TableOptions,
} from "react-table";

function TableHOC<T extends Object>(
  columns: Column<T>[],
  data: T[],
  containerClassname: string,
  heading: string,
  showPagination: boolean = false
) {
  return function HOC() {
    const options: TableOptions<T> = {
      columns,
      data,
      initialState: {
        pageSize: 6,
      },
    };

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      page,
      prepareRow,
      nextPage,
      pageCount,
      state: { pageIndex },
      previousPage,
      canNextPage,
      canPreviousPage,
    } = useTable(options, useSortBy, usePagination);

    return (
      <div className={`bg-white shadow-xl rounded-xl p-6 ${containerClassname}`}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{heading}</h2>

        <div className="overflow-x-auto">
          <table 
            className="min-w-full divide-y divide-gray-200 table-auto" 
            {...getTableProps()}
          >
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th 
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center space-x-1">
                        {column.render("Header")}
                        {column.isSorted && (
                          <span className="ml-1">
                            {column.isSortedDesc ? (
                              <AiOutlineSortDescending className="w-4 h-4" />
                            ) : (
                              <AiOutlineSortAscending className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {page.map((row) => {
                prepareRow(row);

                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50 transition-colors">
                    {row.cells.map((cell) => (
                      <td 
                        {...cell.getCellProps()}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button 
              disabled={!canPreviousPage} 
              onClick={previousPage}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                canPreviousPage ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Prev
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page <span className="font-semibold">{pageIndex + 1}</span> of <span className="font-semibold">{pageCount}</span>
            </span>
            <button 
              disabled={!canNextPage} 
              onClick={nextPage}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                canNextPage ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };
}

export default TableHOC;