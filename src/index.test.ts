import { DataTable } from './index';
import {
    Monad,
    DataTableConstructor,
    DataTableHeader,
    DataTableRow,
    DataPoint,
    DataTableMonad,
    DataTableItem
} from './types';

describe('The DataTable monad', () => {
    it('should satisfy the first monad law of left identity', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4]
        ];

        // more complex than usual as this is a typed monad; need a function that adheres to type restrictions
        const f = (a: DataTableConstructor): DataTableMonad =>
            DataTable.of(
                // @ts-ignore
                a.map(
                    (b: DataTableItem, i: number): DataTableItem =>
                        // @ts-ignore
                        i > 0 ? b.map((c: number): number => c + 1) : b
                )
            );

        // 1. unit = DataTable; unit(x).chain(f) ==== f(x); DataTable(x).chain(f) ==== f(x)
        const leftIdentity1 = DataTable.of(a).chain(f);
        const leftIdentity2 = f(a);

        expect(leftIdentity1.join()).toEqual(leftIdentity2.join());

        const g = (a: DataTableConstructor): DataTableMonad =>
            // @ts-ignore
            DataTable.of(a.concat([[5, 4, 3]]));

        // 1. unit = DataTable; unit(x).chain(f) ==== f(x); DataTable(x).chain(f)
        const leftIdentity3 = DataTable.of(a).chain(g);
        const leftIdentity4 = g(a);

        expect(leftIdentity3.join()).toEqual(leftIdentity4.join());
    });

    it('should satisfy the second monad law of right identity', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4]
        ];

        const rightIdentity1 = DataTable.of(a).chain(DataTable.of);
        const rightIdentity2 = DataTable.of(a);

        // 2. unit = DataTable; m = DataTable.of(a); m.chain(unit) ==== m;
        expect(rightIdentity1.join()).toEqual(rightIdentity2.join());
    });

    it('should satisfy the third monad law of associativity', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4]
        ];

        const g = (a: DataTableConstructor): DataTableMonad =>
            // @ts-ignore
            DataTable.of(a.concat([[5, 4, 3]]));
        const f = (a: DataTableConstructor): DataTableMonad =>
            // @ts-ignore
            DataTable.of(a.concat([[122, 2, 99]]));

        // 3. m = DataTable.of(a); m.chain(f).chain(g) ==== m.chain(x => f(x).chain(g))
        const associativityA = DataTable.of(a)
            .chain(g)
            .chain(f);
        const associativityB = DataTable.of(a).chain(
            (x: DataTableConstructor) => g(x).chain(f)
        );

        expect(associativityA.join()).toEqual(associativityB.join());
    });

    it('should be able to return the head row', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4]
        ];

        const dt = DataTable.of(a);

        expect(dt.head()).toEqual([1, 2, 3]);
    });

    it('should be able to return the tail row', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4]
        ];

        const dt = DataTable.of(a);

        expect(dt.tail()).toEqual([2, 3, 4]);
    });

    it('should be able to return the nth row by index', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const dt = DataTable.of(a);

        expect(dt.row(1)).toEqual([2, 3, 4]);
    });

    it('should be able to return the an array of nth rows by index', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const dt = DataTable.of(a);

        expect(dt.rows([0, 2])).toEqual([[1, 2, 3], [4, 4, 4]]);
    });

    it('should be able to return the nth column', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const dt = DataTable.of(a);

        expect(dt.col(1)).toEqual(['Column 2', 2, 3, 4]);
    });

    it('should be able to return an array of nth columns', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const dt = DataTable.of(a);

        expect(dt.cols([0, 'Column 3'])).toEqual([
            ['Column 1', 1, 2, 4],
            ['Column 3', 3, 4, 4]
        ]);
    });

    it('should be able to append a row', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const a2: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4],
            [5, 5, 6]
        ];

        const dt = DataTable.of(a);

        expect(dt.append([5, 5, 6]).join()).toEqual(a2);
    });

    it('should be able to prepend a row', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const a2: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [0, 5, 9],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const dt = DataTable.of(a);

        expect(dt.prepend([0, 5, 9]).join()).toEqual(a2);
    });

    it('should be able to filter a table by rows', () => {
        const a: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const a2: DataTableConstructor = [
            ['Column 1', 'Column 2', 'Column 3'],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const filterFn = (a: DataTableRow) => a.includes(4);

        const dt = DataTable.of(a);

        expect(dt.filter(filterFn).join()).toEqual(a2);
    });

    it('should be able to filter a table by columns', () => {
        const a: DataTableConstructor = [
            ['A', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const a2: DataTableConstructor = [
            ['Column 2', 'Column 3'],
            [2, 3],
            [3, 4],
            [4, 4]
        ];

        const filterFn = (a: string) => a.includes('Column');

        const dt = DataTable.of(a);

        expect(dt.filterCols(filterFn).join()).toEqual(a2);
    });

    it('should be able to convert to an array of objects', () => {
        const a: DataTableConstructor = [
            ['Col1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const a2: object[] = [
            { Col1: 1, 'Column 2': 2, 'Column 3': 3 },
            { Col1: 2, 'Column 2': 3, 'Column 3': 4 },
            { Col1: 4, 'Column 2': 4, 'Column 3': 4 }
        ];

        const dt = DataTable.of(a);

        expect(dt.obj()).toEqual(a2);
    });

    it('should be able to convert to an HTML table', () => {
        const a: DataTableConstructor = [
            ['Col1', 'Column 2', 'Column 3'],
            [1, 2, 3],
            [2, 3, 4],
            [4, 4, 4]
        ];

        const a2 = `
    <table>
        <thead>
            <tr><th>Col1</th><th>Column 2</th><th>Column 3</th></tr>
        </thead>
        <tbody>
            <tr><td>1</td><td>2</td><td>3</td></tr>
            <tr><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>4</td><td>4</td><td>4</td></tr>
        </tbody>
    </table>`;

        const dt = DataTable.of(a);

        expect(dt.html()).toEqual(a2);
    });
});
