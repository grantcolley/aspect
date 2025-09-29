import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { useAuth0 } from "@auth0/auth0-react";
import { ModelTable } from "@/components/generic/model-table";
import { GetData } from "@/requests/fetch-generic-data";
import { useRoutesContext, type ApiPage } from "@/context/routes-context";
import { Button } from "@/components/ui/button";
import { COMPONENTS, COMPONENT_ARGS } from "shared/src/constants/constants";
import { ParseKeyValueString } from "shared/src/utils/string-util";

export type GenericModelTableProps = { args: string };

type RawRow = Record<string, unknown>; // We don't know the shape yet

export default function GenericModelTable({ args }: GenericModelTableProps) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [error, setError] = useState<Error | null>(null);
  const [columns, setColumns] = useState<ColumnDef<RawRow>[]>([]);
  const [data, setData] = useState<RawRow[]>([]);
  const { addApiPage } = useRoutesContext();
  const location = useLocation();
  const parsedArgs = ParseKeyValueString(args);
  const identityFieldName = parsedArgs[COMPONENT_ARGS.MODEL_IDENTITY_FIELD];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          const json = await GetData(token, location.pathname);

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

          const page: ApiPage = {
            pageId: Date.now(), // Temporary unique ID to millisecond,
            path: location.pathname + "/:id",
            component: COMPONENTS.GENERIC_MODEL_FORM,
            args: args,
          };

          addApiPage(page);
        }
      } catch (err) {
        setError(err as Error); // Capture error to rethrow in render
      }
    };

    fetchData();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (error) {
    // This makes it rethrow error from useEffect during render,
    // which React Router will catch and show errorElement
    throw error;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="container mx-auto py-10 px-4">
        <ModelTable columns={columns} data={data} />
      </div>
    </div>
  );
}
