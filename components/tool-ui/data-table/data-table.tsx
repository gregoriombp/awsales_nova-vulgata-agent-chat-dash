"use client";

import * as React from "react";
import {
  cn,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AwInput,
  Icon,
} from "./_adapter";
import {
  filterData,
  sortData,
  createDataTableRowKeys,
  getDataTableMobileDescriptionId,
} from "./utilities";
import { renderFormattedValue } from "./formatters";
import type {
  DataTableProps,
  DataTableContextValue,
  RowData,
  DataTableRowData,
  ColumnKey,
  Column,
} from "./types";
import type { FormatConfig } from "./formatters";

export const DEFAULT_LOCALE = "en-US" as const;

function isNumericFormat(format?: FormatConfig): boolean {
  const kind = format?.kind;
  return (
    kind === "number" ||
    kind === "currency" ||
    kind === "percent" ||
    kind === "delta"
  );
}

function getAlignmentClass(
  align?: "left" | "right" | "center",
): string | undefined {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return undefined;
}

const DataTableContext = React.createContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataTableContextValue<any> | undefined
>(undefined);

export function useDataTable<T extends object = RowData>() {
  const context = React.use(DataTableContext) as
    | DataTableContextValue<T>
    | undefined;
  if (!context) {
    throw new Error("useDataTable must be used within <DataTable.Provider />");
  }
  return context;
}

type DataTableLayout = "auto" | "table" | "cards";

type DataTableBaseProps<T extends object = RowData> = DataTableProps<T> & {
  layout: DataTableLayout;
};

type DataTableProviderProps<T extends object = RowData> = Pick<
  DataTableProps<T>,
  | "columns"
  | "data"
  | "rowIdKey"
  | "defaultSort"
  | "sort"
  | "onSortChange"
  | "id"
  | "locale"
  | "filter"
  | "defaultFilterValue"
  | "filterValue"
  | "onFilterChange"
  | "pagination"
  | "defaultPageIndex"
  | "pageIndex"
  | "onPageChange"
> & {
  children: React.ReactNode;
};

function DataTableProvider<T extends object = RowData>({
  columns,
  data: rawData,
  rowIdKey,
  defaultSort,
  sort: controlledSort,
  id,
  onSortChange,
  locale,
  filter,
  defaultFilterValue,
  filterValue: controlledFilterValue,
  onFilterChange,
  pagination,
  defaultPageIndex,
  pageIndex: controlledPageIndex,
  onPageChange,
  children,
}: DataTableProviderProps<T>) {
  // Default locale avoids SSR/client formatting mismatches.
  const resolvedLocale = locale ?? DEFAULT_LOCALE;

  const [internalSortBy, setInternalSortBy] = React.useState<
    ColumnKey<T> | undefined
  >(defaultSort?.by);
  const [internalSortDirection, setInternalSortDirection] = React.useState<
    "asc" | "desc" | undefined
  >(defaultSort?.direction);

  const sortBy = controlledSort?.by ?? internalSortBy;
  const sortDirection = controlledSort?.direction ?? internalSortDirection;

  const filterEnabled = filter !== undefined;
  const [internalFilterValue, setInternalFilterValue] = React.useState<string>(
    defaultFilterValue ?? "",
  );
  const filterValue =
    controlledFilterValue !== undefined
      ? controlledFilterValue
      : filterEnabled
        ? internalFilterValue
        : "";

  const paginationEnabled = pagination !== undefined;
  const initialPageSize = pagination?.pageSize ?? (rawData.length || 1);
  const [pageSize, setPageSize] = React.useState<number>(initialPageSize);
  const [internalPageIndex, setInternalPageIndex] = React.useState<number>(
    defaultPageIndex ?? 0,
  );
  const pageIndex =
    controlledPageIndex !== undefined
      ? controlledPageIndex
      : paginationEnabled
        ? internalPageIndex
        : 0;

  const filterKeys = React.useMemo<Array<ColumnKey<T>>>(() => {
    if (!filterEnabled) return [];
    const explicit = filter?.columns;
    if (explicit && explicit.length > 0) return explicit;
    return columns.map((col) => col.key as ColumnKey<T>);
  }, [filterEnabled, filter, columns]);

  const filteredData = React.useMemo(() => {
    if (!filterEnabled || !filterValue) return rawData;
    return filterData(rawData, filterValue, filterKeys as Array<Extract<keyof T, string>>);
  }, [rawData, filterEnabled, filterValue, filterKeys]);

  const sortedData = React.useMemo(() => {
    if (!sortBy || !sortDirection) return filteredData;
    return sortData(filteredData, sortBy, sortDirection, resolvedLocale);
  }, [filteredData, sortBy, sortDirection, resolvedLocale]);

  const pageCount = paginationEnabled
    ? Math.max(1, Math.ceil(sortedData.length / Math.max(1, pageSize)))
    : 1;

  // Clamp page index when filter shrinks data below the current page.
  React.useEffect(() => {
    if (!paginationEnabled) return;
    if (controlledPageIndex !== undefined) return;
    if (internalPageIndex >= pageCount) {
      setInternalPageIndex(Math.max(0, pageCount - 1));
    }
  }, [paginationEnabled, controlledPageIndex, internalPageIndex, pageCount]);

  const pagedData = React.useMemo(() => {
    if (!paginationEnabled) return sortedData;
    const clamped = Math.min(pageIndex, pageCount - 1);
    const start = Math.max(0, clamped) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [paginationEnabled, sortedData, pageIndex, pageCount, pageSize]);

  const handleSort = React.useCallback(
    (key: ColumnKey<T>) => {
      let newDirection: "asc" | "desc" | undefined;

      if (sortBy === key) {
        if (sortDirection === "asc") {
          newDirection = "desc";
        } else if (sortDirection === "desc") {
          newDirection = undefined;
        } else {
          newDirection = "asc";
        }
      } else {
        newDirection = "asc";
      }

      const next = {
        by: newDirection ? key : undefined,
        direction: newDirection,
      } as const;

      if (controlledSort) {
        onSortChange?.(next);
      } else {
        setInternalSortBy(next.by);
        setInternalSortDirection(next.direction);
      }
    },
    [sortBy, sortDirection, controlledSort, onSortChange],
  );

  const handleFilterChange = React.useCallback(
    (next: string) => {
      if (controlledFilterValue !== undefined) {
        onFilterChange?.(next);
      } else {
        setInternalFilterValue(next);
      }
      // Reset to first page when filter narrows the result.
      if (paginationEnabled) {
        if (controlledPageIndex !== undefined) {
          onPageChange?.(0);
        } else {
          setInternalPageIndex(0);
        }
      }
    },
    [
      controlledFilterValue,
      onFilterChange,
      paginationEnabled,
      controlledPageIndex,
      onPageChange,
    ],
  );

  const handlePageIndexChange = React.useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, pageCount - 1));
      if (controlledPageIndex !== undefined) {
        onPageChange?.(clamped);
      } else {
        setInternalPageIndex(clamped);
      }
    },
    [controlledPageIndex, onPageChange, pageCount],
  );

  const handlePageSizeChange = React.useCallback(
    (next: number) => {
      const sane = Math.max(1, Math.floor(next));
      setPageSize(sane);
      if (controlledPageIndex !== undefined) {
        onPageChange?.(0);
      } else {
        setInternalPageIndex(0);
      }
    },
    [controlledPageIndex, onPageChange],
  );

  const contextValue: DataTableContextValue<T> = {
    columns,
    data: pagedData,
    totalRows: sortedData.length,
    rowIdKey,
    sortBy,
    sortDirection,
    toggleSort: handleSort,
    id,
    locale: resolvedLocale,
    filterEnabled,
    filterValue,
    filterPlaceholder: filter?.placeholder,
    setFilterValue: handleFilterChange,
    paginationEnabled,
    pageIndex,
    pageSize,
    pageCount,
    pageSizeOptions: pagination?.pageSizeOptions,
    setPageIndex: handlePageIndexChange,
    setPageSize: handlePageSizeChange,
  };

  return (
    <DataTableContext.Provider value={contextValue}>
      {children}
    </DataTableContext.Provider>
  );
}

interface DataTableLayoutProps {
  layout: DataTableLayout;
  emptyMessage: string;
  maxHeight?: string;
  className?: string;
}

function DataTableLayout({
  layout,
  emptyMessage,
  maxHeight,
  className,
}: DataTableLayoutProps) {
  const {
    columns,
    data,
    rowIdKey,
    sortBy,
    sortDirection,
    id,
    filterEnabled,
    paginationEnabled,
  } = useDataTable();
  const rowKeys = React.useMemo(
    () =>
      createDataTableRowKeys(
        data as Array<Record<string, unknown>>,
        rowIdKey ? String(rowIdKey) : undefined,
      ),
    [data, rowIdKey],
  );
  const mobileDescriptionId = React.useMemo(
    () => getDataTableMobileDescriptionId(String(id ?? "data-table")),
    [id],
  );

  const sortAnnouncement = React.useMemo(() => {
    const col = columns.find((c) => c.key === sortBy);
    const label = col?.label ?? sortBy;
    return sortBy && sortDirection
      ? `Sorted by ${label}, ${sortDirection === "asc" ? "ascending" : "descending"}`
      : "";
  }, [columns, sortBy, sortDirection]);

  return (
    <div
      className={cn("@container flex w-full min-w-80 flex-col gap-3", className)}
      data-tool-ui-id={id}
      data-slot="data-table"
      data-layout={layout}
    >
      {filterEnabled && <DataTableToolbar />}
      <div
        className={cn(
          layout === "table"
            ? "block"
            : layout === "cards"
              ? "hidden"
              : "hidden @md:block",
        )}
      >
        <div className="relative">
          <div
            className={cn(
              "bg-bg-raised relative w-full overflow-clip overflow-y-auto rounded-lg border border-border",
              "touch-pan-x",
              maxHeight && "max-h-(--max-height)",
            )}
            style={
              maxHeight
                ? ({ "--max-height": maxHeight } as React.CSSProperties)
                : undefined
            }
          >
            <Table>
              {columns.length > 0 && (
                <colgroup>
                  {columns.map((col) => (
                    <col
                      key={String(col.key)}
                      style={col.width ? { width: col.width } : undefined}
                    />
                  ))}
                </colgroup>
              )}
              {data.length === 0 ? (
                <DataTableEmpty message={emptyMessage} />
              ) : (
                <DataTableContent />
              )}
            </Table>
          </div>
        </div>
      </div>

      <div
        className={cn(
          layout === "cards"
            ? ""
            : layout === "table"
              ? "hidden"
              : "@md:hidden",
        )}
        role="list"
        aria-label="Data table (mobile card view)"
        aria-describedby={mobileDescriptionId}
      >
        <div id={mobileDescriptionId} className="sr-only">
          Table data shown as expandable cards. Each card represents one row.
          {columns.length > 0 &&
            ` Columns: ${columns.map((c) => c.label).join(", ")}.`}
        </div>

        {data.length === 0 ? (
          <div className="text-fg-secondary py-8 text-center">
            {emptyMessage}
          </div>
        ) : (
          <div className="bg-bg-raised flex flex-col overflow-hidden rounded-xl border border-border">
            {data.map((row, i) => {
              const rowKey = rowKeys[i];
              return (
                <DataTableAccordionCard
                  key={rowKey}
                  row={row as unknown as DataTableRowData}
                  index={i}
                  rowKey={rowKey}
                  isFirst={i === 0}
                />
              );
            })}
          </div>
        )}
      </div>

      {paginationEnabled && <DataTablePagination />}

      {sortAnnouncement && (
        <div className="sr-only" aria-live="polite">
          {sortAnnouncement}
        </div>
      )}
    </div>
  );
}

function DataTableToolbar() {
  const { filterValue, filterPlaceholder, setFilterValue, id } = useDataTable();
  const inputId = `${String(id ?? "data-table")}-search`;

  return (
    <div className="flex w-full items-center gap-2">
      <label htmlFor={inputId} className="sr-only">
        Buscar
      </label>
      <AwInput
        id={inputId}
        type="search"
        iconLeft="search"
        placeholder={filterPlaceholder ?? "Buscar…"}
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        className="w-full max-w-xs"
      />
    </div>
  );
}

function DataTablePagination() {
  const {
    pageIndex,
    pageSize,
    pageCount,
    pageSizeOptions,
    totalRows,
    setPageIndex,
    setPageSize,
    id,
  } = useDataTable();

  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(totalRows, (pageIndex + 1) * pageSize);
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;
  const selectId = `${String(id ?? "data-table")}-page-size`;

  return (
    <div
      className="text-fg-secondary flex w-full flex-wrap items-center justify-between gap-3 text-sm"
      role="navigation"
      aria-label="Paginação da tabela"
    >
      <div aria-live="polite">
        {totalRows === 0 ? (
          "Sem resultados"
        ) : (
          <>
            <span className="text-fg-primary tabular-nums">{start}</span>
            {"–"}
            <span className="text-fg-primary tabular-nums">{end}</span>
            {" de "}
            <span className="text-fg-primary tabular-nums">{totalRows}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {pageSizeOptions && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor={selectId}>Linhas:</label>
            <select
              id={selectId}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border-border bg-bg-raised text-fg-primary h-8 rounded-md border px-2 text-sm"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={!canPrev}
            aria-label="Página anterior"
          >
            <Icon name="chevron_left" size={16} />
          </Button>
          <span className="px-2 tabular-nums" aria-live="polite">
            <span className="text-fg-primary">{pageIndex + 1}</span>
            {" / "}
            <span>{pageCount}</span>
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setPageIndex(pageIndex + 1)}
            disabled={!canNext}
            aria-label="Próxima página"
          >
            <Icon name="chevron_right" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DataTableBase<T extends object = RowData>(
  props: DataTableBaseProps<T>,
) {
  const {
    columns,
    data,
    rowIdKey,
    defaultSort,
    sort,
    onSortChange,
    id,
    locale,
    layout,
    emptyMessage = "No data available",
    maxHeight,
    className,
    filter,
    defaultFilterValue,
    filterValue,
    onFilterChange,
    pagination,
    defaultPageIndex,
    pageIndex,
    onPageChange,
  } = props;

  return (
    <DataTableProvider
      columns={columns}
      data={data}
      rowIdKey={rowIdKey}
      defaultSort={defaultSort}
      sort={sort}
      onSortChange={onSortChange}
      id={id}
      locale={locale}
      filter={filter}
      defaultFilterValue={defaultFilterValue}
      filterValue={filterValue}
      onFilterChange={onFilterChange}
      pagination={pagination}
      defaultPageIndex={defaultPageIndex}
      pageIndex={pageIndex}
      onPageChange={onPageChange}
    >
      <DataTableLayout
        layout={layout}
        emptyMessage={emptyMessage}
        maxHeight={maxHeight}
        className={className}
      />
    </DataTableProvider>
  );
}

function DataTableRoot<T extends object = RowData>(props: DataTableProps<T>) {
  return <DataTableBase {...props} layout="auto" />;
}

function DataTableTable<T extends object = RowData>(props: DataTableProps<T>) {
  return <DataTableBase {...props} layout="table" />;
}

function DataTableCards<T extends object = RowData>(props: DataTableProps<T>) {
  return <DataTableBase {...props} layout="cards" />;
}

type DataTableComponent = {
  <T extends object = RowData>(props: DataTableProps<T>): React.ReactElement;
  Table: typeof DataTableTable;
  Cards: typeof DataTableCards;
  Provider: typeof DataTableProvider;
};

export const DataTable = Object.assign(DataTableRoot, {
  Table: DataTableTable,
  Cards: DataTableCards,
  Provider: DataTableProvider,
}) as DataTableComponent;

function DataTableContent() {
  return (
    <>
      <DataTableHeader />
      <DataTableBody />
    </>
  );
}

function DataTableEmpty({ message }: { message: string }) {
  const { columns } = useDataTable();

  return (
    <TableBody>
      <TableRow className="bg-bg-raised h-24 text-center">
        <TableCell colSpan={columns.length} role="status" aria-live="polite">
          {message}
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

function SortIcon({ state }: { state?: "asc" | "desc" }) {
  let char = "⇅";
  let className = "opacity-20";

  if (state === "asc") {
    char = "↑";
    className = "";
  }

  if (state === "desc") {
    char = "↓";
    className = "";
  }

  return (
    <span aria-hidden className={cn("min-w-4 shrink-0 text-center", className)}>
      {char}
    </span>
  );
}

function DataTableHeader() {
  const { columns } = useDataTable();

  return (
    <TooltipProvider delayDuration={300}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((column, columnIndex) => (
            <DataTableHead
              key={column.key}
              column={column}
              columnIndex={columnIndex}
              totalColumns={columns.length}
            />
          ))}
        </TableRow>
      </TableHeader>
    </TooltipProvider>
  );
}

interface DataTableHeadProps {
  column: Column;
  columnIndex?: number;
  totalColumns?: number;
}

function DataTableHead({
  column,
  columnIndex = 0,
  totalColumns = 1,
}: DataTableHeadProps) {
  const { sortBy, sortDirection, toggleSort } = useDataTable();
  const isFirstColumn = columnIndex === 0;
  const isLastColumn = columnIndex === totalColumns - 1;

  const isSortable = column.sortable !== false;

  const isSorted = sortBy === column.key;
  const direction = isSorted ? sortDirection : undefined;
  const isDisabled = !isSortable;

  const handleClick = () => {
    if (!isDisabled && toggleSort) {
      toggleSort(column.key);
    }
  };

  const displayText = column.abbr || column.label;
  const shouldShowTooltip = column.abbr || displayText.length > 15;
  const isNumericKind = isNumericFormat(column.format);
  const align =
    column.align ??
    (columnIndex === 0 ? "left" : isNumericKind ? "right" : "left");
  const alignClass = getAlignmentClass(align);
  const buttonAlignClass = cn(
    "min-w-0 gap-1 font-normal",
    align === "right" && "text-right",
    align === "center" && "text-center",
    align === "left" && "text-left",
  );
  const labelAlignClass =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  return (
    <TableHead
      scope="col"
      className={cn(
        alignClass,
        isFirstColumn && "pl-1",
        isLastColumn && "pr-1",
      )}
      style={column.width ? { width: column.width } : undefined}
      aria-sort={
        isSorted
          ? direction === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
    >
      <Button
        type="button"
        size="sm"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (isDisabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        disabled={isDisabled}
        variant="ghost"
        className={cn(
          buttonAlignClass,
          "w-fit min-w-10",
          isFirstColumn && "pl-4",
          isLastColumn && "pr-4",
        )}
        aria-label={
          `Sort by ${column.label}` +
          (isSorted && direction
            ? ` (${direction === "asc" ? "ascending" : "descending"})`
            : "")
        }
        aria-disabled={isDisabled || undefined}
      >
        {shouldShowTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("truncate", labelAlignClass)}>
                {column.abbr ? (
                  <abbr
                    title={column.label}
                    className={cn(
                      "cursor-help border-b border-dotted border-current no-underline",
                      labelAlignClass,
                    )}
                  >
                    {column.abbr}
                  </abbr>
                ) : (
                  <span className={labelAlignClass}>{column.label}</span>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{column.label}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className={cn("truncate", labelAlignClass)}>
            {column.label}
          </span>
        )}
        {isSortable && <SortIcon state={direction} />}
      </Button>
    </TableHead>
  );
}

function DataTableBody() {
  const { data, rowIdKey } = useDataTable<DataTableRowData>();
  const rowKeys = React.useMemo(
    () =>
      createDataTableRowKeys(
        data as Array<Record<string, unknown>>,
        rowIdKey ? String(rowIdKey) : undefined,
      ),
    [data, rowIdKey],
  );
  const hasWarnedRowKeyRef = React.useRef(false);

  React.useEffect(() => {
    if (hasWarnedRowKeyRef.current) return;
    if (process.env.NODE_ENV !== "production" && !rowIdKey && data.length > 0) {
      hasWarnedRowKeyRef.current = true;
      console.warn(
        "[DataTable] Missing `rowIdKey` prop. Falling back to inferred/content-derived row keys. " +
          "Strongly recommended: Pass a `rowIdKey` prop that points to a unique identifier in your row data (e.g., 'id', 'uuid', 'symbol').\n" +
          'Example: <DataTable rowIdKey="id" columns={...} data={...} />',
      );
    }
  }, [rowIdKey, data.length]);

  return (
    <TableBody>
      {data.map((row, index) => {
        const rowKey = rowKeys[index];
        return <DataTableRow key={rowKey} row={row} />;
      })}
    </TableBody>
  );
}

interface DataTableRowProps {
  row: DataTableRowData;
  className?: string;
}

function DataTableRow({ row, className }: DataTableRowProps) {
  const { columns } = useDataTable();

  return (
    <TableRow className={className}>
      {columns.map((column, columnIndex) => (
        <DataTableCell
          key={column.key}
          value={row[column.key]}
          column={column}
          row={row}
          columnIndex={columnIndex}
        />
      ))}
    </TableRow>
  );
}

interface DataTableCellProps {
  value:
    | string
    | number
    | boolean
    | null
    | (string | number | boolean | null)[];
  column: Column;
  row: DataTableRowData;
  className?: string;
  columnIndex?: number;
}

function DataTableCell({
  value,
  column,
  row,
  className,
  columnIndex = 0,
}: DataTableCellProps) {
  const { locale } = useDataTable();
  const isNumericKind = isNumericFormat(column.format);
  const isNumericValue = typeof value === "number";
  const displayValue = renderFormattedValue({ value, column, row, locale });
  const align =
    column.align ??
    (columnIndex === 0
      ? "left"
      : isNumericKind || isNumericValue
        ? "right"
        : "left");
  const alignClass = getAlignmentClass(align);

  return (
    <TableCell className={cn("px-5 py-3", alignClass, className)}>
      {displayValue}
    </TableCell>
  );
}

function categorizeColumns(columns: Column[]) {
  const primary: Column[] = [];
  const secondary: Column[] = [];

  let visibleColumnCount = 0;
  columns.forEach((col) => {
    if (col.hideOnMobile) return;

    if (col.priority === "primary") {
      primary.push(col);
    } else if (col.priority === "secondary") {
      secondary.push(col);
    } else if (col.priority === "tertiary") {
      return;
    } else {
      if (visibleColumnCount < 2) {
        primary.push(col);
      } else {
        secondary.push(col);
      }
      visibleColumnCount++;
    }
  });

  return { primary, secondary };
}

interface DataTableAccordionCardProps {
  row: DataTableRowData;
  index: number;
  rowKey: string;
  isFirst?: boolean;
}

function getDataTableRowDomId(rowKey: string): string {
  return encodeURIComponent(rowKey).replace(/%/g, "_");
}

function DataTableAccordionCard({
  row,
  index,
  rowKey,
  isFirst = false,
}: DataTableAccordionCardProps) {
  const { columns, locale } = useDataTable();

  const { primary, secondary } = React.useMemo(
    () => categorizeColumns(columns),
    [columns],
  );

  if (secondary.length === 0) {
    return (
      <SimpleCard
        row={row}
        columns={primary}
        index={index}
        rowKey={rowKey}
        isFirst={isFirst}
      />
    );
  }

  const primaryColumn = primary[0];
  const remainingPrimaryColumns = primary.slice(1);

  const stableRowId = getDataTableRowDomId(rowKey);

  const headingId = `row-${stableRowId}-heading`;
  const detailsId = `row-${stableRowId}-details`;
  const remainingPrimaryDataIds = remainingPrimaryColumns.map(
    (col) => `row-${stableRowId}-${String(col.key)}`,
  );

  const primaryValue = primaryColumn
    ? String(row[primaryColumn.key] ?? "")
    : "";
  const rowLabel = `Row ${index + 1}: ${primaryValue}`;
  const accordionItemId = `row-${stableRowId}`;

  return (
    <Accordion
      type="single"
      collapsible
      className={cn(!isFirst && "border-t")}
      role="listitem"
      aria-label={rowLabel}
    >
      <AccordionItem value={accordionItemId} className="group border-0">
        <AccordionTrigger
          className="hover:group-data-[state=closed]:bg-bg-surface active:bg-bg-surface group-data-[state=open]:bg-bg-surface w-full rounded-none px-4 py-3 hover:no-underline"
          aria-controls={detailsId}
          aria-label={`${rowLabel}. ${secondary.length > 0 ? "Expand for details" : ""}`}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {primaryColumn && (
              <div
                id={headingId}
                role="heading"
                aria-level={3}
                className="truncate"
                aria-label={`${primaryColumn.label}: ${row[primaryColumn.key]}`}
              >
                {renderFormattedValue({
                  value: row[primaryColumn.key],
                  column: primaryColumn,
                  row,
                  locale,
                })}
              </div>
            )}

            {remainingPrimaryColumns.length > 0 && (
              <div
                className="text-fg-secondary flex w-full flex-wrap gap-x-4 gap-y-0.5"
                role="group"
                aria-label="Summary information"
              >
                {remainingPrimaryColumns.map((col, idx) => (
                  <span
                    key={col.key}
                    id={remainingPrimaryDataIds[idx]}
                    className="flex min-w-0 gap-1 font-normal"
                    role="cell"
                    aria-label={`${col.label}: ${row[col.key]}`}
                  >
                    <span className="sr-only">{col.label}:</span>
                    <span aria-hidden="true">{col.label}:</span>
                    <span className="truncate">
                      {renderFormattedValue({
                        value: row[col.key],
                        column: col,
                        row,
                        locale,
                      })}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent
          className={"flex flex-col gap-4 px-4 pb-4"}
          id={detailsId}
          role="region"
          aria-labelledby={headingId}
        >
          {secondary.length > 0 && (
            <dl
              className={cn(
                "flex flex-col gap-2 pt-4",
                "motion-safe:group-data-[state=open]:animate-in motion-safe:group-data-[state=open]:fade-in-0",
                "motion-safe:group-data-[state=open]:slide-in-from-top-1",
                "motion-safe:group-data-[state=closed]:animate-out motion-safe:group-data-[state=closed]:fade-out-0",
                "motion-safe:group-data-[state=closed]:slide-out-to-top-1",
                "duration-150",
              )}
              role="list"
              aria-label="Additional data"
            >
              {secondary.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-4"
                  role="listitem"
                >
                  <dt
                    className="text-fg-secondary shrink-0"
                    id={`row-${stableRowId}-${String(col.key)}-label`}
                  >
                    {col.label}
                  </dt>
                  <dd
                    className={cn(
                      "text-fg-primary min-w-0 text-pretty wrap-break-word",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                    )}
                    role="cell"
                    aria-labelledby={`row-${stableRowId}-${String(col.key)}-label`}
                  >
                    {renderFormattedValue({
                      value: row[col.key],
                      column: col,
                      row,
                      locale,
                    })}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Simple card with no accordion,   for when there are only primary columns
 */
function SimpleCard({
  row,
  columns,
  index,
  rowKey,
  isFirst = false,
}: {
  row: DataTableRowData;
  columns: Column[];
  index: number;
  rowKey: string;
  isFirst?: boolean;
}) {
  const { locale } = useDataTable();
  const primaryColumn = columns[0];
  const otherColumns = columns.slice(1);

  const stableRowId = getDataTableRowDomId(rowKey);

  const primaryValue = primaryColumn
    ? String(row[primaryColumn.key] ?? "")
    : "";
  const rowLabel = `Row ${index + 1}: ${primaryValue}`;

  return (
    <div
      className={cn("flex flex-col gap-2 p-4", !isFirst && "border-t")}
      role="listitem"
      aria-label={rowLabel}
    >
      {primaryColumn && (
        <div
          role="heading"
          aria-level={3}
          aria-label={`${primaryColumn.label}: ${row[primaryColumn.key]}`}
        >
          {renderFormattedValue({
            value: row[primaryColumn.key],
            column: primaryColumn,
            row,
            locale,
          })}
        </div>
      )}

      {otherColumns.map((col) => (
        <div
          key={col.key}
          className="flex items-start justify-between gap-4"
          role="group"
        >
          <span
            className="text-fg-secondary"
            id={`row-${stableRowId}-${String(col.key)}-label`}
          >
            {col.label}:
          </span>
          <span
            className={cn(
              "min-w-0 wrap-break-word",
              col.align === "right" && "text-right",
              col.align === "center" && "text-center",
            )}
            role="cell"
            aria-labelledby={`row-${stableRowId}-${String(col.key)}-label`}
          >
            {renderFormattedValue({
              value: row[col.key],
              column: col,
              row,
              locale,
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
