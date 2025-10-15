import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ModelForm } from "@/components/generic/model-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DeleteData,
  GetData,
  PostData,
  PutData,
} from "@/requests/fetch-generic-data";
import { getClass, getSchema } from "shared/src/decorators/model-registry";
import {
  ParseKeyValueString,
  RemoveLastPathSegment,
  GetLastPathSegment,
  IsNewModel,
} from "shared/src/utils/string-util";
import { COMPONENT_ARGS } from "shared/src/constants/constants";

export type GenericModelFormProps = { args: string };

type RawRow = Record<string, any>; // We don't know the shape yet

export default function GenericModelForm({ args }: GenericModelFormProps) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<RawRow | any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<RawRow | null>(
    null
  );

  const location = useLocation();
  const navigate = useNavigate();

  const parsedArgs = ParseKeyValueString(args);
  const model = parsedArgs[COMPONENT_ARGS.MODEL_NAME];
  const cls = model ? getClass(model) : null;
  const schema = cls ? getSchema(cls) : null;

  if (!cls) return <div>No {model} model registered!</div>;

  const idValue = GetLastPathSegment(location.pathname);
  const isNew = !idValue || IsNewModel(idValue);

  const identityField = parsedArgs[COMPONENT_ARGS.MODEL_IDENTITY_FIELD] || "";

  const hiddenFields = parsedArgs[COMPONENT_ARGS.MODEL_HIDDEN_FIELDS]
    ? parsedArgs[COMPONENT_ARGS.MODEL_HIDDEN_FIELDS]
        .split(",")
        .map((s) => s.trim())
    : [];

  const readOnlyFields = parsedArgs[COMPONENT_ARGS.MODEL_READONLY_FIELDS]
    ? parsedArgs[COMPONENT_ARGS.MODEL_READONLY_FIELDS]
        .split(",")
        .map((s) => s.trim())
    : [];

  if (isNew && identityField && !hiddenFields.includes(identityField)) {
    // Ensure identity field is hidden or read-only when creating new item
    hiddenFields.push(identityField);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          const json = await GetData(token, location.pathname);

          setData(json);
        }
      } catch (err) {
        setError(err as Error); // Capture error to rethrow in render
      }
    };

    if (!isNew) {
      fetchData();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleCreate = async (item: RawRow) => {
    try {
      if (isAuthenticated && isNew) {
        const createPath = RemoveLastPathSegment(location.pathname);
        const token = await getAccessTokenSilently();
        const json = await PostData(token, createPath, item);

        setData(json);

        const newId = (json as Record<string, any>)?.[identityField];

        const newPath = `${createPath}/${newId}`;
        navigate(newPath, { replace: true });
      }
    } catch (err) {
      setError(err as Error); // Capture error to rethrow in render
    }
  };

  const handleUpdate = async (item: RawRow) => {
    try {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        const json = await PutData(token, location.pathname, item);

        setData(json);
      }
    } catch (err) {
      setError(err as Error); // Capture error to rethrow in render
    }
  };

  const handleDelete = (item: RawRow) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setPendingDeleteItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteItem) return;
    try {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        await DeleteData(token, location.pathname);

        // Strip the last segment of the path (e.g. /permissions/123 → /permissions)
        const parentPath =
          location.pathname.split("/").slice(0, -1).join("/") || "/";

        navigate(parentPath);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setShowDeleteDialog(false);
      setPendingDeleteItem(null);
    }
  };

  if (error) {
    // This makes it rethrow error from useEffect during render,
    // which React Router will catch and show errorElement
    throw error;
  }

  const identityValue =
    pendingDeleteItem?.[identityField] || data?.[identityField];

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <div className="container mx-auto py-4 px-4">
          {cls && schema && (
            <ModelForm
              key={data?.[identityField]}
              schema={schema}
              cls={cls}
              item={data}
              hiddenFields={hiddenFields}
              readOnlyFields={readOnlyFields}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete {model}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{model}</strong>
              {identityValue ? ` with ID “${identityValue}”` : ""}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
