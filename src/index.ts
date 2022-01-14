import {DataPoint, DataTableColumn, DataTableConstructor, DataTableDataRows, DataTableHeader, DataTableItem, DataTableMonad, DataTableRow, Monad} from './types';

const getColumn = (k: number|string, x: DataTableConstructor): DataPoint[] => {
  const indexKey = typeof k === 'number' ? k : x[0].indexOf(k);
  return indexKey === -1 ? [] :
                           x.map((a: DataTableItem): DataPoint => a[indexKey]);
};

const getDataRows = (x: DataTableConstructor): DataTableDataRows =>
    x.filter((a: DataTableItem, i: number) => i !== 0);

const getDataHeader = (x: DataTableConstructor): DataTableHeader => x[0];
const getEmptyTable = (x: DataTableConstructor): DataTableConstructor => [x[0]];
const getIndicesByHeader = (a: DataTableHeader, b: DataTableHeader): number[] =>
    a.reduce(
        (acc: number[], cur: string|number, i: number) =>
            b.includes(cur) ? acc.concat([i]) : acc,
        []);

const filterRowByIndices = (a: DataTableRow, b: number[]) =>
    a.filter((c: DataPoint, i: number) => b.includes(i));

const filterColumns =
    (x: DataTableConstructor,
     f: (value: DataPoint, index: number, array: DataPoint[]) => unknown) => {
      const headerList = getDataHeader(x).filter(f);
      const indices: number[] =
          getIndicesByHeader(getDataHeader(x), headerList);
      return [headerList].concat(getDataRows(x).map(
          (b: DataTableRow) => filterRowByIndices(b, indices)));
    };

const getThString = (a: DataPoint): string => `<th>${a}</th>`;
const getTdString = (a: DataPoint): string => `<td>${a}</td>`;
const getTrString = (a: DataTableRow): string =>
    `            <tr>${a.map(getTdString).join('')}</tr>`;

const generateHtmlTable = (x: DataTableConstructor) => `
    <table>
        <thead>
            <tr>${getDataHeader(x).map(getThString).join('')}</tr>
        </thead>
        <tbody>
${getDataRows(x).map(getTrString).join('\n')}
        </tbody>
    </table>`;

const DataTable = (x: DataTableConstructor): DataTableMonad => ({
  map: (f: Function): DataTableMonad => DataTable(f(x)),
  chain: <T>(f: Function): T => f(x),
  ap: (y: Monad): Monad => y.map(x),
  inspect: (): string => `DataTable(${x})`,
  join: (): DataTableConstructor => x,
  head: (): DataTableRow => (Array.isArray(x) && x.length ? x[1] : []),
  tail: (): DataTableRow => Array.isArray(x) && x.length ? x[x.length - 1] : [],
  isEmpty: (): boolean => Boolean(!Array.isArray(x) || x.length < 2),
  append: (r: DataTableRow): DataTableMonad => DataTable(x.concat([r])),
  prepend: (r: DataTableRow): DataTableMonad =>
      DataTable([x[0]].concat([r]).concat(
          x.filter((y: DataTableItem, i: number) => i !== 0))),
  header: (): DataTableHeader => x[0],
  column: (k: number|string): DataTableColumn => getColumn(k, x),
  col: (k: number|string): DataTableColumn => getColumn(k, x),
  columns: (kn: Array<number|string>) =>
      kn.map((a: string|number) => getColumn(a, x)),
  cols: (kn: Array<number|string>) =>
      kn.map((a: string|number) => getColumn(a, x)),
  row: (i: number): DataTableRow => x[i + 1],
  rows: (l: number[]): DataTableDataRows => l.map((a: number) => x[a + 1]),
  filter:
      (f: (value: Array<string|number>, index: number,
           array: Array<Array<string|number>>) => unknown): DataTableMonad =>
          DataTable(getEmptyTable(x).concat(getDataRows(x).filter(f))),
  filterCols:
      (f: (value: DataPoint, index: number, array: DataPoint[]) => unknown):
          DataTableMonad => DataTable(filterColumns(x, f)),
  obj: <T extends object>(): T[] => getDataRows(x).map(
      (row: DataTableRow) => getDataHeader(x).reduce(
          (acc: T, a: DataPoint, i: number) => ({
            ...acc,
            ...{
              [a || i]: row[i]
            }
          }),
          {} as T)),
  html: (): string => generateHtmlTable(x)
});

const dtTypeError = <T>(x: T): DataTableMonad => {
  console.error(
      'DataTable must be passed parameters that adhere to the documented type. Value that was passed:',
      x);

  return DataTable([['Error', 'There was a DataTable type error.']]);
};

const DataTableOf = (x: DataTableConstructor): DataTableMonad =>
    Array.isArray(x) ? DataTable(x) : dtTypeError(x);

const exportDataTable = {
  of: DataTableOf
};

export {exportDataTable as DataTable};
