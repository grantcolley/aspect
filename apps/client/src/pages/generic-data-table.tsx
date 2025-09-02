import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { useAuth0 } from "@auth0/auth0-react";
import { DataTable } from "@/components/generic/data-table";
import { fetchGenericRecordData } from "@/requests/fetch-generic-record-data";
import { Button } from "@/components/ui/button";

export type GenericDataTableProps = { args: string };

type RawRow = Record<string, unknown>; // We don't know the shape yet

export default function GenericDataTable({ args }: GenericDataTableProps) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const location = useLocation();
  const [data, setData] = useState<RawRow[]>([]);
  const [columns, setColumns] = useState<ColumnDef<RawRow>[]>([]);

  const identityFieldName = args;

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        const json = await fetchGenericRecordData(token, location.pathname);

        // Dynamically infer column definitions from the first row
        const keys = Object.keys(json[0] ?? {});

        const inferredColumns: ColumnDef<RawRow>[] = keys.map((key) => ({
          accessorKey: key,
          header: key.toUpperCase(),
          cell: (info) => String(info.getValue() ?? ""),
        }));

        inferredColumns.push({
          id: "actions",
          header: "Edit",
          cell: ({ row }) => {
            const rowId = row.original[identityFieldName];
            return (
              <Button variant="ghost" size="icon" className="size-8">
                <Link to={`${location.pathname}/${rowId}`}>...</Link>
              </Button>
            );
          },
        });

        setData(json);
        setColumns(inferredColumns);
      }
    };

    fetchData();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="container mx-auto py-10 px-4">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
