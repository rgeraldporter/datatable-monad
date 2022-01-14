export interface Monad {
  map: Function;
  chain: Function;
  join: Function;
  inspect(): string;
  ap: Function;
}

export type DataPoint = string|number;

export type DataTableHeader = DataPoint[];
export type DataTableItem = DataTableRow|DataTableHeader;
export type DataTableRow = DataPoint[];
export type DataTableDataRows = DataTableRow[];

export type DataTableConstructor = DataPoint[][];
export type DataTableColumn = DataPoint[];

export interface DataTableMonad extends Monad {
  append: Function;
  prepend: Function;
  header: Function;
  column: Function;
  col: Function;
  columns: Function;
  cols: Function;
  row: Function;
  rows: Function;
  head: Function;
  tail: Function;
  isEmpty: Function;
  obj: Function;
  filter: Function;
  filterCols: Function;
  html: Function;
}
